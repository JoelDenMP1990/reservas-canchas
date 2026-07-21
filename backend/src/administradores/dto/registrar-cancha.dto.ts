import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// Datos para que un administrador registre una cancha propia (el administradorId sale de la URL).
export class RegistrarCanchaDto {
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
}
