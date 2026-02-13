import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardOverview, SalesMetrics, TopProduct, TopCustomer, MonthlySales } from './dashboard.service';
import { CustomCurrencyPipe } from '../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomCurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  overview: DashboardOverview | null = null;
  salesMetrics: SalesMetrics | null = null;
  topProducts: TopProduct[] = [];
  topCustomers: TopCustomer[] = [];
  monthlySales: MonthlySales[] = [];
  recentSales: any[] = [];
  lowStockProducts: any[] = [];
  pendingPayments: any[] = [];
  
  isLoading = true;
  selectedYear = new Date().getFullYear();

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    this.dashboardService.getOverview().subscribe({
      next: (data) => {
        this.overview = data;
      }
    });

    this.dashboardService.getSalesMetrics().subscribe({
      next: (data) => {
        this.salesMetrics = data;
      }
    });

    this.dashboardService.getTopProducts(5).subscribe({
      next: (data) => {
        this.topProducts = data;
      }
    });

    this.dashboardService.getTopCustomers(5).subscribe({
      next: (data) => {
        this.topCustomers = data;
      }
    });

    this.dashboardService.getSalesByMonth(this.selectedYear).subscribe({
      next: (data) => {
        this.monthlySales = data;
        this.isLoading = false;
      }
    });

    this.dashboardService.getRecentSales(5).subscribe({
      next: (data) => {
        this.recentSales = data;
      }
    });

    this.dashboardService.getLowStockProducts(5).subscribe({
      next: (data) => {
        this.lowStockProducts = data;
      }
    });

    this.dashboardService.getPendingPayments().subscribe({
      next: (data) => {
        this.pendingPayments = data.slice(0, 5);
      }
    });
  }

  getMonthName(month: number): string {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months[month - 1];
  }

  // Agregar este método en la clase DashboardComponent
getMaxRevenue(): number {
  if (this.monthlySales.length === 0) return 0;
  return Math.max(...this.monthlySales.map(m => Number(m.totalRevenue)));
}
}

