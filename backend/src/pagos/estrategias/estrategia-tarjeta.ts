import { EstrategiaPago } from './estrategia-pago.interface';

// EstrategiaTarjeta: simula la autorización con la pasarela de pago.
export class EstrategiaTarjeta implements EstrategiaPago {
  ejecutar(): boolean {
    return true;
  }
}
