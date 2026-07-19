import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CanchasService } from './canchas.service';
import { CrearCanchaDto } from './dto/crear-cancha.dto';
import { EditarCanchaDto } from './dto/editar-cancha.dto';

@Controller('canchas')
export class CanchasController {
  constructor(private readonly canchasService: CanchasService) {}

  @Get()
  listar() {
    return this.canchasService.listar();
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.canchasService.obtenerPorId(id);
  }

  @Get(':id/disponible')
  async estaDisponible(@Param('id') id: string) {
    const cancha = await this.canchasService.obtenerPorId(id);
    return { disponible: cancha.estaDisponible() };
  }

  @Get(':id/gratuita')
  async esGratuita(@Param('id') id: string) {
    const cancha = await this.canchasService.obtenerPorId(id);
    return { gratuita: cancha.esGratuita() };
  }

  @Post()
  crear(@Body() dto: CrearCanchaDto) {
    return this.canchasService.crear(dto);
  }

  @Patch(':id')
  editar(@Param('id') id: string, @Body() dto: EditarCanchaDto) {
    return this.canchasService.editar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.canchasService.eliminar(id);
  }
}
