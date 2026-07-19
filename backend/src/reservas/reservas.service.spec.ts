import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { Reserva } from './reserva.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Cancha } from '../canchas/cancha.entity';

describe('ReservasService', () => {
  let service: ReservasService;
  let clientesRepositorio: { findOneBy: jest.Mock };
  let canchasRepositorio: { findOneBy: jest.Mock };
  let reservasRepositorio: { create: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    clientesRepositorio = { findOneBy: jest.fn() };
    canchasRepositorio = { findOneBy: jest.fn() };
    reservasRepositorio = {
      create: jest.fn((datos) => Object.assign(new Reserva(), datos)),
      save: jest.fn((reserva) => Promise.resolve(reserva)),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ReservasService,
        { provide: getRepositoryToken(Reserva), useValue: reservasRepositorio },
        { provide: getRepositoryToken(Cliente), useValue: clientesRepositorio },
        { provide: getRepositoryToken(Cancha), useValue: canchasRepositorio },
      ],
    }).compile();

    service = moduleRef.get(ReservasService);
  });

  it('crea una reserva y calcula el monto según la tarifa de la cancha', async () => {
    const cliente = Object.assign(new Cliente(), { id: 'cliente-1' });
    const cancha = Object.assign(new Cancha(), { id: 'cancha-1', activa: true, tarifaBasePorHora: 10 });
    clientesRepositorio.findOneBy.mockResolvedValue(cliente);
    canchasRepositorio.findOneBy.mockResolvedValue(cancha);

    const reserva = await service.crear({
      clienteId: 'cliente-1',
      canchaId: 'cancha-1',
      horaInicio: '2026-08-01T10:00:00',
      horaFin: '2026-08-01T12:00:00',
    });

    expect(reserva.monto).toBe(20);
    expect(reserva.estado).toBe('PENDIENTE');
  });

  it('rechaza la reserva si la cancha no está activa', async () => {
    const cliente = Object.assign(new Cliente(), { id: 'cliente-1' });
    const cancha = Object.assign(new Cancha(), { id: 'cancha-1', activa: false, tarifaBasePorHora: 10 });
    clientesRepositorio.findOneBy.mockResolvedValue(cliente);
    canchasRepositorio.findOneBy.mockResolvedValue(cancha);

    await expect(
      service.crear({
        clienteId: 'cliente-1',
        canchaId: 'cancha-1',
        horaInicio: '2026-08-01T10:00:00',
        horaFin: '2026-08-01T12:00:00',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
