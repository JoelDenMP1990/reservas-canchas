import { Pago } from './pago.entity';

describe('Pago', () => {
  it('procesar() marca la fecha de procesado y devuelve true para un medio soportado', () => {
    const pago = new Pago();
    pago.metodoPago = 'EFECTIVO';
    expect(pago.procesadoEn).toBeUndefined();

    const resultado = pago.procesar();

    expect(resultado).toBe(true);
    expect(pago.procesadoEn).toBeInstanceOf(Date);
  });

  it('procesar() delega en la estrategia según el medio de pago (TARJETA, EFECTIVO, TRANSFERENCIA)', () => {
    for (const metodoPago of ['TARJETA', 'EFECTIVO', 'TRANSFERENCIA']) {
      const pago = new Pago();
      pago.metodoPago = metodoPago;
      expect(pago.procesar()).toBe(true);
    }
  });

  it('procesar() lanza error si el método de pago no está soportado', () => {
    const pago = new Pago();
    pago.metodoPago = 'CRIPTO';

    expect(() => pago.procesar()).toThrow('Método de pago no soportado: CRIPTO');
  });
});
