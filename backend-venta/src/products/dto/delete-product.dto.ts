import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeleteProductDto {
  @ApiPropertyOptional({ example: 'Product discontinued', description: 'Reason for deletion' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}