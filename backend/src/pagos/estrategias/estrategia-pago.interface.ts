import type { Pago } from '../pago.entity';

// EstrategiaPago: cada medio de pago decide cómo ejecutar el cobro (patrón Strategy).
export interface EstrategiaPago {
  ejecutar(pago: Pago): boolean;
}
