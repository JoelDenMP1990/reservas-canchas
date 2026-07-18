import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'product_id', type: 'uuid' })
  @Index({ unique: true })
  productId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  quantity: number;

  @Column({ name: 'reserved_quantity', type: 'decimal', precision: 12, scale: 2, default: 0 })
  reservedQuantity: number;

  @Column({ name: 'available_quantity', type: 'decimal', precision: 12, scale: 2, generatedType: 'STORED', asExpression: 'quantity - reserved_quantity' })
  availableQuantity: number;

  @Column({ name: 'last_movement_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastMovementDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}