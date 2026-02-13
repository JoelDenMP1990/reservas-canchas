import { IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateInventoryDto {
  @ApiProperty({ example: 'uuid-product', description: 'Product ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 100, description: 'Initial quantity' })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  quantity: number;
}