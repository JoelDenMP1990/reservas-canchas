import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './reserva.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Cancha } from '../canchas/cancha.entity';
import { Pago } from '../pagos/pago.entity';
import { Notificacion } from '../notificaciones/notificacion.entity';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Cliente, Cancha, Pago, Notificacion])],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [TypeOrmModule],
})
export class ReservasModule {}
