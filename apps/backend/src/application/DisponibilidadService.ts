import { EstadoReserva } from '../domain/EstadoReserva';
import { ReservaRepository } from './ports/ReservaRepository';

export class DisponibilidadService {
  constructor(private readonly reservaRepository: ReservaRepository) {}

  verificarDisponibilidad(
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
}
