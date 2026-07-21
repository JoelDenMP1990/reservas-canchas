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

  async obtenerPorId(id: string): Promise<Reserva> {
    const reserva = await this.reservasRepository.findOne({
      where: { id },
      relations: ['cliente', 'cancha', 'pago'],
    });
    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }
    return reserva;
  }

  async crear(dto: CrearReservaDto): Promise<Reserva> {
    const cliente = await this.clientesRepository.findOneBy({ id: dto.clienteId });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    const cancha = await this.canchasRepository.findOneBy({ id: dto.canchaId });
    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }
    if (!cancha.estaDisponible()) {
      throw new BadRequestException('La cancha no está disponible');
    }
    const reserva = this.reservasRepository.create({
      cliente,
      cancha,
      horaInicio: new Date(dto.horaInicio),
      horaFin: new Date(dto.horaFin),
      estado: 'PENDIENTE',
    });
    reserva.monto = reserva.calcularPrecio();
    return this.reservasRepository.save(reserva);
  }

  async editar(id: string, dto: EditarReservaDto): Promise<Reserva> {
    const reserva = await this.obtenerPorId(id);
    if (reserva.estado !== 'PENDIENTE') {
      throw new BadRequestException('Solo se puede reprogramar una reserva pendiente');
    }
    if (dto.horaInicio) {
      reserva.horaInicio = new Date(dto.horaInicio);
    }
    if (dto.horaFin) {
      reserva.horaFin = new Date(dto.horaFin);
    }
    reserva.monto = reserva.calcularPrecio();
    return this.reservasRepository.save(reserva);
  }

  async confirmar(id: string): Promise<Reserva> {
    const reserva = await this.obtenerPorId(id);
    reserva.confirmar();
    return this.reservasRepository.save(reserva);
  }

  async cancelar(id: string): Promise<Reserva> {
    const reserva = await this.obtenerPorId(id);
    reserva.cancelar();
    return this.reservasRepository.save(reserva);
  }

  async eliminar(id: string): Promise<void> {
    const reserva = await this.obtenerPorId(id);
    await this.reservasRepository.remove(reserva);
  }
}
