import { obtenerEstrategiaPago } from './obtener-estrategia-pago';
import { EstrategiaTarjeta } from './estrategia-tarjeta';
import { EstrategiaEfectivo } from './estrategia-efectivo';
import { EstrategiaTransferencia } from './estrategia-transferencia';
import { Pago } from '../pago.entity';
import { MetodoPago } from '../metodo-pago.enum';

describe('obtenerEstrategiaPago', () => {
  it('selecciona EstrategiaTarjeta para TARJETA', () => {
    expect(obtenerEstrategiaPago(MetodoPago.TARJETA)).toBeInstanceOf(EstrategiaTarjeta);
  });

  it('selecciona EstrategiaEfectivo para EFECTIVO', () => {
    expect(obtenerEstrategiaPago(MetodoPago.EFECTIVO)).toBeInstanceOf(EstrategiaEfectivo);
  });

  it('selecciona EstrategiaTransferencia para TRANSFERENCIA', () => {
    expect(obtenerEstrategiaPago(MetodoPago.TRANSFERENCIA)).toBeInstanceOf(EstrategiaTransferencia);
  });

  it('cada estrategia ejecuta el pago devolviendo true', () => {
    expect(obtenerEstrategiaPago(MetodoPago.EFECTIVO).ejecutar(new Pago())).toBe(true);
  });

  it('lanza error si el método de pago no está soportado', () => {
    expect(() => obtenerEstrategiaPago('CRIPTO' as unknown as MetodoPago)).toThrow(
      'Método de pago no soportado: CRIPTO',
    );
  });
});
