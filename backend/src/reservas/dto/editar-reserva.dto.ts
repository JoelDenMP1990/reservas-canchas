import { IsDateString, IsOptional } from 'class-validator';

// Solo se permite reprogramar el horario mientras la reserva sigue pendiente.
export class EditarReservaDto {
  @IsOptional()
  @IsDateString()
  horaInicio?: string;

  @IsOptional()
  @IsDateString()
  horaFin?: string;
}
