import { EstrategiaPago } from './estrategia-pago.interface';
import type { Pago } from '../pago.entity';

// EstrategiaEfectivo: registro contable inmediato, sin pasarela externa.
export class EstrategiaEfectivo implements EstrategiaPago {
  ejecutar(pago: Pago): boolean {
    return true;
  }
}
