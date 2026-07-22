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
  let reservasRepositorio: { findOne: jest.Mock };

  beforeEach(async () => {
    administradoresRepositorio = { findOneBy: jest.fn() };
    canchasRepositorio = { find: jest.fn() };
    reservasRepositorio = { findOne: jest.fn() };

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

  it('listarCanchas() marca ocupadaAhora=true si hay una reserva confirmada en curso', async () => {
    administradoresRepositorio.findOneBy.mockResolvedValue(Object.assign(new Administrador(), { id: 'admin-1' }));
    const cancha = Object.assign(new Cancha(), { id: 'cancha-1', nombre: 'Cancha 1' });
    canchasRepositorio.find.mockResolvedValue([cancha]);
    reservasRepositorio.findOne.mockResolvedValue(Object.assign(new Reserva(), { id: 'reserva-1' }));

    const resultado = await service.listarCanchas('admin-1');

    expect(resultado).toEqual([{ ...cancha, ocupadaAhora: true }]);
  });

  it('listarCanchas() marca ocupadaAhora=false si no hay ninguna reserva en curso', async () => {
    administradoresRepositorio.findOneBy.mockResolvedValue(Object.assign(new Administrador(), { id: 'admin-1' }));
    const cancha = Object.assign(new Cancha(), { id: 'cancha-1', nombre: 'Cancha 1' });
    canchasRepositorio.find.mockResolvedValue([cancha]);
    reservasRepositorio.findOne.mockResolvedValue(null);

    const resultado = await service.listarCanchas('admin-1');

    expect(resultado).toEqual([{ ...cancha, ocupadaAhora: false }]);
  });
});
