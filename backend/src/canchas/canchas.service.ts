import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cancha } from './cancha.entity';
import { Administrador } from '../administradores/administrador.entity';
import { CrearCanchaDto } from './dto/crear-cancha.dto';
import { EditarCanchaDto } from './dto/editar-cancha.dto';

@Injectable()
export class CanchasService {
  constructor(
    @InjectRepository(Cancha)
    private readonly canchasRepository: Repository<Cancha>,
    @InjectRepository(Administrador)
    private readonly administradoresRepository: Repository<Administrador>,
  ) {}

  listar(): Promise<Cancha[]> {
    return this.canchasRepository.find({ relations: ['administrador'] });
  }

  async obtenerPorId(id: string): Promise<Cancha> {
    const cancha = await this.canchasRepository.findOne({
      where: { id },
      relations: ['administrador'],
    });
    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }
    return cancha;
  }

  async crear(dto: CrearCanchaDto): Promise<Cancha> {
    const administrador = await this.administradoresRepository.findOneBy({ id: dto.administradorId });
    if (!administrador) {
      throw new NotFoundException('Administrador no encontrado');
    }
    const cancha = this.canchasRepository.create({ ...dto, administrador });
    return this.canchasRepository.save(cancha);
  }

  async editar(id: string, dto: EditarCanchaDto): Promise<Cancha> {
    const cancha = await this.obtenerPorId(id);
    Object.assign(cancha, dto);
    return this.canchasRepository.save(cancha);
  }

  async eliminar(id: string): Promise<void> {
    const cancha = await this.obtenerPorId(id);
    await this.canchasRepository.remove(cancha);
  }
}
