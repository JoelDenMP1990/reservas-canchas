import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SaleService } from '../sale.service';
import { Sale, SaleStatus } from '../sale.model';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-sale-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomCurrencyPipe, DateFormatPipe],
  templateUrl: './sale-detail.component.html',
  styleUrls: ['./sale-detail.component.scss']
})
export class SaleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private saleService = inject(SaleService);
  private notificationService = inject(NotificationService);

  sale: Sale | null = null;
  SaleStatus = SaleStatus;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSale(id);
    }
  }

  loadSale(id: string): void {
    this.saleService.getById(id).subscribe({
      next: (data) => {
        this.sale = data;
      },
      error: () => {
        this.notificationService.error('Error al cargar venta');
        this.router.navigate(['/sales']);
      }
    });
  }

  completeSale(): void {
    if (this.sale) {
      this.saleService.complete(this.sale.id).subscribe({
        next: () => {
          this.notificationService.success('Venta completada correctamente');
          this.loadSale(this.sale!.id);
        },
        error: () => {
          this.notificationService.error('Error al completar venta');
        }
      });
    }
  }

  cancelSale(): void {
    if (this.sale && confirm('¿Estás seguro de cancelar esta venta?')) {
      this.saleService.cancel(this.sale.id).subscribe({
        next: () => {
          this.notificationService.success('Venta cancelada correctamente');
          this.loadSale(this.sale!.id);
        },
        error: () => {
          this.notificationService.error('Error al cancelar venta');
        }
      });
    }
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

  printSale(): void {
    window.print();
  }
}