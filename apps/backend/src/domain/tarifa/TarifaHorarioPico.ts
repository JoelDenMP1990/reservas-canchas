import { Cancha } from '../Cancha';
import { TipoCancha } from '../TipoCancha';
import { EstrategiaTarifa } from './EstrategiaTarifa';

const FACTOR_PICO_FUTBOL = 1.3;
const FACTOR_PICO_BASQUET = 1.2;

// Recargo aplicado en horario de alta demanda (pico).
export class TarifaHorarioPico implements EstrategiaTarifa {
  calcular(cancha: Cancha): number {
    switch (cancha.tipo) {
      case TipoCancha.FUTBOL:
        return cancha.tarifaBase * FACTOR_PICO_FUTBOL;
      case TipoCancha.BASQUET:
        return cancha.tarifaBase * FACTOR_PICO_BASQUET;
      default:
        return cancha.tarifaBase;
    }
  }
}
