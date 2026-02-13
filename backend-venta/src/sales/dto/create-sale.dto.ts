import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID, IsDateString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SaleStatus } from '../entities/sale.entity';

export class SaleDetailDto {
  @ApiProperty({ example: 'uuid-product', description: 'Product ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 10, description: 'Quantity' })
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  quantity: number;

  @ApiProperty({ example: 99.99, description: 'Unit price' })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 5, description: 'Discount percentage', default: 0 })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  discountPercent?: number;

  @ApiPropertyOptional({ example: 75.50, description: 'Cost price' })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @ApiPropertyOptional({ example: 'Special notes', description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateSaleDto {
  @ApiProperty({ example: 'SAL-2024-001', description: 'Sale number' })
  @IsString()
  @IsNotEmpty()
  saleNumber: string;

  @ApiProperty({ example: 'uuid-customer', description: 'Customer ID' })
  @IsUUID()
  customerId: string;

  @ApiPropertyOptional({ example: 'uuid-proforma', description: 'Proforma ID' })
  @IsUUID()
  @IsOptional()
  proformaId?: string;

  @ApiPropertyOptional({ enum: SaleStatus, default: SaleStatus.PENDING })
  @IsEnum(SaleStatus)
  @IsOptional()
  status?: SaleStatus;

  @ApiProperty({ example: '2024-02-08', description: 'Sale date' })
  @IsDateString()
  saleDate: string;

  @ApiPropertyOptional({ example: 12, description: 'Tax percentage', default: 0 })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  tax?: number;

  @ApiPropertyOptional({ example: 10, description: 'Discount amount', default: 0 })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({ example: 500, description: 'Paid amount', default: 0 })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  paidAmount?: number;

  @ApiPropertyOptional({ example: 'CASH', description: 'Payment method' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'Customer paid in full', description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [SaleDetailDto], description: 'Sale details' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleDetailDto)
  details: SaleDetailDto[];
}