import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdministradoresService } from './administradores.service';
import { Administrador } from './administrador.entity';
import { Cancha } from '../canchas/cancha.entity';
import { Reserva } from '../reservas/reserva.entity';

describe('AdministradoresService', () => {
  let service: AdministradoresService;
  let administradoresRepositorio: { findOneBy: jest.Mock };
  let canchasRepositorio: { find: jest.Mock };
  let reservasRepositorio: { find: jest.Mock };

  const hoy = new Date();
  const horaHoy = (h: number, m = 0) => new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), h, m);

  beforeEach(async () => {
    administradoresRepositorio = { findOneBy: jest.fn() };
    canchasRepositorio = { find: jest.fn() };
    reservasRepositorio = { find: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdministradoresService,
        { provide: getRepositoryToken(Administrador), useValue: administradoresRepositorio },
        { provide: getRepositoryToken(Cancha), useValue: canchasRepositorio },
        { provide: getRepositoryToken(Reserva), useValue: reservasRepositorio },
      ],
    }).compile();

    service = moduleRef.get(AdministradoresService);
  });

  it('listarCanchas() parte el horario de la cancha en franjas de 1 hora, todas libres sin reservas', async () => {
    administradoresRepositorio.findOneBy.mockResolvedValue(Object.assign(new Administrador(), { id: 'admin-1' }));
    const cancha = Object.assign(new Cancha(), {
      id: 'cancha-1',
      nombre: 'Cancha 1',
      horaAperturaDesde: '09:00:00',
      horaCierreHasta: '11:00:00',
    });
    canchasRepositorio.find.mockResolvedValue([cancha]);
    reservasRepositorio.find.mockResolvedValue([]);

    const [resultado] = await service.listarCanchas('admin-1');

    expect(resultado.horarios).toEqual([
      { inicio: '09:00', fin: '10:00', ocupada: false },
      { inicio: '10:00', fin: '11:00', ocupada: false },
    ]);
  });

  it('listarCanchas() marca ocupada solo la franja que cruza con una reserva confirmada', async () => {
    administradoresRepositorio.findOneBy.mockResolvedValue(Object.assign(new Administrador(), { id: 'admin-1' }));
    const cancha = Object.assign(new Cancha(), {
      id: 'cancha-1',
      nombre: 'Cancha 1',
      horaAperturaDesde: '09:00:00',
      horaCierreHasta: '11:00:00',
    });
    canchasRepositorio.find.mockResolvedValue([cancha]);
    reservasRepositorio.find.mockResolvedValue([
      Object.assign(new Reserva(), {
        estado: 'CONFIRMADA',
        horaInicio: horaHoy(9, 0),
        horaFin: horaHoy(10, 0),
      }),
    ]);

    const [resultado] = await service.listarCanchas('admin-1');

    expect(resultado.horarios).toEqual([
      { inicio: '09:00', fin: '10:00', ocupada: true },
      { inicio: '10:00', fin: '11:00', ocupada: false },
    ]);
  });
});
