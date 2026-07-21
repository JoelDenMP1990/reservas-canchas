import { Notificacion } from './notificacion.entity';

describe('Notificacion', () => {
  it('enviar() marca la fecha de envío y devuelve true', () => {
    const notificacion = new Notificacion();
    expect(notificacion.enviadaEn).toBeUndefined();

    const resultado = notificacion.enviar();

    expect(resultado).toBe(true);
    expect(notificacion.enviadaEn).toBeInstanceOf(Date);
  });
});
