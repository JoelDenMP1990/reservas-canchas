import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './notificacion.entity';
import { Reserva } from '../reservas/reserva.entity';
import { CrearNotificacionDto } from './dto/crear-notificacion.dto';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionesRepository: Repository<Notificacion>,
    @InjectRepository(Reserva)
    private readonly reservasRepository: Repository<Reserva>,
  ) {}

  listar(): Promise<Notificacion[]> {
    return this.notificacionesRepository.find({ relations: ['reserva'] });
  }

  async obtenerPorId(id: string): Promise<Notificacion> {
    const notificacion = await this.notificacionesRepository.findOne({
      where: { id },
      relations: ['reserva'],
    });
    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }
    return notificacion;
  }

  // crear(): registra una notificación para una reserva y la envía.
  async crear(dto: CrearNotificacionDto): Promise<Notificacion> {
    const reserva = await this.reservasRepository.findOneBy({ id: dto.reservaId });
    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }
    const notificacion = this.notificacionesRepository.create({
      reserva,
      tipo: dto.tipo,
      mensaje: dto.mensaje,
    });
    notificacion.enviar();
    return this.notificacionesRepository.save(notificacion);
  }

  async eliminar(id: string): Promise<void> {
    const notificacion = await this.obtenerPorId(id);
    await this.notificacionesRepository.remove(notificacion);
  }
}
