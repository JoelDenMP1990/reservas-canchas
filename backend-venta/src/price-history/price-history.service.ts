import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceHistory } from './entities/price-history.entity';

@Injectable()
export class PriceHistoryService {
  constructor(
    @InjectRepository(PriceHistory)
    private priceHistoryRepository: Repository<PriceHistory>,
  ) {}

  async getLastPrice(customerId: string, productId: string): Promise<PriceHistory | null> {
    return await this.priceHistoryRepository.findOne({
      where: { customerId, productId },
      order: { createdAt: 'DESC' },
    });
  }

  async getCustomerHistory(customerId: string): Promise<PriceHistory[]> {
    return await this.priceHistoryRepository.find({
      where: { customerId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async getProductHistory(productId: string): Promise<PriceHistory[]> {
    return await this.priceHistoryRepository.find({
      where: { productId },
      relations: ['customer'],
      order: { createdAt: 'DESC' },
    });
  }
}