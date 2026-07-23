import { IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { MetodoPago } from '../metodo-pago.enum';

export class CrearPagoDto {
  @IsUUID()
  reservaId: string;

  @IsNumber()
  @Min(0)
  monto: number;

  @IsEnum(MetodoPago, {
    message: 'El método de pago debe ser TARJETA, EFECTIVO o TRANSFERENCIA',
  })
  metodoPago: MetodoPago;
}
