import { Reserva } from '../../src/domain/Reserva';
import { EstadoReserva } from '../../src/domain/EstadoReserva';

describe('Reserva', () => {
  test('se crea en estado PENDIENTE por defecto', () => {
    const reserva = new Reserva('r1', 'cliente-1', 'cancha-1', '2026-08-01', '07:00', '08:00', 40, new Date());

    expect(reserva.estado).toBe(EstadoReserva.PENDIENTE);
  });
});
