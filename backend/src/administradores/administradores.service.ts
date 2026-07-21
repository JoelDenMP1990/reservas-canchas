import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Administrador } from './administrador.entity';
import { CrearAdministradorDto } from './dto/crear-administrador.dto';
import { EditarAdministradorDto } from './dto/editar-administrador.dto';
import { RegistrarCanchaDto } from './dto/registrar-cancha.dto';
import { Cancha } from '../canchas/cancha.entity';

@Injectable()
export class AdministradoresService {
  constructor(
    @InjectRepository(Administrador)
    private readonly administradoresRepository: Repository<Administrador>,
    @InjectRepository(Cancha)
    private readonly canchasRepository: Repository<Cancha>,
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
}
