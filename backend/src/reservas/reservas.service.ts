import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from './reserva.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Cancha } from '../canchas/cancha.entity';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { EditarReservaDto } from './dto/editar-reserva.dto';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservasRepository: Repository<Reserva>,
    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
    @InjectRepository(Cancha)
    private readonly canchasRepository: Repository<Cancha>,
  ) {}


  listar(): Promise<Reserva[]> {
    return this.reservasRepository.find({ relations: ['cliente', 'cancha', 'pago'] });
  }
  async validarConflicto(canchaId: number, horaInicio: Date, horaFin: Date): Promise<void> {
    const reservasExistentes = await this.reservasRepository.find({
      where: { cancha: { id: canchaId } }
    });

    const hayConflicto = reservasExistentes.some(r => {
      return (
        (new Date(horaInicio) >= new Date(r.horaInicio) && new Date(horaInicio) < new Date(r.horaFin)) ||
        (new Date(horaFin) > new Date(r.horaInicio) && new Date(horaFin) <= new Date(r.horaFin))
      );
    });

    if (hayConflicto) {
      throw new BadRequestException('La cancha ya se encuentra reservada en ese horario.');
    }
  }
  async crear(createReservaDto: CrearReservaDto): Promise<Reserva> {
    await this.validarConflicto(
      createReservaDto.canchaId,
      createReservaDto.horaInicio,
      createReservaDto.horaFin
    );

    const nuevaReserva = this.reservasRepository.create(createReservaDto);
    return await this.reservasRepository.save(nuevaReserva);
  }