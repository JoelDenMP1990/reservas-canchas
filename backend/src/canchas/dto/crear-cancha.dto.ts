import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CrearCanchaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsNumber()
  @Min(0)
  tarifaBasePorHora: number;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;

  @IsString()
  horaAperturaDesde: string;

  @IsString()
  horaCierreHasta: string;

  @IsUUID()
  administradorId: string;
}
