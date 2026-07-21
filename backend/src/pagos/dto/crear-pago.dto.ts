import { IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CrearPagoDto {
  @IsUUID()
  reservaId: string;

  @IsNumber()
  @Min(0)
  monto: number;

  @IsString()
  metodoPago: string;
}
