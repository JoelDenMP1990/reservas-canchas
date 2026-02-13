import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID, IsDateString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProformaStatus } from '../entities/proforma.entity';

export class ProformaDetailDto {
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

  @ApiPropertyOptional({ example: 'Special discount', description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateProformaDto {
  @ApiProperty({ example: 'PRO-2024-001', description: 'Proforma number' })
  @IsString()
  @IsNotEmpty()
  proformaNumber: string;

  @ApiProperty({ example: 'uuid-customer', description: 'Customer ID' })
  @IsUUID()
  customerId: string;

  @ApiPropertyOptional({ enum: ProformaStatus, default: ProformaStatus.DRAFT })
  @IsEnum(ProformaStatus)
  @IsOptional()
  status?: ProformaStatus;

  @ApiProperty({ example: '2024-02-08', description: 'Issue date' })
  @IsDateString()
  issueDate: string;

  @ApiProperty({ example: '2024-03-08', description: 'Valid until date' })
  @IsDateString()
  validUntil: string;

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

  @ApiPropertyOptional({ example: 'Payment terms...', description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'Terms and conditions...', description: 'Terms' })
  @IsString()
  @IsOptional()
  terms?: string;

  @ApiProperty({ type: [ProformaDetailDto], description: 'Proforma details' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProformaDetailDto)
  details: ProformaDetailDto[];
}