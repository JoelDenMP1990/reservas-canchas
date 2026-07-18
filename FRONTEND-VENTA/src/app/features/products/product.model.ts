export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  unitOfMeasure: string;
  category?: string;
  basePrice: number;
  costPrice?: number;
  minStock: number;
  maxStock?: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  code: string;
  name: string;
  description?: string;
  unitOfMeasure: string;
  category?: string;
  basePrice: number;
  costPrice?: number;
  minStock?: number;
  maxStock?: number;
  isActive?: boolean;
}

export interface UpdateProductDto {
  code?: string;
  name?: string;
  description?: string;
  unitOfMeasure?: string;
  category?: string;
  basePrice?: number;
  costPrice?: number;
  minStock?: number;
  maxStock?: number;
  isActive?: boolean;
}