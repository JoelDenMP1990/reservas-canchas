import { FranjaHoraria } from '../../src/domain/FranjaHoraria';

describe('FranjaHoraria', () => {
  test('detecta solapamiento entre franjas del mismo día', () => {
    const a = new FranjaHoraria('2026-08-01', '07:00', '08:00');
    const b = new FranjaHoraria('2026-08-01', '07:30', '08:30');

    expect(a.seSolapaCon(b)).toBe(true);
  });

  test('no detecta solapamiento entre franjas consecutivas del mismo día', () => {
    const a = new FranjaHoraria('2026-08-01', '07:00', '08:00');
    const b = new FranjaHoraria('2026-08-01', '08:00', '09:00');

    expect(a.seSolapaCon(b)).toBe(false);
  });

  test('no detecta solapamiento entre franjas de días distintos', () => {
    const a = new FranjaHoraria('2026-08-01', '07:00', '08:00');
    const b = new FranjaHoraria('2026-08-02', '07:00', '08:00');

    expect(a.seSolapaCon(b)).toBe(false);
  });
});
