import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, userId: string): Promise<Customer> {
    const existing = await this.customerRepository.findOne({
      where: { documentNumber: createCustomerDto.documentNumber },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException(`Customer with document ${createCustomerDto.documentNumber} already exists`);
    }

    const customer = this.customerRepository.create({
      ...createCustomerDto,
      createdBy: userId,
    });

    return await this.customerRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return await this.customerRepository.find({
    //  where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async findByDocument(documentNumber: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { documentNumber },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with document ${documentNumber} not found`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    if (updateCustomerDto.documentNumber && updateCustomerDto.documentNumber !== customer.documentNumber) {
      const existing = await this.customerRepository.findOne({
        where: { documentNumber: updateCustomerDto.documentNumber },
        withDeleted: true,
      });

      if (existing) {
        throw new ConflictException(`Customer with document ${updateCustomerDto.documentNumber} already exists`);
      }
    }

    Object.assign(customer, updateCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.customerRepository.softDelete(id);
  }

  async restore(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await this.customerRepository.restore(id);
    return await this.findOne(id);
  }

  async deactivate(id: string): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.isActive = false;
    return await this.customerRepository.save(customer);
  }

  async activate(id: string): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.isActive = true;
    return await this.customerRepository.save(customer);
  }
}