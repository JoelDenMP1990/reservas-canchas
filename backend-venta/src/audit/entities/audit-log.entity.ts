import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @Column({ name: 'table_name', length: 100 })
  @Index()
  tableName: string;

  @Column({ name: 'record_id', type: 'uuid' })
  @Index()
  recordId: string;

  @Column({ length: 20 })
  @Index()
  action: string;

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  oldValues?: any;

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  newValues?: any;

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;
}