import { BadRequestException } from '@nestjs/common';
import { Reserva } from './reserva.entity';
import { Cancha } from '../canchas/cancha.entity';
import { EstadoReserva } from './estado-reserva.enum';

describe('Reserva', () => {
  it('confirmar() cambia el estado a CONFIRMADA', () => {
    const reserva = new Reserva();
    reserva.estado = EstadoReserva.PENDIENTE;
    reserva.confirmar();
    expect(reserva.estado).toBe(EstadoReserva.CONFIRMADA);
  });

  it('cancelar() cambia el estado a CANCELADA si faltan al menos 2 horas para el inicio', () => {
    const reserva = new Reserva();
    reserva.estado = EstadoReserva.CONFIRMADA;
    reserva.horaInicio = new Date(Date.now() + 3 * 60 * 60 * 1000);
    reserva.cancelar();
    expect(reserva.estado).toBe(EstadoReserva.CANCELADA);
  });

  it('cancelar() rechaza la cancelación si faltan menos de 2 horas para el inicio', () => {
    const reserva = new Reserva();
    reserva.estado = EstadoReserva.CONFIRMADA;
    reserva.horaInicio = new Date(Date.now() + 30 * 60 * 1000);

    expect(() => reserva.cancelar()).toThrow(BadRequestException);
    expect(reserva.estado).toBe(EstadoReserva.CONFIRMADA);
  });

  it('cancelar() rechaza cancelar una reserva que ya está cancelada', () => {
    const reserva = new Reserva();
    reserva.estado = EstadoReserva.CANCELADA;
    reserva.horaInicio = new Date(Date.now() + 3 * 60 * 60 * 1000);

    expect(() => reserva.cancelar()).toThrow(BadRequestException);
  });

  it('cancelar() rechaza con un mensaje distinto si el horario ya pasó', () => {
    const reserva = new Reserva();
    reserva.estado = EstadoReserva.CONFIRMADA;
    reserva.horaInicio = new Date(Date.now() - 60 * 60 * 1000);

    expect(() => reserva.cancelar()).toThrow('No se puede cancelar una reserva cuyo horario ya pasó');
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
