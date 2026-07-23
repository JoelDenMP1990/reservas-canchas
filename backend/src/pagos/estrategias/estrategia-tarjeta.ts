import { EstrategiaPago } from './estrategia-pago.interface';
import type { Pago } from '../pago.entity';

// EstrategiaTarjeta: simula la autorización con la pasarela de pago.
export class EstrategiaTarjeta implements EstrategiaPago {
  ejecutar(pago: Pago): boolean {
    return true;
  }
}
