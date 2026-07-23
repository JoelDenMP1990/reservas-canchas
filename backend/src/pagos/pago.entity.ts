import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reserva } from '../reservas/reserva.entity';
import { MetodoPago } from './metodo-pago.enum';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  monto: number;

  @Column({
    type: 'enum',
    enum: MetodoPago,
  })
  metodoPago: MetodoPago;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  procesadoEn: Date;

  @OneToOne(() => Reserva, (reserva) => reserva.pago)
  @JoinColumn()
  reserva: Reserva;

  procesar(): boolean {
    this.procesadoEn = new Date();
    return true;
  }
}