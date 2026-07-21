import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class EditarCanchaDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tarifaBasePorHora?: number;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;

  @IsOptional()
  @IsString()
  horaAperturaDesde?: string;

  @IsOptional()
  @IsString()
  horaCierreHasta?: string;
}
