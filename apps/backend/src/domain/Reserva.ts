import { EstadoReserva } from './EstadoReserva';

// SMELL (Primitive Obsession): la franja horaria se representa con 3 strings sueltos
// (fecha, horaInicio, horaFin) en vez de un value object dedicado. Se corrige en la
// refactorización R5 (Fase 3) introduciendo FranjaHoraria.
export class Reserva {
  public estado: EstadoReserva;

  constructor(
    public readonly id: string,
    public readonly clienteId: string,
    public readonly canchaId: string,
    public readonly fecha: string,
    public readonly horaInicio: string,
    public readonly horaFin: string,
    public precioTotal: number,
    public readonly fechaCreacion: Date,
  ) {
    this.estado = EstadoReserva.PENDIENTE;
  }
}
