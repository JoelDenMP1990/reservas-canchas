import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    const existing = await this.inventoryRepository.findOne({
      where: { productId: createInventoryDto.productId },
    });

    if (existing) {
      throw new BadRequestException('Inventory already exists for this product');
    }

    const inventory = this.inventoryRepository.create(createInventoryDto);
    return await this.inventoryRepository.save(inventory);
  }

  async findAll(): Promise<Inventory[]> {
    return await this.inventoryRepository.find({
      relations: ['product'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    return inventory;
  }

  async findByProduct(productId: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { productId },
      relations: ['product'],
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory for product ${productId} not found`);
    }

    return inventory;
  }

  async addStock(productId: string, quantity: number): Promise<Inventory> {
    const inventory = await this.findByProduct(productId);
    inventory.quantity = Number(inventory.quantity) + quantity;
    inventory.lastMovementDate = new Date();
    return await this.inventoryRepository.save(inventory);
  }

  async subtractStock(productId: string, quantity: number): Promise<Inventory> {
    const inventory = await this.findByProduct(productId);
    
    if (Number(inventory.availableQuantity) < quantity) {
      throw new BadRequestException('Insufficient stock available');
    }

    inventory.quantity = Number(inventory.quantity) - quantity;
    inventory.lastMovementDate = new Date();
    return await this.inventoryRepository.save(inventory);
  }

  async adjustStock(productId: string, newQuantity: number): Promise<Inventory> {
    const inventory = await this.findByProduct(productId);
    inventory.quantity = newQuantity;
    inventory.lastMovementDate = new Date();
    return await this.inventoryRepository.save(inventory);
  }

  async getLowStock(minStock: number = 10): Promise<Inventory[]> {
    return await this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .where('inventory.availableQuantity <= :minStock', { minStock })
      .orderBy('inventory.availableQuantity', 'ASC')
      .getMany();
  }
}