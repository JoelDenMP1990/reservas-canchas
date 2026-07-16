import { InMemoryCanchaRepository } from '../infrastructure/repositories/InMemoryCanchaRepository';
import { InMemoryReservaRepository } from '../infrastructure/repositories/InMemoryReservaRepository';
import { CanchaService } from '../application/CanchaService';
import { ReservaService } from '../application/ReservaService';
import { NotificacionService } from '../application/NotificacionService';
import { DisponibilidadService } from '../application/DisponibilidadService';
import { TipoCancha } from '../domain/TipoCancha';

function main(): void {
  const canchaRepository = new InMemoryCanchaRepository();
  const reservaRepository = new InMemoryReservaRepository();
  const notificacionService = new NotificacionService();
  const disponibilidadService = new DisponibilidadService(reservaRepository);
  const canchaService = new CanchaService(canchaRepository);
  const reservaService = new ReservaService(
    reservaRepository,
    canchaRepository,
    notificacionService,
    disponibilidadService,
  );

  console.log('== UC3: Registrar Cancha (Administrador) ==');
  const cancha = canchaService.registrarCancha(
    'Cancha Norte',
    TipoCancha.FUTBOL,
    40,
    'Av. Principal 123',
  );
  console.log(cancha);

  console.log('\n== UC1: Crear Reserva (Cliente) — horario de baja demanda ==');
  const reserva = reservaService.crearReserva('cliente-1', cancha.id, '2026-08-01', '07:00', '08:00');
  console.log(reserva);

  console.log('\n== Intento de reserva solapada (debe fallar) ==');
  try {
    reservaService.crearReserva('cliente-2', cancha.id, '2026-08-01', '07:30', '08:30');
  } catch (error) {
    console.log(`Error esperado: ${(error as Error).message}`);
  }

  console.log('\n== UC2: Cancelar Reserva (Cliente) ==');
  reservaService.cancelarReserva(reserva.id);
  console.log(reservaRepository.buscarPorId(reserva.id));
}

main();
