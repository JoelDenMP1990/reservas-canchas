import { EstrategiaPago } from './estrategia-pago.interface';

// EstrategiaTransferencia: simula la verificación del comprobante de transferencia.
export class EstrategiaTransferencia implements EstrategiaPago {
  ejecutar(): boolean {
    return true;
  }
}
