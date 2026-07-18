import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetLastPriceDto {
  @ApiProperty({ example: 'uuid-customer', description: 'Customer ID' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ example: 'uuid-product', description: 'Product ID' })
  @IsUUID()
  productId: string;
}