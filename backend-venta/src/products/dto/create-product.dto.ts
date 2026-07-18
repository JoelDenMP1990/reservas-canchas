import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'PROD001', description: 'Unique product code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Laptop HP 15', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'High performance laptop', description: 'Product description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'UNIT', description: 'Unit of measure' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unitOfMeasure: string;

  @ApiPropertyOptional({ example: 'Electronics', description: 'Product category' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiProperty({ example: 599.99, description: 'Base selling price' })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ example: 450.00, description: 'Cost price' })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @ApiPropertyOptional({ example: 10, description: 'Minimum stock level', default: 0 })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  minStock?: number;

  @ApiPropertyOptional({ example: 100, description: 'Maximum stock level' })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  maxStock?: number;

  @ApiPropertyOptional({ example: true, description: 'Is product active?', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}