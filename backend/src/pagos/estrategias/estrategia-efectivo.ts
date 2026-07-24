import { EstrategiaPago } from './estrategia-pago.interface';

// EstrategiaEfectivo: registro contable inmediato, sin pasarela externa.
export class EstrategiaEfectivo implements EstrategiaPago {
  ejecutar(): boolean {
    return true;
  }
}
