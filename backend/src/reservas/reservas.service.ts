import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { Reserva } from './reserva.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Cancha } from '../canchas/cancha.entity';
import { PagosService } from '../pagos/pagos.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { MetodoPago } from '../pagos/metodo-pago.enum';
import { EstadoReserva } from './estado-reserva.enum';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservasRepository: Repository<Reserva>,
    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
    @InjectRepository(Cancha)
    private readonly canchasRepository: Repository<Cancha>,
    private readonly pagosService: PagosService,
    private readonly notificacionesService: NotificacionesService,
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

  // crear(): CU-02 — orquesta los 3 pasos en métodos privados (Extract Method, corrige el
  // mal olor de método largo): validar cliente/cancha/horario, crear la reserva pendiente,
  // y procesar el pago (o confirmarla directo si la cancha es gratuita).
  async crear(dto: CrearReservaDto): Promise<Reserva> {
    const { cliente, cancha, horaInicio, horaFin } = await this.validarDatosDeReserva(dto);
    const reserva = await this.crearReservaPendiente(cliente, cancha, horaInicio, horaFin);
    return this.confirmarConPago(reserva, cancha, dto.metodoPago);
  }

  // validarDatosDeReserva(): busca cliente y cancha, y valida disponibilidad/horario/solapamiento.
  private async validarDatosDeReserva(
    dto: CrearReservaDto,
  ): Promise<{ cliente: Cliente; cancha: Cancha; horaInicio: Date; horaFin: Date }> {
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

    const horaInicio = new Date(dto.horaInicio);
    const horaFin = new Date(dto.horaFin);
    if (horaInicio < new Date()) {
      throw new BadRequestException('No se puede reservar en una fecha u hora que ya pasó');
    }
    if (horaFin <= horaInicio) {
      throw new BadRequestException('La hora de fin debe ser posterior a la hora de inicio');
    }
    if (await this.haySolapamiento(cancha.id, horaInicio, horaFin)) {
      throw new BadRequestException('La cancha ya tiene una reserva confirmada en ese horario');
    }

    return { cliente, cancha, horaInicio, horaFin };
  }

  // crearReservaPendiente(): guarda la reserva en estado PENDIENTE con su precio calculado.
  private async crearReservaPendiente(
    cliente: Cliente,
    cancha: Cancha,
    horaInicio: Date,
    horaFin: Date,
  ): Promise<Reserva> {
    const reserva = this.reservasRepository.create({
      cliente,
      cancha,
      horaInicio,
      horaFin,
      estado: EstadoReserva.PENDIENTE,
    });
    reserva.monto = reserva.calcularPrecio();
    return this.reservasRepository.save(reserva);
  }

  // confirmarConPago(): despacha entre los dos caminos posibles — cancha gratuita (sin pago)
  // o cancha de pago (procesa el pago) — cada uno descompuesto en su propio método
  // (Decompose Conditional, corrige el mal olor de condicional mezclado con la lógica).
  private async confirmarConPago(reserva: Reserva, cancha: Cancha, metodoPago?: MetodoPago): Promise<Reserva> {
    if (cancha.esGratuita()) {
      return this.confirmarSinPago(reserva);
    }
    return this.confirmarProcesandoPago(reserva, metodoPago);
  }

  // confirmarSinPago(): cancha gratuita — confirma directo y notifica, sin crear ningún Pago.
  private async confirmarSinPago(reserva: Reserva): Promise<Reserva> {
    reserva.confirmar();
    await this.reservasRepository.save(reserva);
    await this.notificacionesService.crear({
      reservaId: reserva.id,
      tipo: 'CONFIRMACION',
      mensaje: 'Tu reserva fue confirmada (cancha gratuita).',
    });
    return reserva;
  }

  // confirmarProcesandoPago(): cancha de pago — delega en PagosService, que procesa el pago y
  // confirma la reserva solo si fue aprobado.
  private async confirmarProcesandoPago(reserva: Reserva, metodoPago?: MetodoPago): Promise<Reserva> {
    const pago = await this.pagosService.crear({
      reservaId: reserva.id,
      monto: reserva.monto,
      metodoPago: metodoPago ?? MetodoPago.EFECTIVO,
    });

    if (pago.procesadoEn) {
      reserva.confirmar();
      await this.notificacionesService.crear({
        reservaId: reserva.id,
        tipo: 'CONFIRMACION',
        mensaje: 'Tu reserva fue confirmada y el pago fue aprobado.',
      });
    } else {
      await this.notificacionesService.crear({
        reservaId: reserva.id,
        tipo: 'PAGO_RECHAZADO',
        mensaje: 'No se pudo procesar el pago de tu reserva.',
      });
    }

    return reserva;
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
    await this.notificacionesService.crear({
      reservaId: reservaGuardada.id,
      tipo: 'CANCELACION',
      mensaje: 'Tu reserva fue cancelada.',
    });
    return reservaGuardada;
  }

  // consultarDisponibilidad(): CU-01 — informa si una cancha está libre en un horario dado.
  async consultarDisponibilidad(canchaId: string, horaInicioStr: string, horaFinStr: string): Promise<boolean> {
    const cancha = await this.canchasRepository.findOneBy({ id: canchaId });
    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }
    if (!cancha.estaDisponible()) {
      return false;
    }
    const horaInicio = new Date(horaInicioStr);
    const horaFin = new Date(horaFinStr);
    return !(await this.haySolapamiento(canchaId, horaInicio, horaFin));
  }

  // haySolapamiento(): true si la cancha ya tiene una reserva CONFIRMADA que cruza ese horario.
  private async haySolapamiento(canchaId: string, horaInicio: Date, horaFin: Date): Promise<boolean> {
    const conflicto = await this.reservasRepository.findOne({
      where: {
        cancha: { id: canchaId },
        estado: EstadoReserva.CONFIRMADA,
        horaInicio: LessThan(horaFin),
        horaFin: MoreThan(horaInicio),
      },
    });
    return !!conflicto;
  }
}
