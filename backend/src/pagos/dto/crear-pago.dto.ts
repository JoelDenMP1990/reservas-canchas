import { IsEnum, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { MetodoPago } from '../metodo-pago.enum';

export class CrearPagoDto {
  @IsUUID()
  reservaId: string;

  @IsNumber()
  @IsPositive()
  monto: number;

  @IsEnum(MetodoPago, {
    message: 'El metodo de pago debe ser TARJETA, EFECTIVO o TRANSFERENCIA',
  })
  metodoPago: MetodoPago;
}