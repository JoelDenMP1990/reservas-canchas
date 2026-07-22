import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Reserva } from '../reservas/reserva.entity';
import { obtenerEstrategiaPago } from './estrategias/obtener-estrategia-pago';

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

  // procesar(): delega en la EstrategiaPago asociada a metodoPago (patrón Strategy).
  procesar(): boolean {
    const aprobado = obtenerEstrategiaPago(this.metodoPago).ejecutar(this);
    if (aprobado) {
      this.procesadoEn = new Date();
    }
    return aprobado;
  }
}
