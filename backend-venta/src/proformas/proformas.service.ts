import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proforma, ProformaStatus } from './entities/proforma.entity';
import { ProformaDetail } from './entities/proforma-detail.entity';
import { CreateProformaDto } from './dto/create-proforma.dto';
import { UpdateProformaDto } from './dto/update-proforma.dto';

@Injectable()
export class ProformasService {
  constructor(
    @InjectRepository(Proforma)
    private proformaRepository: Repository<Proforma>,
    @InjectRepository(ProformaDetail)
    private proformaDetailRepository: Repository<ProformaDetail>,
  ) {}

  async create(createProformaDto: CreateProformaDto, userId: string): Promise<Proforma> {
    const existing = await this.proformaRepository.findOne({
      where: { proformaNumber: createProformaDto.proformaNumber },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException(`Proforma ${createProformaDto.proformaNumber} already exists`);
    }

    let subtotal = 0;
    const details = createProformaDto.details.map(detail => {
      const itemSubtotal = Number(detail.quantity) * Number(detail.unitPrice);
      const discountAmount = itemSubtotal * (Number(detail.discountPercent || 0) / 100);
      const itemTotal = itemSubtotal - discountAmount;
      subtotal += itemSubtotal;

      return this.proformaDetailRepository.create({
        productId: detail.productId,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        discountPercent: detail.discountPercent || 0,
        subtotal: itemSubtotal,
        total: itemTotal,
        notes: detail.notes,
      });
    });

    const taxAmount = subtotal * (Number(createProformaDto.tax || 0) / 100);
    const total = subtotal + taxAmount - Number(createProformaDto.discount || 0);

    const proforma = this.proformaRepository.create({
      proformaNumber: createProformaDto.proformaNumber,
      customerId: createProformaDto.customerId,
      status: createProformaDto.status || ProformaStatus.DRAFT,
      issueDate: createProformaDto.issueDate,
      validUntil: createProformaDto.validUntil,
      subtotal,
      tax: taxAmount,
      discount: createProformaDto.discount || 0,
      total,
      notes: createProformaDto.notes,
      terms: createProformaDto.terms,
      createdBy: userId,
      details,
    });

    return await this.proformaRepository.save(proforma);
  }

  async findAll(): Promise<Proforma[]> {
    return await this.proformaRepository.find({
      relations: ['customer', 'details', 'details.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Proforma> {
    const proforma = await this.proformaRepository.findOne({
      where: { id },
      relations: ['customer', 'details', 'details.product'],
    });

    if (!proforma) {
      throw new NotFoundException(`Proforma with ID ${id} not found`);
    }

    return proforma;
  }

  async findByNumber(proformaNumber: string): Promise<Proforma> {
    const proforma = await this.proformaRepository.findOne({
      where: { proformaNumber },
      relations: ['customer', 'details', 'details.product'],
    });

    if (!proforma) {
      throw new NotFoundException(`Proforma ${proformaNumber} not found`);
    }

    return proforma;
  }

  async findByCustomer(customerId: string): Promise<Proforma[]> {
    return await this.proformaRepository.find({
      where: { customerId },
      relations: ['details', 'details.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateProformaDto: UpdateProformaDto): Promise<Proforma> {
    const proforma = await this.findOne(id);

    if (proforma.status === ProformaStatus.CONVERTED) {
      throw new BadRequestException('Cannot update a converted proforma');
    }

    if (updateProformaDto.proformaNumber && updateProformaDto.proformaNumber !== proforma.proformaNumber) {
      const existing = await this.proformaRepository.findOne({
        where: { proformaNumber: updateProformaDto.proformaNumber },
        withDeleted: true,
      });

      if (existing) {
        throw new ConflictException(`Proforma ${updateProformaDto.proformaNumber} already exists`);
      }
    }

    if (updateProformaDto.details) {
      await this.proformaDetailRepository.delete({ proformaId: id });

      let subtotal = 0;
      const details = updateProformaDto.details.map(detail => {
        const itemSubtotal = Number(detail.quantity) * Number(detail.unitPrice);
        const discountAmount = itemSubtotal * (Number(detail.discountPercent || 0) / 100);
        const itemTotal = itemSubtotal - discountAmount;
        subtotal += itemSubtotal;

        return this.proformaDetailRepository.create({
          proformaId: id,
          productId: detail.productId,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          discountPercent: detail.discountPercent || 0,
          subtotal: itemSubtotal,
          total: itemTotal,
          notes: detail.notes,
        });
      });

      await this.proformaDetailRepository.save(details);

      const taxAmount = subtotal * (Number(updateProformaDto.tax || 0) / 100);
      const total = subtotal + taxAmount - Number(updateProformaDto.discount || 0);

      proforma.subtotal = subtotal;
      proforma.tax = taxAmount;
      proforma.total = total;
    }

    Object.assign(proforma, updateProformaDto);
    return await this.proformaRepository.save(proforma);
  }

  async remove(id: string): Promise<void> {
    const proforma = await this.findOne(id);
    
    if (proforma.status === ProformaStatus.CONVERTED) {
      throw new BadRequestException('Cannot delete a converted proforma');
    }

    await this.proformaRepository.softDelete(id);
  }

  async approve(id: string, userId: string): Promise<Proforma> {
    const proforma = await this.findOne(id);
    proforma.status = ProformaStatus.APPROVED;
    proforma.approvedBy = userId;
    proforma.approvedAt = new Date();
    return await this.proformaRepository.save(proforma);
  }

  async reject(id: string): Promise<Proforma> {
    const proforma = await this.findOne(id);
    proforma.status = ProformaStatus.REJECTED;
    return await this.proformaRepository.save(proforma);
  }

  async convert(id: string): Promise<Proforma> {
    const proforma = await this.findOne(id);
    
    if (proforma.status !== ProformaStatus.APPROVED) {
      throw new BadRequestException('Only approved proformas can be converted');
    }

    proforma.status = ProformaStatus.CONVERTED;
    return await this.proformaRepository.save(proforma);
  }
}