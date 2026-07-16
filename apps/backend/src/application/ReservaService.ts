import { Reserva } from '../domain/Reserva';
import { EstadoReserva } from '../domain/EstadoReserva';
import { Cancha } from '../domain/Cancha';
import { FranjaHoraria } from '../domain/FranjaHoraria';
import { ReservaRepository } from './ports/ReservaRepository';
import { CanchaRepository } from './ports/CanchaRepository';
import { NotificacionService } from './NotificacionService';
import { DisponibilidadService } from './DisponibilidadService';
import { SelectorEstrategiaTarifa } from './SelectorEstrategiaTarifa';
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
    private readonly selectorEstrategiaTarifa: SelectorEstrategiaTarifa,
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

  // R6 (Fase 3, Replace Conditional with Strategy): el árbol if/else de 3 niveles (tipo × franja)
  // se reemplaza por delegación a EstrategiaTarifa. El único condicional que queda es la
  // selección de franja horaria, dentro de SelectorEstrategiaTarifa — agregar un nuevo tipo de
  // cancha o una nueva franja ya no toca este método.
  private calcularTarifa(cancha: Cancha, horaInicio: string): number {
    const estrategia = this.selectorEstrategiaTarifa.seleccionar(horaInicio);
    return estrategia.calcular(cancha);
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
