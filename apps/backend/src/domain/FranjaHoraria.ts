export class FranjaHoraria {
  constructor(
    public readonly fecha: string,
    public readonly horaInicio: string,
    public readonly horaFin: string,
  ) {}

  seSolapaCon(otra: FranjaHoraria): boolean {
    if (this.fecha !== otra.fecha) {
      return false;
    }
    return !(this.horaFin <= otra.horaInicio || this.horaInicio >= otra.horaFin);
  }

  horaInicioComoNumero(): number {
    return parseInt(this.horaInicio.split(':')[0], 10);
  }

  calcularInicioComoFecha(): Date {
    return new Date(`${this.fecha}T${this.horaInicio}:00`);
  }
}
