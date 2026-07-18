import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Sale, SaleStatus } from '../sales/entities/sale.entity';
import { Product } from '../products/entities/product.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Proforma, ProformaStatus } from '../proformas/entities/proforma.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Proforma)
    private proformaRepository: Repository<Proforma>,
  ) {}

  async getOverview(userId?: string) {
    const whereClause = userId ? { createdBy: userId } : {};

    const [
      totalSales,
      completedSales,
      pendingSales,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      pendingProformas,
    ] = await Promise.all([
      this.saleRepository.count({ where: whereClause }),
      this.saleRepository.count({ where: { ...whereClause, status: SaleStatus.COMPLETED } }),
      this.saleRepository.count({ where: { ...whereClause, status: SaleStatus.PENDING } }),
      this.customerRepository.count(userId ? { where: { createdBy: userId } } : {}),
      this.productRepository.count(userId ? { where: { createdBy: userId } } : {}),
      this.inventoryRepository
        .createQueryBuilder('inventory')
        .where('inventory.availableQuantity <= 10')
        .getCount(),
      this.proformaRepository.count({ 
        where: { 
          ...(userId ? { createdBy: userId } : {}),
          status: ProformaStatus.DRAFT 
        } 
      }),
    ]);

    return {
      totalSales,
      completedSales,
      pendingSales,
      cancelledSales: totalSales - completedSales - pendingSales,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      pendingProformas,
    };
  }

  async getSalesMetrics(userId?: string, startDate?: Date, endDate?: Date) {
    const queryBuilder = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.details', 'details');

    if (userId) {
      queryBuilder.where('sale.createdBy = :userId', { userId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('sale.saleDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const sales = await queryBuilder.getMany();

    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const totalPaid = sales.reduce((sum, sale) => sum + Number(sale.paidAmount), 0);
    const totalPending = totalRevenue - totalPaid;

    const avgSaleValue = sales.length > 0 ? totalRevenue / sales.length : 0;

    return {
      totalSales: sales.length,
      totalRevenue,
      totalPaid,
      totalPending,
      avgSaleValue,
    };
  }



  async getTopProducts(userId?: string, limit: number = 10) {
    const queryBuilder = this.saleRepository
      .createQueryBuilder('sale')
      .innerJoin('sale.details', 'details')
      .innerJoin('details.product', 'product')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('product.code', 'productCode')
      .addSelect('SUM(details.quantity)', 'totalQuantity')
      .addSelect('SUM(details.total)', 'totalRevenue')
      .addSelect('COUNT(DISTINCT sale.id)', 'salesCount')
      .where('sale.status = :status', { status: SaleStatus.COMPLETED })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .addGroupBy('product.code')
      .orderBy('"totalRevenue"', 'DESC')
      .limit(limit);

    if (userId) {
      queryBuilder.andWhere('sale.createdBy = :userId', { userId });
    }

    return await queryBuilder.getRawMany();
  }



  async getTopCustomers(userId?: string, limit: number = 10) {
    const queryBuilder = this.saleRepository
      .createQueryBuilder('sale')
      .innerJoin('sale.customer', 'customer')
      .select('customer.id', 'customerId')
      .addSelect('customer.businessName', 'customerName')
      .addSelect('customer.documentNumber', 'documentNumber')
      .addSelect('SUM(sale.total)', 'totalSpent')
      .addSelect('COUNT(sale.id)', 'salesCount')
      .addSelect('AVG(sale.total)', 'avgPurchase')
      .where('sale.status = :status', { status: SaleStatus.COMPLETED })
      .groupBy('customer.id')
      .addGroupBy('customer.businessName')
      .addGroupBy('customer.documentNumber')
      .orderBy('"totalSpent"', 'DESC')
      .limit(limit);

    if (userId) {
      queryBuilder.andWhere('sale.createdBy = :userId', { userId });
    }

    return await queryBuilder.getRawMany();
  }

  async getSalesByMonth(userId?: string, year: number = new Date().getFullYear()) {
    const queryBuilder = this.saleRepository
      .createQueryBuilder('sale')
      .select("EXTRACT(MONTH FROM sale.saleDate)", 'month')
      .addSelect('COUNT(sale.id)', 'salesCount')
      .addSelect('SUM(sale.total)', 'totalRevenue')
      .addSelect('SUM(sale.paidAmount)', 'totalPaid')
      .where("EXTRACT(YEAR FROM sale.saleDate) = :year", { year })
      .andWhere('sale.status = :status', { status: SaleStatus.COMPLETED })
      .groupBy('month')
      .orderBy('month', 'ASC');

    if (userId) {
      queryBuilder.andWhere('sale.createdBy = :userId', { userId });
    }

    const results = await queryBuilder.getRawMany();

    const months = Array.from({ length: 12 }, (_, i) => {
      const monthData = results.find(r => Number(r.month) === i + 1);
      return {
        month: i + 1,
        salesCount: monthData ? Number(monthData.salesCount) : 0,
        totalRevenue: monthData ? Number(monthData.totalRevenue) : 0,
        totalPaid: monthData ? Number(monthData.totalPaid) : 0,
      };
    });

    return months;
  }

  async getLowStockProducts(limit: number = 20) {
    return await this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .where('inventory.availableQuantity <= product.minStock')
      .orWhere('inventory.availableQuantity <= 10')
      .orderBy('inventory.availableQuantity', 'ASC')
      .limit(limit)
      .getMany();
  }

  async getRecentSales(userId?: string, limit: number = 10) {
    const queryBuilder = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.details', 'details')
      .leftJoinAndSelect('details.product', 'product')
      .orderBy('sale.createdAt', 'DESC')
      .limit(limit);

    if (userId) {
      queryBuilder.where('sale.createdBy = :userId', { userId });
    }

    return await queryBuilder.getMany();
  }

  async getPendingPayments(userId?: string) {
    const queryBuilder = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .where('sale.paidAmount < sale.total')
      .andWhere('sale.status != :cancelled', { cancelled: SaleStatus.CANCELLED })
      .orderBy('sale.saleDate', 'ASC');

    if (userId) {
      queryBuilder.andWhere('sale.createdBy = :userId', { userId });
    }

    return await queryBuilder.getMany();
  }

  async getProformaStats(userId?: string) {
    const whereClause = userId ? { createdBy: userId } : {};

    const [draft, sent, approved, rejected, converted] = await Promise.all([
      this.proformaRepository.count({ where: { ...whereClause, status: ProformaStatus.DRAFT } }),
      this.proformaRepository.count({ where: { ...whereClause, status: ProformaStatus.SENT } }),
      this.proformaRepository.count({ where: { ...whereClause, status: ProformaStatus.APPROVED } }),
      this.proformaRepository.count({ where: { ...whereClause, status: ProformaStatus.REJECTED } }),
      this.proformaRepository.count({ where: { ...whereClause, status: ProformaStatus.CONVERTED } }),
    ]);

    return { draft, sent, approved, rejected, converted };
  }

  async getSalesByStatus(userId?: string) {
    const whereClause = userId ? { createdBy: userId } : {};

    const [pending, completed, cancelled] = await Promise.all([
      this.saleRepository.count({ where: { ...whereClause, status: SaleStatus.PENDING } }),
      this.saleRepository.count({ where: { ...whereClause, status: SaleStatus.COMPLETED } }),
      this.saleRepository.count({ where: { ...whereClause, status: SaleStatus.CANCELLED } }),
    ]);

    return { pending, completed, cancelled };
  }
}