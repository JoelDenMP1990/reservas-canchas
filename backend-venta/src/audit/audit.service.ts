import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(limit: number = 100): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByUser(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByTable(tableName: string, limit: number = 100): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { tableName },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByRecord(tableName: string, recordId: string): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { tableName, recordId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async findByAction(action: string, limit: number = 100): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { action },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}