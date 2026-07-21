import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdministradoresModule } from './administradores/administradores.module';
import { ClientesModule } from './clientes/clientes.module';
import { CanchasModule } from './canchas/canchas.module';
import { ReservasModule } from './reservas/reservas.module';
import { PagosModule } from './pagos/pagos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER', 'canchas'),
        password: config.get('DB_PASSWORD', 'canchas'),
        database: config.get('DB_NAME', 'canchas_reservas'),
        autoLoadEntities: true,
        // Sincroniza el esquema automáticamente a partir de las entidades: suficiente para un
        // proyecto académico, sin necesidad de escribir migraciones a mano.
        synchronize: true,
      }),
    }),
    AdministradoresModule,
    ClientesModule,
    CanchasModule,
    ReservasModule,
    PagosModule,
  ],
})
export class AppModule {}
