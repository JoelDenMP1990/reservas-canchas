import { Reserva } from '../domain/Reserva';
import { EstadoReserva } from '../domain/EstadoReserva';
import { TipoCancha } from '../domain/TipoCancha';
import { Cancha } from '../domain/Cancha';
import { FranjaHoraria } from '../domain/FranjaHoraria';
import { ReservaRepository } from './ports/ReservaRepository';
import { CanchaRepository } from './ports/CanchaRepository';
import { NotificacionService } from './NotificacionService';
import { DisponibilidadService } from './DisponibilidadService';
import { generarId } from '../shared/generarId';

// R5 (Fase 3, Replace Magic Number with Symbolic Constant): antes "2" y "1000 * 60 * 60" sueltos
// dentro de cancelarReserva(), sin ningún nombre que explicara su significado de negocio.
const ANTELACION_MINIMA_CANCELACION_HORAS = 2;
const MILISEGUNDOS_POR_HORA = 1000 * 60 * 60;

// Nota (Fase 2 → ver docs/fase2-diagnostico/informe-malos-olores.md): esta clase concentra
// deliberadamente varios malos olores que se corrigen en la Fase 3. No "limpiar" antes de tiempo:
// son la base del diagnóstico y de las refactorizaciones documentadas.
export class ReservaService {
  constructor(
    private readonly reservaRepository: ReservaRepository,
    private readonly canchaRepository: CanchaRepository,
    private readonly notificacionService: NotificacionService,
    private readonly disponibilidadService: DisponibilidadService,
  ) {}

  // R1 (Extract Method) + R5 (Replace Primitive with Object): crearReserva ahora recibe una
  // FranjaHoraria en vez de 3 strings sueltos (fecha, horaInicio, horaFin).
  crearReserva(clienteId: string, canchaId: string, franjaHoraria: FranjaHoraria): Reserva {
    const cancha = this.buscarCanchaOFallar(canchaId);
    this.disponibilidadService.verificarDisponibilidad(canchaId, franjaHoraria);
    const precioTotal = this.calcularTarifa(cancha, franjaHoraria.horaInicio);
    const reserva = this.crearYPersistirReserva(clienteId, canchaId, franjaHoraria, precioTotal);
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

    const inicioReserva = reserva.franjaHoraria.calcularInicioComoFecha();
    const ahora = new Date();
    const horasDeAntelacion = (inicioReserva.getTime() - ahora.getTime()) / MILISEGUNDOS_POR_HORA;

    if (horasDeAntelacion < ANTELACION_MINIMA_CANCELACION_HORAS) {
      throw new Error(
        `No se puede cancelar con menos de ${ANTELACION_MINIMA_CANCELACION_HORAS} horas de antelación`,
      );
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

  // SMELL 5 (Complex Conditional) + SMELL 6 (Magic Numbers de tarifa) — se corrige en R6 (Strategy).
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
    franjaHoraria: FranjaHoraria,
    precioTotal: number,
  ): Reserva {
    const reserva = new Reserva(
      generarId('res'),
      clienteId,
      canchaId,
      franjaHoraria,
      precioTotal,
      new Date(),
    );
    reserva.estado = EstadoReserva.CONFIRMADA;
    this.reservaRepository.guardar(reserva);
    return reserva;
  }
}
