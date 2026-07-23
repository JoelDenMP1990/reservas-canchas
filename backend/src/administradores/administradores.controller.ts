import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AdministradoresService } from './administradores.service';
import { CrearAdministradorDto } from './dto/crear-administrador.dto';
import { EditarAdministradorDto } from './dto/editar-administrador.dto';
import { RegistrarCanchaDto } from './dto/registrar-cancha.dto';

@Controller('administradores')
export class AdministradoresController {
  constructor(private readonly administradoresService: AdministradoresService) {}

  @Get()
  listar() {
    return this.administradoresService.listar();
  }

  @Get('resumen-general')
  resumenGeneral() {
    return this.administradoresService.resumenGeneral();
  }

  @Get(':id/canchas')
  listarCanchas(@Param('id') id: string) {
    return this.administradoresService.listarCanchas(id);
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.administradoresService.obtenerPorId(id);
  }

  @Get(':id/reporte-ocupacion')
  reporteOcupacion(@Param('id') id: string) {
    return this.administradoresService.reporteOcupacion(id);
  }

  @Post()
  crear(@Body() dto: CrearAdministradorDto) {
    return this.administradoresService.crear(dto);
  }

  @Patch(':id')
  editar(@Param('id') id: string, @Body() dto: EditarAdministradorDto) {
    return this.administradoresService.editar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.administradoresService.eliminar(id);
  }

  @Post(':id/canchas')
  registrarCancha(@Param('id') id: string, @Body() dto: RegistrarCanchaDto) {
    return this.administradoresService.registrarCancha(id, dto);
  }

  @Delete(':id/canchas/:canchaId')
  eliminarCancha(@Param('id') id: string, @Param('canchaId') canchaId: string) {
    return this.administradoresService.eliminarCancha(id, canchaId);
  }
}
