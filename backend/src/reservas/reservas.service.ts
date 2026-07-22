import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva } from './reserva.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Cancha } from '../canchas/cancha.entity';
import { Pago } from '../pagos/pago.entity';
import { Notificacion } from '../notificaciones/notificacion.entity';
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
    @InjectRepository(Pago)
    private readonly pagosRepository: Repository<Pago>,
    @InjectRepository(Notificacion)
    private readonly notificacionesRepository: Repository<Notificacion>,
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

  // crear(): CU-02 completo — verifica disponibilidad, calcula el precio, procesa el pago
  // (o lo omite si la cancha es gratuita), confirma la reserva y notifica al cliente.
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
    await this.reservasRepository.save(reserva);

    if (cancha.esGratuita()) {
      reserva.confirmar();
      await this.reservasRepository.save(reserva);
      await this.notificar(reserva, 'CONFIRMACION', 'Tu reserva fue confirmada (cancha gratuita).');
      return reserva;
    }

    const pago = this.pagosRepository.create({
      reserva,
      monto: reserva.monto,
      metodoPago: dto.metodoPago ?? 'EFECTIVO',
    });
    const aprobado = pago.procesar();
    await this.pagosRepository.save(pago);

    if (aprobado) {
      reserva.confirmar();
      await this.reservasRepository.save(reserva);
      await this.notificar(reserva, 'CONFIRMACION', 'Tu reserva fue confirmada y el pago fue aprobado.');
    } else {
      await this.notificar(reserva, 'PAGO_RECHAZADO', 'No se pudo procesar el pago de tu reserva.');
    }

    return reserva;
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

  // cancelar(): CU-03 — la propia Reserva valida la política de antelación; se notifica al cliente.
  async cancelar(id: string): Promise<Reserva> {
    const reserva = await this.obtenerPorId(id);
    reserva.cancelar();
    const reservaGuardada = await this.reservasRepository.save(reserva);
    await this.notificar(reservaGuardada, 'CANCELACION', 'Tu reserva fue cancelada.');
    return reservaGuardada;
  }

  async eliminar(id: string): Promise<void> {
    const reserva = await this.obtenerPorId(id);
    if (reserva.estado !== 'PENDIENTE') {
      throw new BadRequestException('Solo se puede eliminar una reserva pendiente; cancélala en su lugar');
    }
    await this.reservasRepository.remove(reserva);
  }

  private async notificar(reserva: Reserva, tipo: string, mensaje: string): Promise<void> {
    const notificacion = this.notificacionesRepository.create({ reserva, tipo, mensaje });
    notificacion.enviar();
    await this.notificacionesRepository.save(notificacion);
  }
}
