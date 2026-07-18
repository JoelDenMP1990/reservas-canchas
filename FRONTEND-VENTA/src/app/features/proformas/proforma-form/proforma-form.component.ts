import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProformaService } from '../proforma.service';
import { ProductService } from '../../products/product.service';
import { CustomerService } from '../../customers/customer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../products/product.model';
import { Customer } from '../../customers/customer.model';
import { CustomCurrencyPipe } from '../../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-proforma-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomCurrencyPipe],
  templateUrl: './proforma-form.component.html',
  styleUrls: ['./proforma-form.component.scss']
})
export class ProformaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private proformaService = inject(ProformaService);
  private productService = inject(ProductService);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  proformaForm: FormGroup;
  isEditMode = false;
  proformaId: string | null = null;
  isLoading = false;

  products: Product[] = [];
  customers: Customer[] = [];

  constructor() {
    this.proformaForm = this.fb.group({
      proformaNumber: ['', [Validators.required, Validators.maxLength(50)]],
      customerId: ['', Validators.required],
      issueDate: [new Date().toISOString().split('T')[0], Validators.required],
      validUntil: ['', Validators.required],
      tax: [12, [Validators.min(0)]],
      discount: [0, [Validators.min(0)]],
      notes: [''],
      terms: [''],
      details: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCustomers();
    
    this.proformaId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.proformaId;

    if (this.isEditMode && this.proformaId) {
      this.loadProforma(this.proformaId);
    } else {
      this.addDetail();
      this.setDefaultValidUntil();
    }
  }

  setDefaultValidUntil(): void {
    const today = new Date();
    const validUntil = new Date(today);
    validUntil.setDate(today.getDate() + 30);
    this.proformaForm.patchValue({
      validUntil: validUntil.toISOString().split('T')[0]
    });
  }

  get details(): FormArray {
    return this.proformaForm.get('details') as FormArray;
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

  loadProforma(id: string): void {
    this.proformaService.getById(id).subscribe({
      next: (proforma) => {
        this.proformaForm.patchValue({
          proformaNumber: proforma.proformaNumber,
          customerId: proforma.customerId,
          issueDate: proforma.issueDate,
          validUntil: proforma.validUntil,
          tax: proforma.tax,
          discount: proforma.discount,
          notes: proforma.notes,
          terms: proforma.terms
        });

        proforma.details.forEach(detail => {
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
        this.notificationService.error('Error al cargar proforma');
        this.router.navigate(['/proformas']);
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
    const taxPercent = this.proformaForm.get('tax')?.value || 0;
    return subtotal * (taxPercent / 100);
  }

  calculateTotal(): number {
    const subtotal = this.calculateSubtotal();
    const tax = this.calculateTax();
    const discount = this.proformaForm.get('discount')?.value || 0;
    return subtotal + tax - discount;
  }

  onSubmit(): void {
    if (this.proformaForm.invalid || this.details.length === 0) {
      this.proformaForm.markAllAsTouched();
      this.details.controls.forEach(c => c.markAllAsTouched());
      this.notificationService.error('Por favor completa todos los campos requeridos');
      return;
    }

    this.isLoading = true;
    const formData = this.proformaForm.value;

    const request = this.isEditMode && this.proformaId
      ? this.proformaService.update(this.proformaId, formData)
      : this.proformaService.create(formData);

    request.subscribe({
      next: () => {
        this.notificationService.success(
          `Proforma ${this.isEditMode ? 'actualizada' : 'creada'} correctamente`
        );
        this.router.navigate(['/proformas']);
      },
      error: (error) => {
        this.notificationService.error(
          error.error?.message || 'Error al guardar proforma'
        );
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/proformas']);
  }
}