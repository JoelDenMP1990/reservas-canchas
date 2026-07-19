import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CanchasService } from './canchas.service';
import { Cancha } from './cancha.entity';
import { Administrador } from '../administradores/administrador.entity';

describe('CanchasService', () => {
  let service: CanchasService;
  let canchasRepositorio: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let administradoresRepositorio: { findOneBy: jest.Mock };

  beforeEach(async () => {
    canchasRepositorio = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((datos) => Object.assign(new Cancha(), datos)),
      save: jest.fn((cancha) => Promise.resolve(cancha)),
      remove: jest.fn(() => Promise.resolve()),
    };
    administradoresRepositorio = { findOneBy: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CanchasService,
        { provide: getRepositoryToken(Cancha), useValue: canchasRepositorio },
        { provide: getRepositoryToken(Administrador), useValue: administradoresRepositorio },
      ],
    }).compile();

    service = moduleRef.get(CanchasService);
  });

  describe('listar()', () => {
    it('devuelve las canchas con su administrador', async () => {
      const canchas = [Object.assign(new Cancha(), { id: 'cancha-1' })];
      canchasRepositorio.find.mockResolvedValue(canchas);

      const resultado = await service.listar();

      expect(resultado).toBe(canchas);
      expect(canchasRepositorio.find).toHaveBeenCalledWith({ relations: ['administrador'] });
    });
  });

  describe('obtenerPorId()', () => {
    it('devuelve la cancha cuando existe', async () => {
      const cancha = Object.assign(new Cancha(), { id: 'cancha-1' });
      canchasRepositorio.findOne.mockResolvedValue(cancha);

      const resultado = await service.obtenerPorId('cancha-1');

      expect(resultado).toBe(cancha);
      expect(canchasRepositorio.findOne).toHaveBeenCalledWith({
        where: { id: 'cancha-1' },
        relations: ['administrador'],
      });
    });

    it('lanza NotFoundException cuando la cancha no existe', async () => {
      canchasRepositorio.findOne.mockResolvedValue(null);

      await expect(service.obtenerPorId('inexistente')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('crear()', () => {
    it('crea la cancha asociándola al administrador indicado', async () => {
      const administrador = Object.assign(new Administrador(), { id: 'admin-1' });
      administradoresRepositorio.findOneBy.mockResolvedValue(administrador);

      const cancha = await service.crear({
        nombre: 'Cancha Fútbol 1',
        tipo: 'Futbol',
        tarifaBasePorHora: 15,
        horaAperturaDesde: '08:00',
        horaCierreHasta: '22:00',
        administradorId: 'admin-1',
      });

      expect(administradoresRepositorio.findOneBy).toHaveBeenCalledWith({ id: 'admin-1' });
      expect(cancha.administrador).toBe(administrador);
      expect(cancha.nombre).toBe('Cancha Fútbol 1');
      expect(canchasRepositorio.save).toHaveBeenCalledWith(cancha);
    });

    it('lanza NotFoundException si el administrador no existe', async () => {
      administradoresRepositorio.findOneBy.mockResolvedValue(null);

      await expect(
        service.crear({
          nombre: 'Cancha Fútbol 1',
          tipo: 'Futbol',
          tarifaBasePorHora: 15,
          horaAperturaDesde: '08:00',
          horaCierreHasta: '22:00',
          administradorId: 'inexistente',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(canchasRepositorio.save).not.toHaveBeenCalled();
    });
  });

  describe('editar()', () => {
    it('aplica los cambios sobre la cancha existente', async () => {
      const cancha = Object.assign(new Cancha(), {
        id: 'cancha-1',
        nombre: 'Cancha vieja',
        tarifaBasePorHora: 10,
        activa: true,
      });
      canchasRepositorio.findOne.mockResolvedValue(cancha);

      const resultado = await service.editar('cancha-1', { nombre: 'Cancha nueva', activa: false });

      expect(resultado.nombre).toBe('Cancha nueva');
      expect(resultado.activa).toBe(false);
      expect(resultado.tarifaBasePorHora).toBe(10);
      expect(canchasRepositorio.save).toHaveBeenCalledWith(cancha);
    });

    it('lanza NotFoundException si la cancha a editar no existe', async () => {
      canchasRepositorio.findOne.mockResolvedValue(null);

      await expect(service.editar('inexistente', { nombre: 'X' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('eliminar()', () => {
    it('elimina la cancha existente', async () => {
      const cancha = Object.assign(new Cancha(), { id: 'cancha-1' });
      canchasRepositorio.findOne.mockResolvedValue(cancha);

      await service.eliminar('cancha-1');

      expect(canchasRepositorio.remove).toHaveBeenCalledWith(cancha);
    });

    it('lanza NotFoundException si la cancha a eliminar no existe', async () => {
      canchasRepositorio.findOne.mockResolvedValue(null);

      await expect(service.eliminar('inexistente')).rejects.toBeInstanceOf(NotFoundException);
      expect(canchasRepositorio.remove).not.toHaveBeenCalled();
    });
  });
});
