import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, userId: string): Promise<Product> {
    const existing = await this.productRepository.findOne({
      where: { code: createProductDto.code },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException(`Product with code ${createProductDto.code} already exists`);
    }

    const product = this.productRepository.create({
      ...createProductDto,
      createdBy: userId,
    });

    return await this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findByCode(code: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { code },
    });

    if (!product) {
      throw new NotFoundException(`Product with code ${code} not found`);
    }

    return product;
  }

  async findByCategory(category: string): Promise<Product[]> {
    return await this.productRepository.find({
      where: { category, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.code && updateProductDto.code !== product.code) {
      const existing = await this.productRepository.findOne({
        where: { code: updateProductDto.code },
        withDeleted: true,
      });

      if (existing) {
        throw new ConflictException(`Product with code ${updateProductDto.code} already exists`);
      }
    }

    Object.assign(product, updateProductDto);
    return await this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.softDelete(id);
  }

  async restore(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productRepository.restore(id);
    return await this.findOne(id);
  }

  async deactivate(id: string): Promise<Product> {
    const product = await this.findOne(id);
    product.isActive = false;
    return await this.productRepository.save(product);
  }

  async activate(id: string): Promise<Product> {
    const product = await this.findOne(id);
    product.isActive = true;
    return await this.productRepository.save(product);
  }
}