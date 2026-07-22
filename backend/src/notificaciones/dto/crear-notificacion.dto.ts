import { IsString, IsUUID } from 'class-validator';

export class CrearNotificacionDto {
  @IsUUID()
  reservaId: string;

  @IsString()
  tipo: string;

  @IsString()
  mensaje: string;
}
