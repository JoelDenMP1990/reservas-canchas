import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProformaService } from '../proforma.service';
import { Proforma, ProformaStatus } from '../proforma.model';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-proforma-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomCurrencyPipe, DateFormatPipe],
  templateUrl: './proforma-detail.component.html',
  styleUrls: ['./proforma-detail.component.scss']
})
export class ProformaDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private proformaService = inject(ProformaService);
  private notificationService = inject(NotificationService);

  proforma: Proforma | null = null;
  ProformaStatus = ProformaStatus;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProforma(id);
    }
  }

  loadProforma(id: string): void {
    this.proformaService.getById(id).subscribe({
      next: (data) => {
        this.proforma = data;
      },
      error: () => {
        this.notificationService.error('Error al cargar proforma');
        this.router.navigate(['/proformas']);
      }
    });
  }

  approveProforma(): void {
    if (this.proforma) {
      this.proformaService.approve(this.proforma.id).subscribe({
        next: () => {
          this.notificationService.success('Proforma aprobada correctamente');
          this.loadProforma(this.proforma!.id);
        },
        error: () => {
          this.notificationService.error('Error al aprobar proforma');
        }
      });
    }
  }

  rejectProforma(): void {
    if (this.proforma && confirm('¿Estás seguro de rechazar esta proforma?')) {
      this.proformaService.reject(this.proforma.id).subscribe({
        next: () => {
          this.notificationService.success('Proforma rechazada');
          this.loadProforma(this.proforma!.id);
        },
        error: () => {
          this.notificationService.error('Error al rechazar proforma');
        }
      });
    }
  }

  convertProforma(): void {
    if (this.proforma && confirm('¿Convertir esta proforma en venta?')) {
      this.proformaService.convert(this.proforma.id).subscribe({
        next: () => {
          this.notificationService.success('Proforma convertida a venta exitosamente');
          this.loadProforma(this.proforma!.id);
        },
        error: () => {
          this.notificationService.error('Error al convertir proforma');
        }
      });
    }
  }

  getStatusClass(status: ProformaStatus): string {
    switch (status) {
      case ProformaStatus.APPROVED:
        return 'badge-success';
      case ProformaStatus.DRAFT:
        return 'badge-secondary';
      case ProformaStatus.SENT:
        return 'badge-info';
      case ProformaStatus.REJECTED:
        return 'badge-danger';
      case ProformaStatus.CONVERTED:
        return 'badge-primary';
      default:
        return 'badge-secondary';
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

  printProforma(): void {
    window.print();
  }
}