import { EstadoReserva } from '../domain/EstadoReserva';
import { FranjaHoraria } from '../domain/FranjaHoraria';
import { ReservaRepository } from './ports/ReservaRepository';

export class DisponibilidadService {
  constructor(private readonly reservaRepository: ReservaRepository) {}

  verificarDisponibilidad(canchaId: string, franjaHoraria: FranjaHoraria): void {
    const reservasExistentes = this.reservaRepository.listarPorCancha(canchaId);
    for (const r of reservasExistentes) {
      const seSolapan =
        r.estado !== EstadoReserva.CANCELADA && r.franjaHoraria.seSolapaCon(franjaHoraria);
      if (seSolapan) {
        throw new Error('La cancha no está disponible en esa franja horaria');
      }
    }
  }
}
