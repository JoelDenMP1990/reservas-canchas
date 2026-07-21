import { Pago } from './pago.entity';

describe('Pago', () => {
  it('procesar() marca la fecha de procesado y devuelve true', () => {
    const pago = new Pago();
    expect(pago.procesadoEn).toBeUndefined();

    const resultado = pago.procesar();

    expect(resultado).toBe(true);
    expect(pago.procesadoEn).toBeInstanceOf(Date);
  });
});
