import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { EditarReservaDto } from './dto/editar-reserva.dto';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Get()
  listar() {
    return this.reservasService.listar();
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.reservasService.obtenerPorId(id);
  }

  @Post()
  crear(@Body() dto: CrearReservaDto) {
    return this.reservasService.crear(dto);
  }

  @Patch(':id')
  editar(@Param('id') id: string, @Body() dto: EditarReservaDto) {
    return this.reservasService.editar(id, dto);
  }

  @Post(':id/confirmar')
  confirmar(@Param('id') id: string) {
    return this.reservasService.confirmar(id);
  }

  @Post(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.reservasService.cancelar(id);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.reservasService.eliminar(id);
  }
}
