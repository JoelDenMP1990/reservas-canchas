import { IsNotEmpty, IsString } from 'class-validator';

export class CrearAdministradorDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  areaAsignada: string;
}
