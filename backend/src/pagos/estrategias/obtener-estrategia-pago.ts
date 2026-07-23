import { BadRequestException } from '@nestjs/common';
import { EstrategiaPago } from './estrategia-pago.interface';
import { EstrategiaTarjeta } from './estrategia-tarjeta';
import { EstrategiaEfectivo } from './estrategia-efectivo';
import { EstrategiaTransferencia } from './estrategia-transferencia';
import { MetodoPago } from '../metodo-pago.enum';

const ESTRATEGIAS: Record<MetodoPago, EstrategiaPago> = {
  [MetodoPago.TARJETA]: new EstrategiaTarjeta(),
  [MetodoPago.EFECTIVO]: new EstrategiaEfectivo(),
  [MetodoPago.TRANSFERENCIA]: new EstrategiaTransferencia(),
};

// obtenerEstrategiaPago(): selecciona la estrategia según el medio de pago (patrón Strategy).
export function obtenerEstrategiaPago(metodoPago: MetodoPago): EstrategiaPago {
  const estrategia = ESTRATEGIAS[metodoPago];
  if (!estrategia) {
    throw new BadRequestException(`Método de pago no soportado: ${metodoPago}`);
  }
  return estrategia;
}
