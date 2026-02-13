import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateInventoryDto {
  @ApiProperty({ example: 50, description: 'Quantity to add/subtract' })
  @IsNumber()
  @Type(() => Number)
  quantity: number;
}