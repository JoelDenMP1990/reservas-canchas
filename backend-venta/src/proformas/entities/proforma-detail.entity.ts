import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Proforma } from './proforma.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('proforma_details')
export class ProformaDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Proforma, proforma => proforma.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proforma_id' })
  proforma: Proforma;

  @Column({ name: 'proforma_id', type: 'uuid' })
  proformaId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ name: 'discount_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}