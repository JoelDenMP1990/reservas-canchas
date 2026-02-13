import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../product.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  productForm: FormGroup;
  isEditMode = false;
  productId: string | null = null;
  isLoading = false;

  constructor() {
    this.productForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      unitOfMeasure: ['', [Validators.required, Validators.maxLength(20)]],
      category: ['', Validators.maxLength(100)],
      basePrice: [0, [Validators.required, Validators.min(0)]],
      costPrice: [0, Validators.min(0)],
      minStock: [0, [Validators.min(0)]],
      maxStock: [0, Validators.min(0)],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;

    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: string): void {
    this.productService.getById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue(product);
      },
      error: () => {
        this.notificationService.error('Error al cargar producto');
        this.router.navigate(['/products']);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.productForm.value;

    const request = this.isEditMode && this.productId
      ? this.productService.update(this.productId, formData)
      : this.productService.create(formData);

    request.subscribe({
      next: () => {
        this.notificationService.success(
          `Producto ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`
        );
        this.router.navigate(['/products']);
      },
      error: (error) => {
        this.notificationService.error(
          error.error?.message || 'Error al guardar producto'
        );
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }

  get code() { return this.productForm.get('code'); }
  get name() { return this.productForm.get('name'); }
  get unitOfMeasure() { return this.productForm.get('unitOfMeasure'); }
  get basePrice() { return this.productForm.get('basePrice'); }
}