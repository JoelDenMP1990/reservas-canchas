import { Cancha } from '../Cancha';

export interface EstrategiaTarifa {
  calcular(cancha: Cancha): number;
}
