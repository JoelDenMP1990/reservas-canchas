import { Cancha } from '../Cancha';
import { EstrategiaTarifa } from './EstrategiaTarifa';

export class TarifaEstandar implements EstrategiaTarifa {
  calcular(cancha: Cancha): number {
    return cancha.tarifaBase;
  }
}
