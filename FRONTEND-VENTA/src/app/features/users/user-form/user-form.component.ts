import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Role } from '../../../core/models/enums';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  userForm: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  isLoading = false;
  showPassword = false;

  roles = [
    { value: Role.ADMIN, label: 'Administrador' },
    { value: Role.SELLER, label: 'Vendedor' },
    { value: Role.VIEWER, label: 'Visualizador' }
  ];

  constructor() {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(12)]],
      fullName: ['', [Validators.required, Validators.maxLength(255)]],
      role: [Role.VIEWER, Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;

    if (this.isEditMode) {
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      
      if (this.userId) {
        this.loadUser(this.userId);
      }
    }
  }

  loadUser(id: string): void {
    this.userService.getById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isActive: user.isActive
        });
      },
      error: () => {
        this.notificationService.error('Error al cargar usuario');
        this.router.navigate(['/users']);
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = { ...this.userForm.value };

    // Si estamos editando y no hay password, lo eliminamos del payload
    if (this.isEditMode && !formData.password) {
      delete formData.password;
    }

    const request = this.isEditMode && this.userId
      ? this.userService.update(this.userId, formData)
      : this.userService.create(formData);

    request.subscribe({
      next: () => {
        this.notificationService.success(
          `Usuario ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`
        );
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.notificationService.error(
          error.error?.message || 'Error al guardar usuario'
        );
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }

  get email() { return this.userForm.get('email'); }
  get password() { return this.userForm.get('password'); }
  get fullName() { return this.userForm.get('fullName'); }
}