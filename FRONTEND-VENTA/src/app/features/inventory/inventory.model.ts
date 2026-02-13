export interface Inventory {
  id: string;
  productId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastMovementDate: Date;
  updatedAt: Date;
  product?: any;
}

export interface CreateInventoryDto {
  productId: string;
  quantity: number;
}

export interface UpdateInventoryDto {
  quantity: number;
}