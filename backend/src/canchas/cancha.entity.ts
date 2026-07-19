import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Administrador } from '../administradores/administrador.entity';
import { Reserva } from '../reservas/reserva.entity';

// Cancha: espacio deportivo que se puede reservar.
@Entity('canchas')
export class Cancha {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  tipo: string;

  @Column('decimal', { precision: 10, scale: 2 })
  tarifaBasePorHora: number;

  @Column({ default: true })
  activa: boolean;

  @Column('time')
  horaAperturaDesde: string;

  @Column('time')
  horaCierreHasta: string;

  @ManyToOne(() => Administrador, (administrador) => administrador.canchas)
  administrador: Administrador;

  @OneToMany(() => Reserva, (reserva) => reserva.cancha)
  reservas: Reserva[];

  // estaDisponible(): solo se puede reservar una cancha activa.
  estaDisponible(): boolean {
    return this.activa;
  }

  getTarifaBase(): number {
    return Number(this.tarifaBasePorHora);
  }

  // esGratuita(): canchas comunitarias sin costo por hora.
  esGratuita(): boolean {
    return this.getTarifaBase() === 0;
  }
}
