import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './cliente.entity';
import { Reserva } from '../reservas/reserva.entity';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Reserva])],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [TypeOrmModule],
})
export class ClientesModule {}
