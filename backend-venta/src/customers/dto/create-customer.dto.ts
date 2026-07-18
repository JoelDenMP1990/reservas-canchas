import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsBoolean, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCustomerDto {
  @ApiProperty({ example: 'RUC', description: 'Document type (RUC, CEDULA, PASAPORTE)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  documentType: string;

  @ApiProperty({ example: '1234567890001', description: 'Document number' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  documentNumber: string;

  @ApiProperty({ example: 'Empresa S.A.', description: 'Business name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  businessName: string;

  @ApiPropertyOptional({ example: 'Juan Pérez', description: 'Contact name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  contactName?: string;

  @ApiPropertyOptional({ example: 'contacto@empresa.com', description: 'Email' })
  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '0987654321', description: 'Phone' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: 'Av. Principal 123', description: 'Address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Guayaquil', description: 'City' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'Guayas', description: 'State' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ example: 'Ecuador', description: 'Country', default: 'Ecuador' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: 5000, description: 'Credit limit', default: 0 })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  creditLimit?: number;

  @ApiPropertyOptional({ example: true, description: 'Is active?', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}