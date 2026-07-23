import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './pago.entity';
import { Reserva } from '../reservas/reserva.entity';
import { CrearPagoDto } from './dto/crear-pago.dto';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagosRepository: Repository<Pago>,

    @InjectRepository(Reserva)
    private readonly reservasRepository: Repository<Reserva>,
  ) {}

  listar(): Promise<Pago[]> {
    return this.pagosRepository.find({
      relations: ['reserva'],
    });
  }

  async obtenerPorId(id: string): Promise<Pago> {
    const pago = await this.pagosRepository.findOne({
      where: { id },
      relations: ['reserva'],
    });

    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }

    return pago;
  }

  // Registra el pago de una reserva, lo procesa y confirma la reserva.
  async crear(dto: CrearPagoDto): Promise<Pago> {
    const reserva = await this.reservasRepository.findOneBy({
      id: dto.reservaId,
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    const pagoExistente = await this.pagosRepository.findOne({
      where: {
        reserva: {
          id: reserva.id,
        },
      },
    });

    if (pagoExistente) {
      throw new BadRequestException(
        'Esta reserva ya tiene un pago registrado',
      );
    }

    const pago = this.pagosRepository.create({
      reserva,
      monto: dto.monto,
      metodoPago: dto.metodoPago,
    });

    pago.procesar();

    const pagoGuardado = await this.pagosRepository.save(pago);

    reserva.confirmar();
    await this.reservasRepository.save(reserva);

    return pagoGuardado;
  }

  async eliminar(id: string): Promise<void> {
    const pago = await this.obtenerPorId(id);
    await this.pagosRepository.remove(pago);
  }
}