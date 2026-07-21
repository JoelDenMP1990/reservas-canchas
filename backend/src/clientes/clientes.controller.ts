import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { EditarClienteDto } from './dto/editar-cliente.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  listar() {
    return this.clientesService.listar();
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.clientesService.obtenerPorId(id);
  }

  @Get(':id/reservas-activas')
  getReservasActivas(@Param('id') id: string) {
    return this.clientesService.getReservasActivas(id);
  }

  @Post()
  crear(@Body() dto: CrearClienteDto) {
    return this.clientesService.crear(dto);
  }

  @Patch(':id')
  editar(@Param('id') id: string, @Body() dto: EditarClienteDto) {
    return this.clientesService.editar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.clientesService.eliminar(id);
  }
}
