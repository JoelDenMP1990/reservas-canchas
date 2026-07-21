import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CrearPagoDto } from './dto/crear-pago.dto';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Get()
  listar() {
    return this.pagosService.listar();
  }

  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.pagosService.obtenerPorId(id);
  }

  @Post()
  crear(@Body() dto: CrearPagoDto) {
    return this.pagosService.crear(dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.pagosService.eliminar(id);
  }
}
