import { Reserva } from '../domain/Reserva';
import { EstadoReserva } from '../domain/EstadoReserva';
import { TipoCancha } from '../domain/TipoCancha';
import { Cancha } from '../domain/Cancha';
import { ReservaRepository } from './ports/ReservaRepository';
import { CanchaRepository } from './ports/CanchaRepository';
import { NotificacionService } from './NotificacionService';
import { generarId } from '../shared/generarId';

// Nota (Fase 2 → ver docs/fase2-diagnostico/informe-malos-olores.md): esta clase concentra
// deliberadamente varios malos olores que se corrigen en la Fase 3. No "limpiar" antes de tiempo:
// son la base del diagnóstico y de las refactorizaciones documentadas.
export class ReservaService {
  constructor(
    private readonly reservaRepository: ReservaRepository,
    private readonly canchaRepository: CanchaRepository,
    private readonly notificacionService: NotificacionService,
  ) {}

  // R1 (Fase 3, Extract Method): crearReserva ahora es un orquestador corto de pasos nombrados,
  // en vez de un único método de ~65 líneas con 5 responsabilidades mezcladas.
  crearReserva(
    clienteId: string,
    canchaId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string,
  ): Reserva {
    const cancha = this.buscarCanchaOFallar(canchaId);
    this.verificarDisponibilidad(canchaId, fecha, horaInicio, horaFin);
    const precioTotal = this.calcularTarifa(cancha, horaInicio);
    const reserva = this.crearYPersistirReserva(clienteId, canchaId, fecha, horaInicio, horaFin, precioTotal);
    this.notificacionService.notificar(`Reserva ${reserva.id} confirmada para cliente ${clienteId}`);
    return reserva;
  }

  // R2 (Fase 3, Extract Method / eliminar duplicación): reutiliza el mismo método privado
  // calcularTarifa() que usa crearReserva(), en vez de mantener una copia del cálculo.
  cotizarPrecio(canchaId: string, horaInicio: string): number {
    const cancha = this.buscarCanchaOFallar(canchaId);
    return this.calcularTarifa(cancha, horaInicio);
  }

  cancelarReserva(reservaId: string): void {
    const reserva = this.reservaRepository.buscarPorId(reservaId);
    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }

    const inicioReserva = new Date(`${reserva.fecha}T${reserva.horaInicio}:00`);
    const ahora = new Date();
    const horasDeAntelacion = (inicioReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    // SMELL 6 (Magic Number): "2" horas mínimas de antelación, sin constante con nombre. Se
    // corrige en R5.
    if (horasDeAntelacion < 2) {
      throw new Error('No se puede cancelar con menos de 2 horas de antelación');
    }

    reserva.estado = EstadoReserva.CANCELADA;
    this.reservaRepository.guardar(reserva);

    this.notificacionService.notificar(`Reserva ${reserva.id} cancelada`);
  }

  private buscarCanchaOFallar(canchaId: string): Cancha {
    const cancha = this.canchaRepository.buscarPorId(canchaId);
    if (!cancha) {
      throw new Error('Cancha no encontrada');
    }
    return cancha;
  }

  private verificarDisponibilidad(
    canchaId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string,
  ): void {
    const reservasExistentes = this.reservaRepository.listarPorCancha(canchaId);
    for (const r of reservasExistentes) {
      const seSolapan =
        r.estado !== EstadoReserva.CANCELADA &&
        r.fecha === fecha &&
        !(horaFin <= r.horaInicio || horaInicio >= r.horaFin);
      if (seSolapan) {
        throw new Error('La cancha no está disponible en esa franja horaria');
      }
    }
  }

  // SMELL 5 (Complex Conditional) + SMELL 6 (Magic Numbers) — se corrige en R6 (Strategy).
  private calcularTarifa(cancha: Cancha, horaInicio: string): number {
    let precioTotal = 0;
    const horaNum = parseInt(horaInicio.split(':')[0], 10);
    if (cancha.tipo === TipoCancha.FUTBOL) {
      if (horaNum >= 6 && horaNum < 10) {
        precioTotal = cancha.tarifaBase * 0.8;
      } else if (horaNum >= 18 && horaNum < 22) {
        precioTotal = cancha.tarifaBase * 1.3;
      } else {
        precioTotal = cancha.tarifaBase;
      }
    } else if (cancha.tipo === TipoCancha.BASQUET) {
      if (horaNum >= 6 && horaNum < 10) {
        precioTotal = cancha.tarifaBase * 0.9;
      } else if (horaNum >= 18 && horaNum < 22) {
        precioTotal = cancha.tarifaBase * 1.2;
      } else {
        precioTotal = cancha.tarifaBase;
      }
    } else {
      if (horaNum >= 6 && horaNum < 10) {
        precioTotal = cancha.tarifaBase * 0.85;
      } else {
        precioTotal = cancha.tarifaBase;
      }
    }
    return precioTotal;
  }

  private crearYPersistirReserva(
    clienteId: string,
    canchaId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string,
    precioTotal: number,
  ): Reserva {
    const reserva = new Reserva(
      generarId('res'),
      clienteId,
      canchaId,
      fecha,
      horaInicio,
      horaFin,
      precioTotal,
      new Date(),
    );
    reserva.estado = EstadoReserva.CONFIRMADA;
    this.reservaRepository.guardar(reserva);
    return reserva;
  }
}
