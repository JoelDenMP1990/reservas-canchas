import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardOverview {
  totalSales: number;
  completedSales: number;
  pendingSales: number;
  cancelledSales: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingProformas: number;
}

export interface SalesMetrics {
  totalSales: number;
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  avgSaleValue: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  productCode: string;
  totalQuantity: number;
  totalRevenue: number;
  salesCount: number;
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  documentNumber: string;
  totalSpent: number;
  salesCount: number;
  avgPurchase: number;
}

export interface MonthlySales {
  month: number;
  salesCount: number;
  totalRevenue: number;
  totalPaid: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/dashboard`;

  getOverview(): Observable<DashboardOverview> {
    return this.http.get<DashboardOverview>(`${this.API_URL}/overview`);
  }

  getSalesMetrics(startDate?: string, endDate?: string): Observable<SalesMetrics> {
    let params = new HttpParams();
    
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    
    return this.http.get<SalesMetrics>(`${this.API_URL}/sales-metrics`, { params });
  }

  getTopProducts(limit: number = 10): Observable<TopProduct[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<TopProduct[]>(`${this.API_URL}/top-products`, { params });
  }

  getTopCustomers(limit: number = 10): Observable<TopCustomer[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<TopCustomer[]>(`${this.API_URL}/top-customers`, { params });
  }

  getSalesByMonth(year?: number): Observable<MonthlySales[]> {
    let params = new HttpParams();
    
    if (year) {
      params = params.set('year', year.toString());
    }
    
    return this.http.get<MonthlySales[]>(`${this.API_URL}/sales-by-month`, { params });
  }

  getLowStockProducts(limit: number = 20): Observable<any[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any[]>(`${this.API_URL}/low-stock`, { params });
  }

  getRecentSales(limit: number = 10): Observable<any[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any[]>(`${this.API_URL}/recent-sales`, { params });
  }

  getPendingPayments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/pending-payments`);
  }

  getProformaStats(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/proforma-stats`);
  }

  getSalesByStatus(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/sales-by-status`);
  }
}