import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProformasService } from './proformas.service';
import { ProformasController } from './proformas.controller';
import { Proforma } from './entities/proforma.entity';
import { ProformaDetail } from './entities/proforma-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proforma, ProformaDetail])],
  controllers: [ProformasController],
  providers: [ProformasService],
  exports: [ProformasService],
})
export class ProformasModule {}