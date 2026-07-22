import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { Cancha } from '../canchas/cancha.entity';
import { Pago } from '../pagos/pago.entity';
import { Notificacion } from '../notificaciones/notificacion.entity';

// Reserva: uso de una cancha por un cliente en un horario determinado.
@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'PENDIENTE' })
  estado: string;

  @Column('timestamp')
  horaInicio: Date;

  @Column('timestamp')
  horaFin: Date;

  @CreateDateColumn()
  creadaEn: Date;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  monto: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.reservas)
  cliente: Cliente;

  @ManyToOne(() => Cancha, (cancha) => cancha.reservas)
  cancha: Cancha;

  @OneToOne(() => Pago, (pago) => pago.reserva)
  pago: Pago;

  @OneToMany(() => Notificacion, (notificacion) => notificacion.reserva)
  notificaciones: Notificacion[];

  // confirmar(): la reserva pasa a confirmada, normalmente tras registrar el pago.
  confirmar(): void {
    this.estado = 'CONFIRMADA';
  }

  // cancelar(): libera la reserva.
  cancelar(): void {
    this.estado = 'CANCELADA';
  }

  // calcularPrecio(): horas reservadas por la tarifa base de la cancha.
  calcularPrecio(): number {
    const horas = (this.horaFin.getTime() - this.horaInicio.getTime()) / (1000 * 60 * 60);
    return horas * this.cancha.getTarifaBase();
  }
}
