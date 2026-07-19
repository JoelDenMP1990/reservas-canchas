import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cancha } from './cancha.entity';
import { Administrador } from '../administradores/administrador.entity';
import { CanchasService } from './canchas.service';
import { CanchasController } from './canchas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cancha, Administrador])],
  controllers: [CanchasController],
  providers: [CanchasService],
  exports: [TypeOrmModule],
})
export class CanchasModule {}
