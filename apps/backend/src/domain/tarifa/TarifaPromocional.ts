import { Cancha } from '../Cancha';
import { TipoCancha } from '../TipoCancha';
import { EstrategiaTarifa } from './EstrategiaTarifa';

const FACTOR_VALLE_FUTBOL = 0.8;
const FACTOR_VALLE_BASQUET = 0.9;
const FACTOR_VALLE_OTROS = 0.85;

// Descuento aplicado en horario de baja demanda (valle).
export class TarifaPromocional implements EstrategiaTarifa {
  calcular(cancha: Cancha): number {
    switch (cancha.tipo) {
      case TipoCancha.FUTBOL:
        return cancha.tarifaBase * FACTOR_VALLE_FUTBOL;
      case TipoCancha.BASQUET:
        return cancha.tarifaBase * FACTOR_VALLE_BASQUET;
      default:
        return cancha.tarifaBase * FACTOR_VALLE_OTROS;
    }
  }
}
