import { EstrategiaPago } from './estrategia-pago.interface';
import type { Pago } from '../pago.entity';

// EstrategiaTransferencia: simula la verificación del comprobante de transferencia.
export class EstrategiaTransferencia implements EstrategiaPago {
  ejecutar(pago: Pago): boolean {
    return true;
  }
}
