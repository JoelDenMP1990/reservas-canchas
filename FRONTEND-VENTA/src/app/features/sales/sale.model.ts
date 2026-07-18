export enum SaleStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface SaleDetail {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
  total: number;
  costPrice?: number;
  notes?: string;
  product?: any;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerId: string;
  proformaId?: string;
  status: SaleStatus;
  saleDate: Date | string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  balance: number;
  paymentMethod?: string;
  notes?: string;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: Date;
  details: SaleDetail[];
  customer?: any;
  proforma?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSaleDto {
  saleNumber: string;
  customerId: string;
  proformaId?: string;
  status?: SaleStatus;
  saleDate: string;
  tax?: number;
  discount?: number;
  paidAmount?: number;
  paymentMethod?: string;
  notes?: string;
  details: SaleDetailDto[];
}

export interface SaleDetailDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  costPrice?: number;
  notes?: string;
}

export interface UpdateSaleDto {
  saleNumber?: string;
  customerId?: string;
  proformaId?: string;
  status?: SaleStatus;
  saleDate?: string;
  tax?: number;
  discount?: number;
  paidAmount?: number;
  paymentMethod?: string;
  notes?: string;
  details?: SaleDetailDto[];
}