export interface Customer {
  id: string;
  documentType: string;
  documentNumber: string;
  businessName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  creditLimit: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDto {
  documentType: string;
  documentNumber: string;
  businessName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  creditLimit?: number;
  isActive?: boolean;
}

export interface UpdateCustomerDto {
  documentType?: string;
  documentNumber?: string;
  businessName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  creditLimit?: number;
  isActive?: boolean;
}