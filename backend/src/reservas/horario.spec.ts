import { Horario } from './horario';

describe('Horario', () => {
  it('duracionEnHoras() calcula correctamente las horas entre inicio y fin', () => {
    const horario = new Horario(
      new Date('2026-08-01T10:00:00'),
      new Date('2026-08-01T12:00:00'),
    );
    expect(horario.duracionEnHoras()).toBe(2);
  });

  it('duracionEnHoras() devuelve 1.5 para un bloque de 90 minutos', () => {
    const horario = new Horario(
      new Date('2026-08-01T09:00:00'),
      new Date('2026-08-01T10:30:00'),
    );
    expect(horario.duracionEnHoras()).toBe(1.5);
  });
});