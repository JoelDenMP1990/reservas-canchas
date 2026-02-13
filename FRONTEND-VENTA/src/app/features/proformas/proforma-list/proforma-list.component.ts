import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProformaService } from '../proforma.service';
import { Proforma, ProformaStatus } from '../proforma.model';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-proforma-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CustomCurrencyPipe, DateFormatPipe, ConfirmDialogComponent],
  templateUrl: './proforma-list.component.html',
  styleUrls: ['./proforma-list.component.scss']
})
export class ProformaListComponent implements OnInit {
  private proformaService = inject(ProformaService);
  private notificationService = inject(NotificationService);

  proformas: Proforma[] = [];
  filteredProformas: Proforma[] = [];
  searchTerm = '';
  selectedStatus = '';
  
  showDeleteDialog = false;
  proformaToDelete: Proforma | null = null;

  ProformaStatus = ProformaStatus;

  ngOnInit(): void {
    this.loadProformas();
  }

  loadProformas(): void {
    this.proformaService.getAll().subscribe({
      next: (data) => {
        this.proformas = data;
        this.filteredProformas = data;
      },
      error: () => {
        this.notificationService.error('Error al cargar proformas');
      }
    });
  }

  filterProformas(): void {
    this.filteredProformas = this.proformas.filter(proforma => {
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = 
        proforma.proformaNumber.toLowerCase().includes(searchLower) ||
        proforma.customer?.businessName.toLowerCase().includes(searchLower);
      const matchesStatus = !this.selectedStatus || proforma.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  confirmDelete(proforma: Proforma): void {
    this.proformaToDelete = proforma;
    this.showDeleteDialog = true;
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
    this.proformaToDelete = null;
  }

  deleteProforma(): void {
    if (this.proformaToDelete) {
      this.proformaService.delete(this.proformaToDelete.id).subscribe({
        next: () => {
          this.notificationService.success('Proforma eliminada correctamente');
          this.loadProformas();
          this.cancelDelete();
        },
        error: () => {
          this.notificationService.error('Error al eliminar proforma');
          this.cancelDelete();
        }
      });
    }
  }

  approveProforma(proforma: Proforma): void {
    this.proformaService.approve(proforma.id).subscribe({
      next: () => {
        this.notificationService.success('Proforma aprobada correctamente');
        this.loadProformas();
      },
      error: () => {
        this.notificationService.error('Error al aprobar proforma');
      }
    });
  }

  rejectProforma(proforma: Proforma): void {
    this.proformaService.reject(proforma.id).subscribe({
      next: () => {
        this.notificationService.success('Proforma rechazada');
        this.loadProformas();
      },
      error: () => {
        this.notificationService.error('Error al rechazar proforma');
      }
    });
  }

  convertProforma(proforma: Proforma): void {
    this.proformaService.convert(proforma.id).subscribe({
      next: () => {
        this.notificationService.success('Proforma convertida a venta');
        this.loadProformas();
      },
      error: () => {
        this.notificationService.error('Error al convertir proforma');
      }
    });
  }

  getStatusClass(status: ProformaStatus): string {
    switch (status) {
      case ProformaStatus.APPROVED: return 'badge-success';
      case ProformaStatus.DRAFT: return 'badge-secondary';
      case ProformaStatus.SENT: return 'badge-info';
      case ProformaStatus.REJECTED: return 'badge-danger';
      case ProformaStatus.CONVERTED: return 'badge-primary';
      default: return 'badge-secondary';
    }
  }

  getStatusLabel(status: ProformaStatus): string {
    const labels = {
      DRAFT: 'Borrador',
      SENT: 'Enviada',
      APPROVED: 'Aprobada',
      REJECTED: 'Rechazada',
      CONVERTED: 'Convertida'
    };
    return labels[status] || status;
  }
}