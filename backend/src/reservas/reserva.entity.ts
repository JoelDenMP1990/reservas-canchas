import { BadRequestException } from '@nestjs/common';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { Cancha } from '../canchas/cancha.entity';
import { Pago } from '../pagos/pago.entity';
import { Notificacion } from '../notificaciones/notificacion.entity';
import { Horario } from './horario';

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

  // cancelar(): libera la reserva; exige al menos 2 horas de anticipación al inicio.
  cancelar(): void {
    if (this.estado === 'CANCELADA') {
      throw new BadRequestException('La reserva ya está cancelada');
    }
    const minutosParaInicio = (this.horaInicio.getTime() - Date.now()) / (1000 * 60);
    if (minutosParaInicio < 0) {
      throw new BadRequestException('No se puede cancelar una reserva cuyo horario ya pasó');
    }
    if (minutosParaInicio < 120) {
      throw new BadRequestException('Solo se puede cancelar una reserva con al menos 2 horas de anticipación');
    }
    this.estado = 'CANCELADA';
  }

  // calcularPrecio(): horas reservadas por la tarifa base de la cancha.
  calcularPrecio(): number {
  const horario = new Horario(this.horaInicio, this.horaFin);
  return horario.duracionEnHoras() * this.cancha.getTarifaBase();
  }
}
