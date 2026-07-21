import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Reserva } from '../reservas/reserva.entity';

// Notificacion: aviso enviado al cliente sobre el estado de una reserva.
@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tipo: string;

  @Column()
  mensaje: string;

  @Column({ type: 'timestamp', nullable: true })
  enviadaEn: Date;

  @ManyToOne(() => Reserva, (reserva) => reserva.notificaciones)
  reserva: Reserva;

  // enviar(): simula el envío de la notificación; en este proyecto académico siempre se logra.
  enviar(): boolean {
    this.enviadaEn = new Date();
    return true;
  }
}
