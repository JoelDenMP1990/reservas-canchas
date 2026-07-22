import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { CrearNotificacionDto } from './dto/crear-notificacion.dto';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  listar() {
    return this.notificacionesService.listar();
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.notificacionesService.obtenerPorId(id);
  }

  @Post()
  crear(@Body() dto: CrearNotificacionDto) {
    return this.notificacionesService.crear(dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.notificacionesService.eliminar(id);
  }
}
