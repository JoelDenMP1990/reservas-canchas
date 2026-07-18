import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SaleService } from '../sale.service';
import { ProductService } from '../../products/product.service';
import { CustomerService } from '../../customers/customer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../products/product.model';
import { Customer } from '../../customers/customer.model';
import { CustomCurrencyPipe } from '../../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomCurrencyPipe],
  templateUrl: './sale-form.component.html',
  styleUrls: ['./sale-form.component.scss']
})
export class SaleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private saleService = inject(SaleService);
  private productService = inject(ProductService);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  saleForm: FormGroup;
  isEditMode = false;
  saleId: string | null = null;
  isLoading = false;

  products: Product[] = [];
  customers: Customer[] = [];

  constructor() {
    this.saleForm = this.fb.group({
      saleNumber: ['', [Validators.required, Validators.maxLength(50)]],
      customerId: ['', Validators.required],
      saleDate: [new Date().toISOString().split('T')[0], Validators.required],
      tax: [12, [Validators.min(0)]],
      discount: [0, [Validators.min(0)]],
      paidAmount: [0, [Validators.min(0)]],
      paymentMethod: [''],
      notes: [''],
      details: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCustomers();
    
    this.saleId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.saleId;

    if (this.isEditMode && this.saleId) {
      this.loadSale(this.saleId);
    } else {
      this.addDetail();
    }
  }

  get details(): FormArray {
    return this.saleForm.get('details') as FormArray;
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data.filter(p => p.isActive);
      }
    });
  }

  loadCustomers(): void {
    this.customerService.getAll().subscribe({
      next: (data) => {
        this.customers = data.filter(c => c.isActive);
      }
    });
  }

  loadSale(id: string): void {
    this.saleService.getById(id).subscribe({
      next: (sale) => {
        this.saleForm.patchValue({
          saleNumber: sale.saleNumber,
          customerId: sale.customerId,
          saleDate: sale.saleDate,
          tax: sale.tax,
          discount: sale.discount,
          paidAmount: sale.paidAmount,
          paymentMethod: sale.paymentMethod,
          notes: sale.notes
        });

        sale.details.forEach(detail => {
          this.details.push(this.fb.group({
            productId: [detail.productId, Validators.required],
            quantity: [detail.quantity, [Validators.required, Validators.min(0.01)]],
            unitPrice: [detail.unitPrice, [Validators.required, Validators.min(0)]],
            discountPercent: [detail.discountPercent || 0, [Validators.min(0), Validators.max(100)]],
            notes: [detail.notes || '']
          }));
        });
      },
      error: () => {
        this.notificationService.error('Error al cargar venta');
        this.router.navigate(['/sales']);
      }
    });
  }

  addDetail(): void {
    this.details.push(this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      discountPercent: [0, [Validators.min(0), Validators.max(100)]],
      notes: ['']
    }));
  }

  removeDetail(index: number): void {
    if (this.details.length > 1) {
      this.details.removeAt(index);
    }
  }

  onProductChange(index: number): void {
    const detail = this.details.at(index);
    const productId = detail.get('productId')?.value;
    const product = this.products.find(p => p.id === productId);
    
    if (product) {
      detail.patchValue({
        unitPrice: product.basePrice
      });
    }
  }

  calculateDetailTotal(index: number): number {
    const detail = this.details.at(index).value;
    const subtotal = detail.quantity * detail.unitPrice;
    const discount = subtotal * (detail.discountPercent / 100);
    return subtotal - discount;
  }

  calculateSubtotal(): number {
    let subtotal = 0;
    for (let i = 0; i < this.details.length; i++) {
      const detail = this.details.at(i).value;
      subtotal += detail.quantity * detail.unitPrice;
    }
    return subtotal;
  }

  calculateTax(): number {
    const subtotal = this.calculateSubtotal();
    const taxPercent = this.saleForm.get('tax')?.value || 0;
    return subtotal * (taxPercent / 100);
  }

  calculateTotal(): number {
    const subtotal = this.calculateSubtotal();
    const tax = this.calculateTax();
    const discount = this.saleForm.get('discount')?.value || 0;
    return subtotal + tax - discount;
  }

  onSubmit(): void {
    if (this.saleForm.invalid || this.details.length === 0) {
      this.saleForm.markAllAsTouched();
      this.details.controls.forEach(c => c.markAllAsTouched());
      this.notificationService.error('Por favor completa todos los campos requeridos');
      return;
    }

    this.isLoading = true;
    const formData = this.saleForm.value;

    const request = this.isEditMode && this.saleId
      ? this.saleService.update(this.saleId, formData)
      : this.saleService.create(formData);

    request.subscribe({
      next: () => {
        this.notificationService.success(
          `Venta ${this.isEditMode ? 'actualizada' : 'creada'} correctamente`
        );
        this.router.navigate(['/sales']);
      },
      error: (error) => {
        this.notificationService.error(
          error.error?.message || 'Error al guardar venta'
        );
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/sales']);
  }
}