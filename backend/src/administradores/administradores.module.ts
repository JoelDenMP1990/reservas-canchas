import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Administrador } from './administrador.entity';
import { Cancha } from '../canchas/cancha.entity';
import { Reserva } from '../reservas/reserva.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Pago } from '../pagos/pago.entity';
import { AdministradoresService } from './administradores.service';
import { AdministradoresController } from './administradores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Administrador, Cancha, Reserva, Cliente, Pago])],
  controllers: [AdministradoresController],
  providers: [AdministradoresService],
  exports: [TypeOrmModule],
})
export class AdministradoresModule {}
