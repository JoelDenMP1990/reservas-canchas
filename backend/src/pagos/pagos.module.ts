import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './pago.entity';
import { Reserva } from '../reservas/reserva.entity';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Reserva])],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [TypeOrmModule],
})
export class PagosModule {}
