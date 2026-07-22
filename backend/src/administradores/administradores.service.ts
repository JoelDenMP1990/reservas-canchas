import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Administrador } from './administrador.entity';
import { CrearAdministradorDto } from './dto/crear-administrador.dto';
import { EditarAdministradorDto } from './dto/editar-administrador.dto';
import { RegistrarCanchaDto } from './dto/registrar-cancha.dto';
import { Cancha } from '../canchas/cancha.entity';
import { Reserva } from '../reservas/reserva.entity';

export interface FranjaHoraria {
  inicio: string;
  fin: string;
  ocupada: boolean;
}

export type CanchaConHorarios = Cancha & { horarios: FranjaHoraria[] };

@Injectable()
export class AdministradoresService {
  constructor(
    @InjectRepository(Administrador)
    private readonly administradoresRepository: Repository<Administrador>,
    @InjectRepository(Cancha)
    private readonly canchasRepository: Repository<Cancha>,
    @InjectRepository(Reserva)
    private readonly reservasRepository: Repository<Reserva>,
  ) {}

  listar(): Promise<Administrador[]> {
    return this.administradoresRepository.find();
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

  // reporteOcupacion(): resumen básico de las canchas que administra.
  async reporteOcupacion(administradorId: string): Promise<string> {
    await this.obtenerPorId(administradorId);
    const canchas = await this.canchasRepository.find({
      where: { administrador: { id: administradorId } },
    });
    const activas = canchas.filter((c) => c.activa).length;
    return `${canchas.length} canchas registradas, ${activas} activas`;
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

  // generarFranjas(): parte el horario de apertura/cierre de la cancha en bloques de 1
  // hora para el día de hoy, y marca cada bloque como ocupado si se cruza con alguna
  // reserva confirmada.
  private generarFranjas(cancha: Cancha, reservas: Reserva[]): FranjaHoraria[] {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const hoy = new Date();
    const [horaApertura, minutoApertura] = cancha.horaAperturaDesde.split(':').map(Number);
    const [horaCierre, minutoCierre] = cancha.horaCierreHasta.split(':').map(Number);

    let cursor = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), horaApertura, minutoApertura);
    const cierre = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), horaCierre, minutoCierre);

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

