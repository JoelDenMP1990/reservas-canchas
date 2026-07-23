// Horario: encapsula horaInicio y horaFin juntos (corrige Data Clump).
// Centraliza el cálculo de duración para que Reserva.calcularPrecio()
// no opere directamente sobre fechas sueltas.
export class Horario {
  constructor(
    readonly inicio: Date,
    readonly fin: Date,
  ) {}

  duracionEnHoras(): number {
    return (this.fin.getTime() - this.inicio.getTime()) / (1000 * 60 * 60);
  }
}