import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdministradoresService } from './administradores.service';
import { Administrador } from './administrador.entity';
import { Cancha } from '../canchas/cancha.entity';
import { Reserva } from '../reservas/reserva.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Pago } from '../pagos/pago.entity';

describe('AdministradoresService', () => {
  let service: AdministradoresService;
  let administradoresRepositorio: { findOneBy: jest.Mock; count: jest.Mock };
  let canchasRepositorio: { find: jest.Mock; count: jest.Mock };
  let reservasRepositorio: { find: jest.Mock; count: jest.Mock };
  let clientesRepositorio: { count: jest.Mock };
  let pagosRepositorio: { find: jest.Mock };

  // Hora "actual" fija para que las pruebas no dependan del reloj real.
  const FECHA_BASE = new Date(2026, 0, 15, 8, 30);
  const horaHoy = (h: number, m = 0) =>
    new Date(FECHA_BASE.getFullYear(), FECHA_BASE.getMonth(), FECHA_BASE.getDate(), h, m);

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(FECHA_BASE);

    administradoresRepositorio = { findOneBy: jest.fn(), count: jest.fn() };
    canchasRepositorio = { find: jest.fn(), count: jest.fn() };
    reservasRepositorio = { find: jest.fn(), count: jest.fn() };
    clientesRepositorio = { count: jest.fn() };
    pagosRepositorio = { find: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AdministradoresService,
        { provide: getRepositoryToken(Administrador), useValue: administradoresRepositorio },
        { provide: getRepositoryToken(Cancha), useValue: canchasRepositorio },
        { provide: getRepositoryToken(Reserva), useValue: reservasRepositorio },
        { provide: getRepositoryToken(Cliente), useValue: clientesRepositorio },
        { provide: getRepositoryToken(Pago), useValue: pagosRepositorio },
      ],
    }).compile();

    service = moduleRef.get(AdministradoresService);
  });

  afterEach(() => {
    jest.useRealTimers();
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

  it('listarCanchas() no muestra las franjas cuya hora ya pasó', async () => {
    jest.setSystemTime(horaHoy(10, 30));

    administradoresRepositorio.findOneBy.mockResolvedValue(Object.assign(new Administrador(), { id: 'admin-1' }));
    const cancha = Object.assign(new Cancha(), {
      id: 'cancha-1',
      nombre: 'Cancha 1',
      horaAperturaDesde: '09:00:00',
      horaCierreHasta: '12:00:00',
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
      { inicio: '10:00', fin: '11:00', ocupada: false },
      { inicio: '11:00', fin: '12:00', ocupada: false },
    ]);
  });

  it('reporteOcupacion() incluye reservas vigentes, su cliente y las canchas libres del administrador', async () => {
    administradoresRepositorio.findOneBy.mockResolvedValue(
      Object.assign(new Administrador(), { id: 'admin-1', nombre: 'Ana Torres', areaAsignada: 'Zona Norte' }),
    );
    canchasRepositorio.find.mockResolvedValue([
      Object.assign(new Cancha(), {
        id: 'cancha-1',
        nombre: 'Cancha Fútbol 1',
        activa: true,
        reservas: [
          Object.assign(new Reserva(), {
            estado: 'CONFIRMADA',
            horaInicio: horaHoy(10),
            horaFin: horaHoy(12),
            cliente: { nombre: 'Juan Pérez' },
          }),
          Object.assign(new Reserva(), {
            estado: 'CANCELADA',
            horaInicio: horaHoy(13),
            horaFin: horaHoy(14),
            cliente: { nombre: 'No debe aparecer' },
          }),
        ],
      }),
      Object.assign(new Cancha(), { id: 'cancha-2', nombre: 'Cancha Comunitaria', activa: false, reservas: [] }),
    ]);

    const reporte = await service.reporteOcupacion('admin-1');

    expect(canchasRepositorio.find).toHaveBeenCalledWith({
      where: { administrador: { id: 'admin-1' } },
      relations: { reservas: { cliente: true } },
    });
    expect(reporte).toEqual({
      administrador: { id: 'admin-1', nombre: 'Ana Torres', areaAsignada: 'Zona Norte' },
      resumen: { canchasRegistradas: 2, canchasActivas: 1 },
      ocupacion: [
        {
          cancha: 'Cancha Fútbol 1',
          cliente: 'Juan Pérez',
          horaInicio: horaHoy(10),
          horaFin: horaHoy(12),
          estado: 'CONFIRMADA',
        },
        { cancha: 'Cancha Comunitaria', estado: 'LIBRE' },
      ],
    });
  });

  it('resumenGeneral() consolida las métricas del sistema sin depender de un administrador', async () => {
    administradoresRepositorio.count.mockResolvedValue(3);
    canchasRepositorio.count.mockResolvedValueOnce(5).mockResolvedValueOnce(4);
    clientesRepositorio.count.mockResolvedValue(20);
    reservasRepositorio.count
      .mockResolvedValueOnce(35)
      .mockResolvedValueOnce(25)
      .mockResolvedValueOnce(6)
      .mockResolvedValueOnce(4);
    pagosRepositorio.find.mockResolvedValue([{ monto: '300.50' }, { monto: '199.50' }]);
    canchasRepositorio.find.mockResolvedValue([
      Object.assign(new Cancha(), {
        reservas: [Object.assign(new Reserva(), {
          estado: 'CONFIRMADA', horaInicio: horaHoy(8), horaFin: horaHoy(10),
        })],
      }),
      Object.assign(new Cancha(), { reservas: [] }),
      Object.assign(new Cancha(), {
        reservas: [Object.assign(new Reserva(), {
          estado: 'CANCELADA', horaInicio: horaHoy(8), horaFin: horaHoy(10),
        })],
      }),
      Object.assign(new Cancha(), { reservas: [] }),
      Object.assign(new Cancha(), { reservas: [] }),
    ]);

    await expect(service.resumenGeneral()).resolves.toEqual({
      administradores: 3,
      canchasRegistradas: 5,
      canchasActivas: 4,
      canchasInactivas: 1,
      clientes: 20,
      reservasTotales: 35,
      reservasConfirmadas: 25,
      reservasPendientes: 6,
      reservasCanceladas: 4,
      pagosRegistrados: 2,
      ingresosTotales: 500,
      canchasOcupadasActualmente: 1,
      canchasLibresActualmente: 4,
    });
  });
});
