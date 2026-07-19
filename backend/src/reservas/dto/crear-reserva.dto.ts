import { IsDateString, IsUUID } from 'class-validator';

export class CrearReservaDto {
  @IsUUID()
  clienteId: string;

  @IsUUID()
  canchaId: string;

  @IsDateString()
  horaInicio: string;

  @IsDateString()
  horaFin: string;
}
