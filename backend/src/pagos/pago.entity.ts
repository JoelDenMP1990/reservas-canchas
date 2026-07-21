import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Reserva } from '../reservas/reserva.entity';

// Pago: cobro asociado a una reserva.
@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  monto: number;

  @Column()
  metodoPago: string;

  @Column({ type: 'timestamp', nullable: true })
  procesadoEn: Date;

  @OneToOne(() => Reserva, (reserva) => reserva.pago)
  @JoinColumn()
  reserva: Reserva;

  // procesar(): simula el envío a una pasarela de pago; en este proyecto académico siempre aprueba.
  procesar(): boolean {
    this.procesadoEn = new Date();
    return true;
  }
}
