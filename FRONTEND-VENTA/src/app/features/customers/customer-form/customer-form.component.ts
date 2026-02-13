import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../customer.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  customerForm: FormGroup;
  isEditMode = false;
  customerId: string | null = null;
  isLoading = false;

  documentTypes = ['RUC', 'CEDULA', 'PASAPORTE'];

  constructor() {
    this.customerForm = this.fb.group({
      documentType: ['RUC', Validators.required],
      documentNumber: ['', [Validators.required, Validators.maxLength(50)]],
      businessName: ['', [Validators.required, Validators.maxLength(255)]],
      contactName: ['', Validators.maxLength(255)],
      email: ['', [Validators.email, Validators.maxLength(255)]],
      phone: ['', Validators.maxLength(50)],
      address: [''],
      city: ['', Validators.maxLength(100)],
      state: ['', Validators.maxLength(100)],
      country: ['Ecuador', Validators.maxLength(100)],
      creditLimit: [0, [Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.customerId;

    if (this.isEditMode && this.customerId) {
      this.loadCustomer(this.customerId);
    }
  }

  loadCustomer(id: string): void {
    this.customerService.getById(id).subscribe({
      next: (customer) => {
        this.customerForm.patchValue(customer);
      },
      error: () => {
        this.notificationService.error('Error al cargar cliente');
        this.router.navigate(['/customers']);
      }
    });
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.customerForm.value;

    const request = this.isEditMode && this.customerId
      ? this.customerService.update(this.customerId, formData)
      : this.customerService.create(formData);

    request.subscribe({
      next: () => {
        this.notificationService.success(
          `Cliente ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`
        );
        this.router.navigate(['/customers']);
      },
      error: (error) => {
        this.notificationService.error(
          error.error?.message || 'Error al guardar cliente'
        );
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/customers']);
  }

  get documentNumber() { return this.customerForm.get('documentNumber'); }
  get businessName() { return this.customerForm.get('businessName'); }
  get email() { return this.customerForm.get('email'); }
}