import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SaleService } from '../sale.service';
import { Sale, SaleStatus } from '../sale.model';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CustomCurrencyPipe,
    DateFormatPipe,
    ConfirmDialogComponent
  ],
  templateUrl: './sale-list.component.html',
  styleUrls: ['./sale-list.component.scss']
})
export class SaleListComponent implements OnInit {
  private saleService = inject(SaleService);
  private notificationService = inject(NotificationService);

  sales: Sale[] = [];
  filteredSales: Sale[] = [];
  searchTerm = '';
  selectedStatus = '';
  
  showDeleteDialog = false;
  showCancelDialog = false;
  saleToDelete: Sale | null = null;
  saleToCancel: Sale | null = null;

  SaleStatus = SaleStatus;

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.saleService.getAll().subscribe({
      next: (data) => {
        this.sales = data;
        this.filteredSales = data;
      },
      error: () => {
        this.notificationService.error('Error al cargar ventas');
      }
    });
  }

  filterSales(): void {
    this.filteredSales = this.sales.filter(sale => {
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = 
        sale.saleNumber.toLowerCase().includes(searchLower) ||
        sale.customer?.businessName.toLowerCase().includes(searchLower);
      const matchesStatus = !this.selectedStatus || sale.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  confirmDelete(sale: Sale): void {
    this.saleToDelete = sale;
    this.showDeleteDialog = true;
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
    this.saleToDelete = null;
  }

  deleteSale(): void {
    if (this.saleToDelete) {
      this.saleService.delete(this.saleToDelete.id).subscribe({
        next: () => {
          this.notificationService.success('Venta eliminada correctamente');
          this.loadSales();
          this.cancelDelete();
        },
        error: () => {
          this.notificationService.error('Error al eliminar venta');
          this.cancelDelete();
        }
      });
    }
  }

  confirmCancel(sale: Sale): void {
    this.saleToCancel = sale;
    this.showCancelDialog = true;
  }

  cancelCancelDialog(): void {
    this.showCancelDialog = false;
    this.saleToCancel = null;
  }

  cancelSale(): void {
    if (this.saleToCancel) {
      this.saleService.cancel(this.saleToCancel.id).subscribe({
        next: () => {
          this.notificationService.success('Venta cancelada correctamente');
          this.loadSales();
          this.cancelCancelDialog();
        },
        error: () => {
          this.notificationService.error('Error al cancelar venta');
          this.cancelCancelDialog();
        }
      });
    }
  }

  completeSale(sale: Sale): void {
    this.saleService.complete(sale.id).subscribe({
      next: () => {
        this.notificationService.success('Venta completada correctamente');
        this.loadSales();
      },
      error: () => {
        this.notificationService.error('Error al completar venta');
      }
    });
  }

  getStatusClass(status: SaleStatus): string {
    switch (status) {
      case SaleStatus.COMPLETED:
        return 'badge-success';
      case SaleStatus.PENDING:
        return 'badge-warning';
      case SaleStatus.CANCELLED:
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  getStatusLabel(status: SaleStatus): string {
    switch (status) {
      case SaleStatus.COMPLETED:
        return 'Completada';
      case SaleStatus.PENDING:
        return 'Pendiente';
      case SaleStatus.CANCELLED:
        return 'Cancelada';
      default:
        return status;
    }
  }
}