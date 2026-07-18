import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InventoryService } from '../inventory.service';
import { ProductService } from '../../products/product.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../products/product.model';
import { Inventory } from '../inventory.model';

@Component({
  selector: 'app-inventory-adjust',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-adjust.component.html',
  styleUrls: ['./inventory-adjust.component.scss']
})
export class InventoryAdjustComponent implements OnInit {
  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  adjustForm: FormGroup;
  products: Product[] = [];
  currentInventory: Inventory | null = null;
  productId: string | null = null;
  isLoading = false;

  adjustmentType: 'add' | 'subtract' | 'adjust' = 'adjust';

  constructor() {
    this.adjustForm = this.fb.group({
      productId: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      adjustmentType: ['adjust', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.productId = this.route.snapshot.paramMap.get('productId');
    
    if (this.productId) {
      this.adjustForm.patchValue({ productId: this.productId });
      this.loadInventory(this.productId);
    }

    this.adjustForm.get('productId')?.valueChanges.subscribe(productId => {
      if (productId) {
        this.loadInventory(productId);
      }
    });
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data.filter(p => p.isActive);
      }
    });
  }

  loadInventory(productId: string): void {
    this.inventoryService.getByProduct(productId).subscribe({
      next: (data) => {
        this.currentInventory = data;
      },
      error: () => {
        this.currentInventory = null;
      }
    });
  }

  onSubmit(): void {
    if (this.adjustForm.invalid) {
      this.adjustForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { productId, quantity, adjustmentType } = this.adjustForm.value;

    let request;
    switch (adjustmentType) {
      case 'add':
        request = this.inventoryService.addStock(productId, quantity);
        break;
      case 'subtract':
        request = this.inventoryService.subtractStock(productId, quantity);
        break;
      case 'adjust':
        request = this.inventoryService.adjustStock(productId, quantity);
        break;
      default:
        request = this.inventoryService.adjustStock(productId, quantity);
    }

    request.subscribe({
      next: () => {
        this.notificationService.success('Stock ajustado correctamente');
        this.router.navigate(['/inventory']);
      },
      error: (error) => {
        this.notificationService.error(
          error.error?.message || 'Error al ajustar stock'
        );
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/inventory']);
  }

  get quantity() {
    return this.adjustForm.get('quantity');
  }

  get productIdControl() {
    return this.adjustForm.get('productId');
  }
}