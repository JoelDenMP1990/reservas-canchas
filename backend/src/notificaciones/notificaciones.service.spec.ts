import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { Notificacion } from './notificacion.entity';
import { Reserva } from '../reservas/reserva.entity';

describe('NotificacionesService', () => {
  let service: NotificacionesService;

  const notificacionesRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const reservasRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NotificacionesService,
        {
          provide: getRepositoryToken(Notificacion),
          useValue: notificacionesRepository,
        },
        {
          provide: getRepositoryToken(Reserva),
          useValue: reservasRepository,
        },
      ],
    }).compile();

    service = module.get<NotificacionesService>(NotificacionesService);

    jest.clearAllMocks();
  });

  it('debe listar las notificaciones', async () => {
    notificacionesRepository.find.mockResolvedValue([]);
    expect(await service.listar()).toEqual([]);
  });

  it('debe lanzar error si no encuentra una notificación', async () => {
    notificacionesRepository.findOne.mockResolvedValue(null);

    await expect(service.obtenerPorId('1')).rejects.toThrow(NotFoundException);
  });

  it('debe eliminar una notificación', async () => {
    const notificacion = {} as Notificacion;

    jest.spyOn(service, 'obtenerPorId').mockResolvedValue(notificacion);

    await service.eliminar('1');

    expect(notificacionesRepository.remove).toHaveBeenCalledWith(notificacion);
  });

  it('debe lanzar error si la reserva no existe', async () => {
    reservasRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.crear({
        reservaId: '1',
        tipo: 'CONFIRMACION',
        mensaje: 'Tu reserva fue confirmada',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('debe crear y enviar una notificación', async () => {
    const reserva = { id: '1' };
    reservasRepository.findOneBy.mockResolvedValue(reserva);

    const notificacionCreada = new Notificacion();
    Object.assign(notificacionCreada, { reserva, tipo: 'CONFIRMACION', mensaje: 'Tu reserva fue confirmada' });
    notificacionesRepository.create.mockReturnValue(notificacionCreada);
    notificacionesRepository.save.mockImplementation((n) => Promise.resolve(n));

    const resultado = await service.crear({
      reservaId: '1',
      tipo: 'CONFIRMACION',
      mensaje: 'Tu reserva fue confirmada',
    });

    expect(notificacionesRepository.create).toHaveBeenCalledWith({
      reserva,
      tipo: 'CONFIRMACION',
      mensaje: 'Tu reserva fue confirmada',
    });
    expect(resultado.enviadaEn).toBeInstanceOf(Date);
    expect(notificacionesRepository.save).toHaveBeenCalledWith(notificacionCreada);
  });
});
