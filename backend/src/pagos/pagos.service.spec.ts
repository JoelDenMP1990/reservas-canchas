import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { Pago } from './pago.entity';
import { Reserva } from '../reservas/reserva.entity';
import { MetodoPago } from './metodo-pago.enum';

describe('PagosService', () => {
  let service: PagosService;

  const pagosRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const reservasRepository = {
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PagosService,
        {
          provide: getRepositoryToken(Pago),
          useValue: pagosRepository,
        },
        {
          provide: getRepositoryToken(Reserva),
          useValue: reservasRepository,
        },
      ],
    }).compile();

    service = module.get<PagosService>(PagosService);

    jest.clearAllMocks();
  });

  it('debe listar los pagos', async () => {
    pagosRepository.find.mockResolvedValue([]);

    await expect(service.listar()).resolves.toEqual([]);
    expect(pagosRepository.find).toHaveBeenCalledWith({
      relations: ['reserva'],
    });
  });

  it('debe lanzar error si no encuentra un pago', async () => {
    pagosRepository.findOne.mockResolvedValue(null);

    await expect(service.obtenerPorId('1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('debe eliminar un pago', async () => {
    const pago = {} as Pago;

    jest.spyOn(service, 'obtenerPorId').mockResolvedValue(pago);
    pagosRepository.remove.mockResolvedValue(pago);

    await service.eliminar('1');

    expect(pagosRepository.remove).toHaveBeenCalledWith(pago);
  });

  it('debe lanzar error si la reserva no existe', async () => {
    reservasRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.crear({
        reservaId: '1',
        monto: 20,
        metodoPago: MetodoPago.EFECTIVO,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('debe lanzar error si la reserva ya tiene pago', async () => {
    reservasRepository.findOneBy.mockResolvedValue({ id: '1' });
    pagosRepository.findOne.mockResolvedValue({});

    await expect(
      service.crear({
        reservaId: '1',
        monto: 20,
        metodoPago: MetodoPago.EFECTIVO,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});