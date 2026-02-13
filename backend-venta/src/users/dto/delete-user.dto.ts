import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DeleteUserDto {
  @ApiPropertyOptional({ example: 'User resigned', description: 'Reason for deletion' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}