import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DeleteSaleDto {
  @ApiPropertyOptional({ example: 'Sale cancelled', description: 'Reason for deletion' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}