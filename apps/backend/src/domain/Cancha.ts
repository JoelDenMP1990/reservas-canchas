import { TipoCancha } from './TipoCancha';

export class Cancha {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly tipo: TipoCancha,
    public readonly tarifaBase: number,
    public readonly ubicacion: string,
  ) {}
}
