import { EstadoReserva } from './EstadoReserva';
import { FranjaHoraria } from './FranjaHoraria';

export class Reserva {
  public estado: EstadoReserva;

  constructor(
    public readonly id: string,
    public readonly clienteId: string,
    public readonly canchaId: string,
    public readonly franjaHoraria: FranjaHoraria,
    public precioTotal: number,
    public readonly fechaCreacion: Date,
  ) {
    this.estado = EstadoReserva.PENDIENTE;
  }
}
