export enum ProformaStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CONVERTED = 'CONVERTED'
}

export interface ProformaDetail {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
  total: number;
  notes?: string;
  product?: any;
}

export interface Proforma {
  id: string;
  proformaNumber: string;
  customerId: string;
  status: ProformaStatus;
  issueDate: Date | string;
  validUntil: Date | string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  terms?: string;
  details: ProformaDetail[];
  customer?: any;
  createdAt: Date;
}

export interface CreateProformaDto {
  proformaNumber: string;
  customerId: string;
  status?: ProformaStatus;
  issueDate: string;
  validUntil: string;
  tax?: number;
  discount?: number;
  notes?: string;
  terms?: string;
  details: ProformaDetailDto[];
}

export interface ProformaDetailDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  notes?: string;
}

export interface UpdateProformaDto extends Partial<CreateProformaDto> {}