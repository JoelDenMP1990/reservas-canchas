import { ReservaService } from '../../src/application/ReservaService';
import { CanchaService } from '../../src/application/CanchaService';
import { NotificacionService } from '../../src/application/NotificacionService';
import { DisponibilidadService } from '../../src/application/DisponibilidadService';
import { SelectorEstrategiaTarifa } from '../../src/application/SelectorEstrategiaTarifa';
import { InMemoryCanchaRepository } from '../../src/infrastructure/repositories/InMemoryCanchaRepository';
import { InMemoryReservaRepository } from '../../src/infrastructure/repositories/InMemoryReservaRepository';
import { TipoCancha } from '../../src/domain/TipoCancha';
import { EstadoReserva } from '../../src/domain/EstadoReserva';
import { FranjaHoraria } from '../../src/domain/FranjaHoraria';

describe('ReservaService', () => {
  let canchaRepository: InMemoryCanchaRepository;
  let reservaRepository: InMemoryReservaRepository;
  let canchaService: CanchaService;
  let reservaService: ReservaService;

  beforeEach(() => {
    canchaRepository = new InMemoryCanchaRepository();
    reservaRepository = new InMemoryReservaRepository();
    canchaService = new CanchaService(canchaRepository);
    reservaService = new ReservaService(
      reservaRepository,
      canchaRepository,
      new NotificacionService(),
      new DisponibilidadService(reservaRepository),
      new SelectorEstrategiaTarifa(),
    );
  });

  test('crea una reserva válida y la deja confirmada (UC1)', () => {
    const cancha = canchaService.registrarCancha('Cancha 1', TipoCancha.FUTBOL, 40, 'Zona Norte');

    const reserva = reservaService.crearReserva(
      'cliente-1',
      cancha.id,
      new FranjaHoraria('2026-08-01', '07:00', '08:00'),
    );

    expect(reserva.estado).toBe(EstadoReserva.CONFIRMADA);
    expect(reservaRepository.buscarPorId(reserva.id)).toEqual(reserva);
  });

  test('aplica descuento en horario de baja demanda para fútbol', () => {
    const cancha = canchaService.registrarCancha('Cancha 1', TipoCancha.FUTBOL, 40, 'Zona Norte');

    const reserva = reservaService.crearReserva(
      'cliente-1',
      cancha.id,
      new FranjaHoraria('2026-08-01', '07:00', '08:00'),
    );

    expect(reserva.precioTotal).toBe(32);
  });

  test('aplica tarifa de horario pico para fútbol', () => {
    const cancha = canchaService.registrarCancha('Cancha 1', TipoCancha.FUTBOL, 40, 'Zona Norte');

    const reserva = reservaService.crearReserva(
      'cliente-1',
      cancha.id,
      new FranjaHoraria('2026-08-01', '19:00', '20:00'),
    );

    expect(reserva.precioTotal).toBe(52);
  });

  test('rechaza reservar una cancha ya ocupada en una franja solapada', () => {
    const cancha = canchaService.registrarCancha('Cancha 1', TipoCancha.FUTBOL, 40, 'Zona Norte');
    reservaService.crearReserva('cliente-1', cancha.id, new FranjaHoraria('2026-08-01', '07:00', '08:00'));

    expect(() =>
      reservaService.crearReserva(
        'cliente-2',
        cancha.id,
        new FranjaHoraria('2026-08-01', '07:30', '08:30'),
      ),
    ).toThrow('no está disponible');
  });

  test('rechaza reservar una cancha inexistente', () => {
    expect(() =>
      reservaService.crearReserva(
        'cliente-1',
        'cancha-inexistente',
        new FranjaHoraria('2026-08-01', '07:00', '08:00'),
      ),
    ).toThrow('Cancha no encontrada');
  });

  test('cotizarPrecio devuelve el mismo valor que crearReserva para la misma franja (UC1)', () => {
    const cancha = canchaService.registrarCancha('Cancha 1', TipoCancha.BASQUET, 30, 'Zona Norte');

    const cotizacion = reservaService.cotizarPrecio(cancha.id, '19:00');
    const reserva = reservaService.crearReserva(
      'cliente-1',
      cancha.id,
      new FranjaHoraria('2026-08-01', '19:00', '20:00'),
    );

    expect(cotizacion).toBe(reserva.precioTotal);
  });

  test('cancela una reserva con antelación suficiente (UC2)', () => {
    const cancha = canchaService.registrarCancha('Cancha 1', TipoCancha.FUTBOL, 40, 'Zona Norte');
    const reserva = reservaService.crearReserva(
      'cliente-1',
      cancha.id,
      new FranjaHoraria('2026-08-01', '07:00', '08:00'),
    );

    reservaService.cancelarReserva(reserva.id);

    expect(reservaRepository.buscarPorId(reserva.id)?.estado).toBe(EstadoReserva.CANCELADA);
  });

  test('rechaza cancelar una reserva a menos de 2 horas de su inicio', () => {
    const cancha = canchaService.registrarCancha('Cancha 1', TipoCancha.FUTBOL, 40, 'Zona Norte');
    const enUnaHora = new Date(Date.now() + 60 * 60 * 1000);
    const fecha = enUnaHora.toISOString().slice(0, 10);
    const horaInicio = `${String(enUnaHora.getHours()).padStart(2, '0')}:${String(
      enUnaHora.getMinutes(),
    ).padStart(2, '0')}`;
    const horaFin = `${String((enUnaHora.getHours() + 1) % 24).padStart(2, '0')}:${String(
      enUnaHora.getMinutes(),
    ).padStart(2, '0')}`;

    const reserva = reservaService.crearReserva(
      'cliente-1',
      cancha.id,
      new FranjaHoraria(fecha, horaInicio, horaFin),
    );

    expect(() => reservaService.cancelarReserva(reserva.id)).toThrow('antelación');
  });

  test('rechaza cancelar una reserva inexistente', () => {
    expect(() => reservaService.cancelarReserva('no-existe')).toThrow('Reserva no encontrada');
  });
});
