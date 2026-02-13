import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale, SaleStatus } from './entities/sale.entity';
import { SaleDetail } from './entities/sale-detail.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(SaleDetail)
    private saleDetailRepository: Repository<SaleDetail>,
  ) {}

  async create(createSaleDto: CreateSaleDto, userId: string): Promise<Sale> {
    const existing = await this.saleRepository.findOne({
      where: { saleNumber: createSaleDto.saleNumber },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException(`Sale ${createSaleDto.saleNumber} already exists`);
    }

    let subtotal = 0;
    const details = createSaleDto.details.map(detail => {
      const itemSubtotal = Number(detail.quantity) * Number(detail.unitPrice);
      const discountAmount = itemSubtotal * (Number(detail.discountPercent || 0) / 100);
      const itemTotal = itemSubtotal - discountAmount;
      subtotal += itemSubtotal;

      return this.saleDetailRepository.create({
        productId: detail.productId,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        discountPercent: detail.discountPercent || 0,
        subtotal: itemSubtotal,
        total: itemTotal,
        costPrice: detail.costPrice,
        notes: detail.notes,
      });
    });

    const taxAmount = subtotal * (Number(createSaleDto.tax || 0) / 100);
    const total = subtotal + taxAmount - Number(createSaleDto.discount || 0);

    const sale = this.saleRepository.create({
      saleNumber: createSaleDto.saleNumber,
      customerId: createSaleDto.customerId,
      proformaId: createSaleDto.proformaId,
      status: createSaleDto.status || SaleStatus.PENDING,
      saleDate: createSaleDto.saleDate,
      subtotal,
      tax: taxAmount,
      discount: createSaleDto.discount || 0,
      total,
      paidAmount: createSaleDto.paidAmount || 0,
      paymentMethod: createSaleDto.paymentMethod,
      notes: createSaleDto.notes,
      createdBy: userId,
      details,
    });

    return await this.saleRepository.save(sale);
  }

  async findAll(): Promise<Sale[]> {
    return await this.saleRepository.find({
      relations: ['customer', 'details', 'details.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['customer', 'proforma', 'details', 'details.product'],
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async findByNumber(saleNumber: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { saleNumber },
      relations: ['customer', 'details', 'details.product'],
    });

    if (!sale) {
      throw new NotFoundException(`Sale ${saleNumber} not found`);
    }

    return sale;
  }

  async findByCustomer(customerId: string): Promise<Sale[]> {
    return await this.saleRepository.find({
      where: { customerId },
      relations: ['details', 'details.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    const sale = await this.findOne(id);

    if (sale.status === SaleStatus.COMPLETED) {
      throw new BadRequestException('Cannot update a completed sale');
    }

    if (updateSaleDto.saleNumber && updateSaleDto.saleNumber !== sale.saleNumber) {
      const existing = await this.saleRepository.findOne({
        where: { saleNumber: updateSaleDto.saleNumber },
        withDeleted: true,
      });

      if (existing) {
        throw new ConflictException(`Sale ${updateSaleDto.saleNumber} already exists`);
      }
    }

    if (updateSaleDto.details) {
      await this.saleDetailRepository.delete({ saleId: id });

      let subtotal = 0;
      const details = updateSaleDto.details.map(detail => {
        const itemSubtotal = Number(detail.quantity) * Number(detail.unitPrice);
        const discountAmount = itemSubtotal * (Number(detail.discountPercent || 0) / 100);
        const itemTotal = itemSubtotal - discountAmount;
        subtotal += itemSubtotal;

        return this.saleDetailRepository.create({
          saleId: id,
          productId: detail.productId,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          discountPercent: detail.discountPercent || 0,
          subtotal: itemSubtotal,
          total: itemTotal,
          costPrice: detail.costPrice,
          notes: detail.notes,
        });
      });

      await this.saleDetailRepository.save(details);

      const taxAmount = subtotal * (Number(updateSaleDto.tax || 0) / 100);
      const total = subtotal + taxAmount - Number(updateSaleDto.discount || 0);

      sale.subtotal = subtotal;
      sale.tax = taxAmount;
      sale.total = total;
    }

    Object.assign(sale, updateSaleDto);
    return await this.saleRepository.save(sale);
  }

  async remove(id: string): Promise<void> {
    const sale = await this.findOne(id);
    
    if (sale.status === SaleStatus.COMPLETED) {
      throw new BadRequestException('Cannot delete a completed sale');
    }

    await this.saleRepository.softDelete(id);
  }

  async complete(id: string, userId: string): Promise<Sale> {
    const sale = await this.findOne(id);
    sale.status = SaleStatus.COMPLETED;
    sale.approvedBy = userId;
    sale.approvedAt = new Date();
    return await this.saleRepository.save(sale);
  }

  async cancel(id: string): Promise<Sale> {
    const sale = await this.findOne(id);
    
    if (sale.status === SaleStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed sale');
    }

    sale.status = SaleStatus.CANCELLED;
    return await this.saleRepository.save(sale);
  }

  async addPayment(id: string, amount: number): Promise<Sale> {
    const sale = await this.findOne(id);
    const newPaidAmount = Number(sale.paidAmount) + amount;

    if (newPaidAmount > Number(sale.total)) {
      throw new BadRequestException('Payment exceeds sale total');
    }

    sale.paidAmount = newPaidAmount;
    return await this.saleRepository.save(sale);
  }
}