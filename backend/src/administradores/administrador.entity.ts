import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cancha } from '../canchas/cancha.entity';

// Administrador: persona que registra y gestiona canchas.
@Entity('administradores')
export class Administrador {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  areaAsignada: string;

  @OneToMany(() => Cancha, (cancha) => cancha.administrador)
  canchas: Cancha[];
}
