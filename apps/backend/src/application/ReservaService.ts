import { Reserva } from '../domain/Reserva';
import { EstadoReserva } from '../domain/EstadoReserva';
import { TipoCancha } from '../domain/TipoCancha';
import { ReservaRepository } from './ports/ReservaRepository';
import { CanchaRepository } from './ports/CanchaRepository';
import { generarId } from '../shared/generarId';

// Nota (Fase 2 → ver docs/fase2-diagnostico/informe-malos-olores.md): esta clase concentra
// deliberadamente varios malos olores que se corrigen en la Fase 3. No "limpiar" antes de tiempo:
// son la base del diagnóstico y de las refactorizaciones documentadas.
export class ReservaService {
  constructor(
    private readonly reservaRepository: ReservaRepository,
    private readonly canchaRepository: CanchaRepository,
  ) {}

  // SMELL 1 (Long Method) + SMELL 3 (Large/God Class): un solo método hace validación de
  // disponibilidad, cálculo de tarifa, persistencia y notificación.
  // SMELL 5 (Complex Conditional) + SMELL 6 (Magic Numbers): ver el bloque if/else de tarifa.
  crearReserva(
    clienteId: string,
    canchaId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string,
  ): Reserva {
    const cancha = this.canchaRepository.buscarPorId(canchaId);
    if (!cancha) {
      throw new Error('Cancha no encontrada');
    }

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

    // eslint-disable-next-line no-console
    console.log(`[notificacion] Reserva ${reserva.id} confirmada para cliente ${clienteId}`);

    return reserva;
  }

  // SMELL 2 (Duplicated Code): repite exactamente el mismo cálculo de tarifa que crearReserva(),
  // usado por el frontend para mostrar una cotización antes de confirmar.
  cotizarPrecio(canchaId: string, horaInicio: string): number {
    const cancha = this.canchaRepository.buscarPorId(canchaId);
    if (!cancha) {
      throw new Error('Cancha no encontrada');
    }

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

  cancelarReserva(reservaId: string): void {
    const reserva = this.reservaRepository.buscarPorId(reservaId);
    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }

    const inicioReserva = new Date(`${reserva.fecha}T${reserva.horaInicio}:00`);
    const ahora = new Date();
    const horasDeAntelacion = (inicioReserva.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    // SMELL 6 (Magic Number): "2" horas mínimas de antelación, sin constante con nombre.
    if (horasDeAntelacion < 2) {
      throw new Error('No se puede cancelar con menos de 2 horas de antelación');
    }

    reserva.estado = EstadoReserva.CANCELADA;
    this.reservaRepository.guardar(reserva);

    // eslint-disable-next-line no-console
    console.log(`[notificacion] Reserva ${reserva.id} cancelada`);
  }
}
