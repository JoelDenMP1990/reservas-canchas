import { IsOptional, IsString } from 'class-validator';

export class EditarAdministradorDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  areaAsignada?: string;
}
