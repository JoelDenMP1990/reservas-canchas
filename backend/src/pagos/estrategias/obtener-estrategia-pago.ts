import { BadRequestException } from '@nestjs/common';
import { EstrategiaPago } from './estrategia-pago.interface';
import { EstrategiaTarjeta } from './estrategia-tarjeta';
import { EstrategiaEfectivo } from './estrategia-efectivo';
import { EstrategiaTransferencia } from './estrategia-transferencia';

const ESTRATEGIAS: Record<string, EstrategiaPago> = {
  TARJETA: new EstrategiaTarjeta(),
  EFECTIVO: new EstrategiaEfectivo(),
  TRANSFERENCIA: new EstrategiaTransferencia(),
};

// obtenerEstrategiaPago(): selecciona la estrategia según el medio de pago (patrón Strategy).
export function obtenerEstrategiaPago(metodoPago: string): EstrategiaPago {
  const estrategia = ESTRATEGIAS[metodoPago?.toUpperCase()];
  if (!estrategia) {
    throw new BadRequestException(`Método de pago no soportado: ${metodoPago}`);
  }
  return estrategia;
}
