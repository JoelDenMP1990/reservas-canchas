import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { MetodoPago } from '../../pagos/metodo-pago.enum';

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
  @IsEnum(MetodoPago)
  metodoPago?: MetodoPago;
}
