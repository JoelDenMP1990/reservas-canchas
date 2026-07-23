import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Administrador } from './administrador.entity';
import { CrearAdministradorDto } from './dto/crear-administrador.dto';
import { EditarAdministradorDto } from './dto/editar-administrador.dto';
import { RegistrarCanchaDto } from './dto/registrar-cancha.dto';
import { Cancha } from '../canchas/cancha.entity';
import { Reserva } from '../reservas/reserva.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Pago } from '../pagos/pago.entity';

export interface FranjaHoraria {
  inicio: string;
  fin: string;
  ocupada: boolean;
}

export type CanchaConHorarios = Cancha & { horarios: FranjaHoraria[] };

export interface DetalleOcupacion {
  cancha: string;
  estado: string;
  cliente?: string;
  horaInicio?: Date;
  horaFin?: Date;
}

export interface ReporteOcupacion {
  administrador: {
    id: string;
    nombre: string;
    areaAsignada: string;
  };
  resumen: {
    canchasRegistradas: number;
    canchasActivas: number;
  };
  ocupacion: DetalleOcupacion[];
}

export interface ResumenGeneralSistema {
  administradores: number;
  canchasRegistradas: number;
  canchasActivas: number;
  canchasInactivas: number;
  clientes: number;
  reservasTotales: number;
  reservasConfirmadas: number;
  reservasPendientes: number;
  reservasCanceladas: number;
  pagosRegistrados: number;
  ingresosTotales: number;
  canchasOcupadasActualmente: number;
  canchasLibresActualmente: number;
}

@Injectable()
export class AdministradoresService {
  constructor(
    @InjectRepository(Administrador)
    private readonly administradoresRepository: Repository<Administrador>,
    @InjectRepository(Cancha)
    private readonly canchasRepository: Repository<Cancha>,
    @InjectRepository(Reserva)
    private readonly reservasRepository: Repository<Reserva>,
    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
    @InjectRepository(Pago)
    private readonly pagosRepository: Repository<Pago>,
  ) {}

  listar(): Promise<Administrador[]> {
    return this.administradoresRepository.find();
  }

  async resumenGeneral(): Promise<ResumenGeneralSistema> {
    const [
      administradores,
      canchasRegistradas,
      canchasActivas,
      clientes,
      reservasTotales,
      reservasConfirmadas,
      reservasPendientes,
      reservasCanceladas,
      pagos,
      canchas,
    ] = await Promise.all([
      this.administradoresRepository.count(),
      this.canchasRepository.count(),
      this.canchasRepository.count({ where: { activa: true } }),
      this.clientesRepository.count(),
      this.reservasRepository.count(),
      this.reservasRepository.count({ where: { estado: 'CONFIRMADA' } }),
      this.reservasRepository.count({ where: { estado: 'PENDIENTE' } }),
      this.reservasRepository.count({ where: { estado: 'CANCELADA' } }),
      this.pagosRepository.find(),
      this.canchasRepository.find({ relations: { reservas: true } }),
    ]);

    const ahora = new Date();
    const canchasOcupadasActualmente = canchas.filter((cancha) =>
      (cancha.reservas ?? []).some(
        (reserva) =>
          reserva.estado !== 'CANCELADA' &&
          reserva.horaInicio <= ahora &&
          reserva.horaFin > ahora,
      ),
    ).length;

    return {
      administradores,
      canchasRegistradas,
      canchasActivas,
      canchasInactivas: canchasRegistradas - canchasActivas,
      clientes,
      reservasTotales,
      reservasConfirmadas,
      reservasPendientes,
      reservasCanceladas,
      pagosRegistrados: pagos.length,
      ingresosTotales: pagos.reduce((total, pago) => total + Number(pago.monto), 0),
      canchasOcupadasActualmente,
      canchasLibresActualmente: canchasRegistradas - canchasOcupadasActualmente,
    };
  }

  async obtenerPorId(id: string): Promise<Administrador> {
    const administrador = await this.administradoresRepository.findOneBy({ id });
    if (!administrador) {
      throw new NotFoundException('Administrador no encontrado');
    }
    return administrador;
  }

  crear(dto: CrearAdministradorDto): Promise<Administrador> {
    const administrador = this.administradoresRepository.create(dto);
    return this.administradoresRepository.save(administrador);
  }

  async editar(id: string, dto: EditarAdministradorDto): Promise<Administrador> {
    const administrador = await this.obtenerPorId(id);
    Object.assign(administrador, dto);
    return this.administradoresRepository.save(administrador);
  }

  async eliminar(id: string): Promise<void> {
    const administrador = await this.obtenerPorId(id);
    await this.administradoresRepository.remove(administrador);
  }

