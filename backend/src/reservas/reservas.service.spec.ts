import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { Reserva } from './reserva.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Cancha } from '../canchas/cancha.entity';
import { Pago } from '../pagos/pago.entity';
import { Notificacion } from '../notificaciones/notificacion.entity';
import { MetodoPago } from '../pagos/metodo-pago.enum';

describe('ReservasService', () => {
  let service: ReservasService;
  let clientesRepositorio: { findOneBy: jest.Mock };
  let canchasRepositorio: { findOneBy: jest.Mock };
  let reservasRepositorio: { create: jest.Mock; save: jest.Mock; findOne: jest.Mock };
  let pagosRepositorio: { create: jest.Mock; save: jest.Mock };
  let notificacionesRepositorio: { create: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    clientesRepositorio = { findOneBy: jest.fn() };
    canchasRepositorio = { findOneBy: jest.fn() };
    reservasRepositorio = {
      create: jest.fn((datos) => Object.assign(new Reserva(), datos)),
      save: jest.fn((reserva) => Promise.resolve(reserva)),
      findOne: jest.fn(),
    };
    pagosRepositorio = {
      create: jest.fn((datos) => Object.assign(new Pago(), datos)),
      save: jest.fn((pago) => Promise.resolve(pago)),
    };
    notificacionesRepositorio = {
      create: jest.fn((datos) => Object.assign(new Notificacion(), datos)),
      save: jest.fn((notificacion) => Promise.resolve(notificacion)),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ReservasService,
        { provide: getRepositoryToken(Reserva), useValue: reservasRepositorio },
        { provide: getRepositoryToken(Cliente), useValue: clientesRepositorio },
        { provide: getRepositoryToken(Cancha), useValue: canchasRepositorio },
        { provide: getRepositoryToken(Pago), useValue: pagosRepositorio },
        { provide: getRepositoryToken(Notificacion), useValue: notificacionesRepositorio },
      ],
    }).compile();

    service = moduleRef.get(ReservasService);
  });

  it('crea, calcula el monto, procesa el pago y confirma la reserva (cancha de pago)', async () => {
    const cliente = Object.assign(new Cliente(), { id: 'cliente-1' });
    const cancha = Object.assign(new Cancha(), { id: 'cancha-1', activa: true, tarifaBasePorHora: 10 });
    clientesRepositorio.findOneBy.mockResolvedValue(cliente);
    canchasRepositorio.findOneBy.mockResolvedValue(cancha);

    const reserva = await service.crear({
      clienteId: 'cliente-1',
      canchaId: 'cancha-1',
      horaInicio: '2026-08-01T10:00:00',
      horaFin: '2026-08-01T12:00:00',
      metodoPago: MetodoPago.EFECTIVO,
    });

    expect(reserva.monto).toBe(20);
    expect(reserva.estado).toBe('CONFIRMADA');
    expect(pagosRepositorio.save).toHaveBeenCalledTimes(1);
    expect(notificacionesRepositorio.save).toHaveBeenCalledTimes(1);
    expect(notificacionesRepositorio.create).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'CONFIRMACION' }),
    );
  });

  it('confirma la reserva sin generar pago cuando la cancha es gratuita', async () => {
    const cliente = Object.assign(new Cliente(), { id: 'cliente-1' });
    const cancha = Object.assign(new Cancha(), { id: 'cancha-1', activa: true, tarifaBasePorHora: 0 });
    clientesRepositorio.findOneBy.mockResolvedValue(cliente);
    canchasRepositorio.findOneBy.mockResolvedValue(cancha);

    const reserva = await service.crear({
      clienteId: 'cliente-1',
      canchaId: 'cancha-1',
      horaInicio: '2026-08-01T10:00:00',
      horaFin: '2026-08-01T12:00:00',
    });

    expect(reserva.estado).toBe('CONFIRMADA');
    expect(pagosRepositorio.create).not.toHaveBeenCalled();
    expect(notificacionesRepositorio.save).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['la cancha no está activa', { activa: false, tarifaBasePorHora: 10 }, '2026-08-01T10:00:00', '2026-08-01T12:00:00'],
    ['la hora de inicio ya pasó', { activa: true, tarifaBasePorHora: 10 }, '2020-01-01T10:00:00', '2020-01-01T12:00:00'],
    [
      'la hora de fin no es posterior a la de inicio',
      { activa: true, tarifaBasePorHora: 10 },
      '2026-08-01T12:00:00',
      '2026-08-01T10:00:00',
    ],
  ])('rechaza crear una reserva si %s', async (_descripcion, datosCancha, horaInicio, horaFin) => {
    const cliente = Object.assign(new Cliente(), { id: 'cliente-1' });
    const cancha = Object.assign(new Cancha(), { id: 'cancha-1', ...datosCancha });
    clientesRepositorio.findOneBy.mockResolvedValue(cliente);
    canchasRepositorio.findOneBy.mockResolvedValue(cancha);

    await expect(
      service.crear({ clienteId: 'cliente-1', canchaId: 'cancha-1', horaInicio, horaFin }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza crear una reserva si la cancha ya tiene otra reserva confirmada en ese horario', async () => {
    const cliente = Object.assign(new Cliente(), { id: 'cliente-1' });
    const cancha = Object.assign(new Cancha(), { id: 'cancha-1', activa: true, tarifaBasePorHora: 10 });
    clientesRepositorio.findOneBy.mockResolvedValue(cliente);
    canchasRepositorio.findOneBy.mockResolvedValue(cancha);
    reservasRepositorio.findOne.mockResolvedValue(
      Object.assign(new Reserva(), { id: 'reserva-existente', estado: 'CONFIRMADA' }),
    );

    await expect(
      service.crear({
        clienteId: 'cliente-1',
        canchaId: 'cancha-1',
        horaInicio: '2026-08-01T10:00:00',
        horaFin: '2026-08-01T12:00:00',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('consultarDisponibilidad() devuelve false si la cancha ya está reservada en ese horario', async () => {
    const cancha = Object.assign(new Cancha(), { id: 'cancha-1', activa: true });
    canchasRepositorio.findOneBy.mockResolvedValue(cancha);
    reservasRepositorio.findOne.mockResolvedValue(Object.assign(new Reserva(), { id: 'reserva-existente' }));

    const disponible = await service.consultarDisponibilidad('cancha-1', '2026-08-01T10:00:00', '2026-08-01T12:00:00');

    expect(disponible).toBe(false);
  });

  it('consultarDisponibilidad() devuelve true si la cancha está libre en ese horario', async () => {
    const cancha = Object.assign(new Cancha(), { id: 'cancha-1', activa: true });
    canchasRepositorio.findOneBy.mockResolvedValue(cancha);
    reservasRepositorio.findOne.mockResolvedValue(null);

    const disponible = await service.consultarDisponibilidad('cancha-1', '2026-08-01T10:00:00', '2026-08-01T12:00:00');

    expect(disponible).toBe(true);
  });

  it('consultarDisponibilidad() devuelve false si la cancha no está activa', async () => {
    const cancha = Object.assign(new Cancha(), { id: 'cancha-1', activa: false });
    canchasRepositorio.findOneBy.mockResolvedValue(cancha);

    const disponible = await service.consultarDisponibilidad('cancha-1', '2026-08-01T10:00:00', '2026-08-01T12:00:00');

    expect(disponible).toBe(false);
  });

  it('cancelar() notifica al cliente cuando faltan al menos 2 horas para el inicio', async () => {
    const reserva = Object.assign(new Reserva(), {
      id: 'reserva-1',
      estado: 'CONFIRMADA',
      horaInicio: new Date(Date.now() + 3 * 60 * 60 * 1000),
    });
    reservasRepositorio.findOne.mockResolvedValue(reserva);

    const resultado = await service.cancelar('reserva-1');

    expect(resultado.estado).toBe('CANCELADA');
    expect(notificacionesRepositorio.create).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'CANCELACION' }),
    );
  });

  it('cancelar() rechaza y no notifica si faltan menos de 2 horas para el inicio', async () => {
    const reserva = Object.assign(new Reserva(), {
      id: 'reserva-1',
      estado: 'CONFIRMADA',
      horaInicio: new Date(Date.now() + 30 * 60 * 1000),
    });
    reservasRepositorio.findOne.mockResolvedValue(reserva);

    await expect(service.cancelar('reserva-1')).rejects.toBeInstanceOf(BadRequestException);
    expect(notificacionesRepositorio.save).not.toHaveBeenCalled();
  });

});
