import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DeleteCustomerDto {
  @ApiPropertyOptional({ example: 'Customer inactive', description: 'Reason for deletion' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}