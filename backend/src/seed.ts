import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Cliente } from './clientes/cliente.entity';
import { Administrador } from './administradores/administrador.entity';
import { Cancha } from './canchas/cancha.entity';
import { Reserva } from './reservas/reserva.entity';
import { Pago } from './pagos/pago.entity';
import { MetodoPago } from './pagos/metodo-pago.enum';

// Script de datos de prueba: llena la base con clientes, administradores, canchas,
// reservas y pagos de ejemplo para que el equipo pueda probar el sistema.
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'canchas',
  password: process.env.DB_PASSWORD ?? 'canchas',
  database: process.env.DB_NAME ?? 'canchas_reservas',
  entities: [Cliente, Administrador, Cancha, Reserva, Pago],
});

async function seed() {
  await dataSource.initialize();

  const administradorRepo = dataSource.getRepository(Administrador);
  const clienteRepo = dataSource.getRepository(Cliente);
  const canchaRepo = dataSource.getRepository(Cancha);
  const reservaRepo = dataSource.getRepository(Reserva);
  const pagoRepo = dataSource.getRepository(Pago);

  const admin1 = await administradorRepo.save(
    administradorRepo.create({ nombre: 'Ana Torres', areaAsignada: 'Zona Norte' }),
  );
  const admin2 = await administradorRepo.save(
    administradorRepo.create({ nombre: 'Carlos Ruiz', areaAsignada: 'Zona Sur' }),
  );

  const cliente1 = await clienteRepo.save(
    clienteRepo.create({ nombre: 'Juan Perez', email: 'juan.perez@test.com', telefono: '0991111111' }),
  );
  const cliente2 = await clienteRepo.save(
    clienteRepo.create({ nombre: 'Maria Lopez', email: 'maria.lopez@test.com', telefono: '0992222222' }),
  );
  const cliente3 = await clienteRepo.save(
    clienteRepo.create({ nombre: 'Pedro Sanchez', email: 'pedro.sanchez@test.com', telefono: '0993333333' }),
  );

  const cancha1 = await canchaRepo.save(
    canchaRepo.create({
      nombre: 'Cancha Fútbol 1',
      tipo: 'Futbol',
      tarifaBasePorHora: 15,
      activa: true,
      horaAperturaDesde: '08:00',
      horaCierreHasta: '22:00',
      administrador: admin1,
    }),
  );
  const cancha2 = await canchaRepo.save(
    canchaRepo.create({
      nombre: 'Cancha Básquet 1',
      tipo: 'Basquet',
      tarifaBasePorHora: 10,
      activa: true,
      horaAperturaDesde: '09:00',
      horaCierreHasta: '21:00',
      administrador: admin1,
    }),
  );
  await canchaRepo.save(
    canchaRepo.create({
      nombre: 'Cancha Comunitaria',
      tipo: 'Futbol',
      tarifaBasePorHora: 0,
      activa: true,
      horaAperturaDesde: '07:00',
      horaCierreHasta: '20:00',
      administrador: admin2,
    }),
  );

  const reserva1 = reservaRepo.create({
    cliente: cliente1,
    cancha: cancha1,
    horaInicio: new Date('2026-08-01T10:00:00'),
    horaFin: new Date('2026-08-01T12:00:00'),
  });
  reserva1.monto = reserva1.calcularPrecio();
  await reservaRepo.save(reserva1);

  const pago1 = pagoRepo.create({ reserva: reserva1, monto: reserva1.monto, metodoPago: MetodoPago.TARJETA });
  pago1.procesar();
  await pagoRepo.save(pago1);
  reserva1.confirmar();
  await reservaRepo.save(reserva1);

  const reserva2 = reservaRepo.create({
    cliente: cliente2,
    cancha: cancha2,
    horaInicio: new Date('2026-08-02T15:00:00'),
    horaFin: new Date('2026-08-02T16:00:00'),
  });
  reserva2.monto = reserva2.calcularPrecio();
  await reservaRepo.save(reserva2);

  const reserva3 = reservaRepo.create({
    cliente: cliente3,
    cancha: cancha1,
    horaInicio: new Date('2026-08-03T09:00:00'),
    horaFin: new Date('2026-08-03T10:00:00'),
  });
  reserva3.monto = reserva3.calcularPrecio();
  reserva3.cancelar();
  await reservaRepo.save(reserva3);

  console.log('Datos de prueba insertados correctamente.');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
