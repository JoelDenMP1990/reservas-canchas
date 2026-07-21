import { Reserva } from './reserva.entity';
import { Cancha } from '../canchas/cancha.entity';

describe('Reserva', () => {
  it('confirmar() cambia el estado a CONFIRMADA', () => {
    const reserva = new Reserva();
    reserva.estado = 'PENDIENTE';
    reserva.confirmar();
    expect(reserva.estado).toBe('CONFIRMADA');
  });

  it('cancelar() cambia el estado a CANCELADA', () => {
    const reserva = new Reserva();
    reserva.estado = 'CONFIRMADA';
    reserva.cancelar();
    expect(reserva.estado).toBe('CANCELADA');
  });

  it('calcularPrecio() multiplica las horas reservadas por la tarifa de la cancha', () => {
    const cancha = new Cancha();
    cancha.tarifaBasePorHora = 10;

    const reserva = new Reserva();
    reserva.cancha = cancha;
    reserva.horaInicio = new Date('2026-08-01T10:00:00');
    reserva.horaFin = new Date('2026-08-01T12:00:00');

    expect(reserva.calcularPrecio()).toBe(20);
  });
});
