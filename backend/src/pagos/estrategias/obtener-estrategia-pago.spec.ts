import { obtenerEstrategiaPago } from './obtener-estrategia-pago';
import { EstrategiaTarjeta } from './estrategia-tarjeta';
import { EstrategiaEfectivo } from './estrategia-efectivo';
import { EstrategiaTransferencia } from './estrategia-transferencia';
import { Pago } from '../pago.entity';

describe('obtenerEstrategiaPago', () => {
  it('selecciona EstrategiaTarjeta para TARJETA', () => {
    expect(obtenerEstrategiaPago('TARJETA')).toBeInstanceOf(EstrategiaTarjeta);
  });

  it('selecciona EstrategiaEfectivo para EFECTIVO', () => {
    expect(obtenerEstrategiaPago('EFECTIVO')).toBeInstanceOf(EstrategiaEfectivo);
  });

  it('selecciona EstrategiaTransferencia para TRANSFERENCIA', () => {
    expect(obtenerEstrategiaPago('TRANSFERENCIA')).toBeInstanceOf(EstrategiaTransferencia);
  });

  it('no distingue mayúsculas/minúsculas', () => {
    expect(obtenerEstrategiaPago('tarjeta')).toBeInstanceOf(EstrategiaTarjeta);
  });

  it('cada estrategia ejecuta el pago devolviendo true', () => {
    expect(obtenerEstrategiaPago('EFECTIVO').ejecutar(new Pago())).toBe(true);
  });

  it('lanza error si el método de pago no está soportado', () => {
    expect(() => obtenerEstrategiaPago('CRIPTO')).toThrow('Método de pago no soportado: CRIPTO');
  });
});
