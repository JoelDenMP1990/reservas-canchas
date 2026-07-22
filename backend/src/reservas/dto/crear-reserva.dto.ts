import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';

export class CrearReservaDto {
  @IsUUID()
  clienteId: string;

  @IsUUID()
  canchaId: string;

  @IsDateString()
  horaInicio: string;

  @IsDateString()
  horaFin: string;

  // metodoPago: solo se usa cuando la cancha no es gratuita (por defecto EFECTIVO).
  @IsOptional()
  @IsIn(['TARJETA', 'EFECTIVO', 'TRANSFERENCIA'])
  metodoPago?: string;
}