  // registrarCancha(c): el administrador da de alta una cancha propia.
  async registrarCancha(administradorId: string, dto: RegistrarCanchaDto): Promise<Cancha> {
    const administrador = await this.obtenerPorId(administradorId);
    const cancha = this.canchasRepository.create({ ...dto, administrador });
    return this.canchasRepository.save(cancha);
  }

  // eliminarCancha(c): el administrador da de baja una cancha que él mismo registró.
  async eliminarCancha(administradorId: string, canchaId: string): Promise<void> {
    const cancha = await this.canchasRepository.findOne({
      where: { id: canchaId, administrador: { id: administradorId } },
    });
    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada para este administrador');
    }
    await this.canchasRepository.remove(cancha);
  }

  // reporteOcupacion(): detalle las reservas vigentes de las canchas del administrador.
  async reporteOcupacion(administradorId: string): Promise<ReporteOcupacion> {
    const administrador = await this.obtenerPorId(administradorId);
    const canchas = await this.canchasRepository.find({
      where: { administrador: { id: administradorId } },
      relations: { reservas: { cliente: true } },
    });

    const ahora = new Date();
    const ocupacion = canchas.flatMap((cancha) => {
      const reservasVigentes = (cancha.reservas ?? []).filter(
        (reserva) => reserva.estado !== 'CANCELADA' && reserva.horaFin >= ahora,
      );

      if (reservasVigentes.length === 0) {
        return [{ cancha: cancha.nombre, estado: 'LIBRE' }];
      }

      return reservasVigentes.map((reserva) => ({
        cancha: cancha.nombre,
        cliente: reserva.cliente.nombre,
        horaInicio: reserva.horaInicio,
        horaFin: reserva.horaFin,
        estado: reserva.estado,
      }));
    });

    return {
      administrador: {
        id: administrador.id,
        nombre: administrador.nombre,
        areaAsignada: administrador.areaAsignada,
      },
      resumen: {
        canchasRegistradas: canchas.length,
        canchasActivas: canchas.filter((cancha) => cancha.activa).length,
      },
      ocupacion,
    };
  }
  // listarCanchas(): las canchas del administrador, con el horario de hoy partido en
  // franjas de 1 hora (entre apertura y cierre), cada una marcada libre u ocupada
  // según si una reserva CONFIRMADA de hoy la cubre.
  async listarCanchas(administradorId: string): Promise<CanchaConHorarios[]> {
    await this.obtenerPorId(administradorId);

    const canchas = await this.canchasRepository.find({
      where: { administrador: { id: administradorId } },
    });

    const canchasConHorarios: CanchaConHorarios[] = [];
    for (const cancha of canchas) {
      const reservasDeHoy = await this.reservasRepository.find({
        where: { cancha: { id: cancha.id }, estado: 'CONFIRMADA' },
      });
      const horarios = this.generarFranjas(cancha, reservasDeHoy);
      canchasConHorarios.push(Object.assign(cancha, { horarios }));
    }
    return canchasConHorarios;
  }

  // generarFranjas(): parte en bloques de 1 hora el horario de la cancha que todavía
  // queda por delante hoy (desde la hora actual, no desde la apertura), marcando cada
  // bloque como ocupado si se cruza con alguna reserva confirmada. Las horas que ya
  // pasaron no se muestran: no aportan nada para decidir si se puede reservar o no.
  private generarFranjas(cancha: Cancha, reservas: Reserva[]): FranjaHoraria[] {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const ahora = new Date();
    const [horaApertura, minutoApertura] = cancha.horaAperturaDesde.split(':').map(Number);
    const [horaCierre, minutoCierre] = cancha.horaCierreHasta.split(':').map(Number);

    const apertura = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), horaApertura, minutoApertura);
    const cierre = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), horaCierre, minutoCierre);
    const inicioHoraActual = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), ahora.getHours(), 0);

    let cursor = apertura > inicioHoraActual ? apertura : inicioHoraActual;

    const franjas: FranjaHoraria[] = [];
    while (cursor < cierre) {
      const finFranja = new Date(Math.min(cursor.getTime() + 60 * 60 * 1000, cierre.getTime()));
      const ocupada = reservas.some(
        (reserva) => reserva.horaInicio < finFranja && reserva.horaFin > cursor,
      );
      franjas.push({
        inicio: `${pad(cursor.getHours())}:${pad(cursor.getMinutes())}`,
        fin: `${pad(finFranja.getHours())}:${pad(finFranja.getMinutes())}`,
        ocupada,
      });
      cursor = finFranja;
    }
    return franjas;
  }
}
