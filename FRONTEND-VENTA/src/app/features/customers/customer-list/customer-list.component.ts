import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../customer.service';
import { Customer } from '../customer.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  private customerService = inject(CustomerService);
  private notificationService = inject(NotificationService);

  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  searchTerm = '';
  
  showDeleteDialog = false;
  customerToDelete: Customer | null = null;

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.getAll().subscribe({
      next: (data) => {
        this.customers = data;
        this.filteredCustomers = data;
      },
      error: () => {
        this.notificationService.error('Error al cargar clientes');
      }
    });
  }

  filterCustomers(): void {
    this.filteredCustomers = this.customers.filter(customer => {
      const searchLower = this.searchTerm.toLowerCase();
      return customer.businessName.toLowerCase().includes(searchLower) ||
             customer.documentNumber.toLowerCase().includes(searchLower) ||
             customer.email?.toLowerCase().includes(searchLower) ||
             customer.phone?.toLowerCase().includes(searchLower);
    });
  }

  confirmDelete(customer: Customer): void {
    this.customerToDelete = customer;
    this.showDeleteDialog = true;
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
    this.customerToDelete = null;
  }

  deleteCustomer(): void {
    if (this.customerToDelete) {
      this.customerService.delete(this.customerToDelete.id).subscribe({
        next: () => {
          this.notificationService.success('Cliente eliminado correctamente');
          this.loadCustomers();
          this.cancelDelete();
        },
        error: () => {
          this.notificationService.error('Error al eliminar cliente');
          this.cancelDelete();
        }
      });
    }
  }

  toggleActive(customer: Customer): void {
    const action = customer.isActive ? 
      this.customerService.deactivate(customer.id) : 
      this.customerService.activate(customer.id);

    action.subscribe({
      next: () => {
        this.notificationService.success(
          `Cliente ${customer.isActive ? 'desactivado' : 'activado'} correctamente`
        );
        this.loadCustomers();
      },
      error: () => {
        this.notificationService.error('Error al actualizar cliente');
      }
    });
  }
}