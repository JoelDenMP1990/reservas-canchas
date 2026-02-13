import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sale, CreateSaleDto, UpdateSaleDto } from './sale.model';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/sales`;

  getAll(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.API_URL);
  }

  getById(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.API_URL}/${id}`);
  }

  getByNumber(saleNumber: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.API_URL}/number/${saleNumber}`);
  }

  getByCustomer(customerId: string): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.API_URL}/customer/${customerId}`);
  }

  create(sale: CreateSaleDto): Observable<Sale> {
    return this.http.post<Sale>(this.API_URL, sale);
  }

  update(id: string, sale: UpdateSaleDto): Observable<Sale> {
    return this.http.patch<Sale>(`${this.API_URL}/${id}`, sale);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  complete(id: string): Observable<Sale> {
    return this.http.patch<Sale>(`${this.API_URL}/${id}/complete`, {});
  }

  cancel(id: string): Observable<Sale> {
    return this.http.patch<Sale>(`${this.API_URL}/${id}/cancel`, {});
  }

  addPayment(id: string, amount: number): Observable<Sale> {
    return this.http.patch<Sale>(`${this.API_URL}/${id}/payment`, { amount });
  }
}