import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Reserva } from '../reservas/reserva.entity';

// Cliente: persona que reserva canchas.
@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  telefono: string;

  @OneToMany(() => Reserva, (reserva) => reserva.cliente)
  reservas: Reserva[];
}
