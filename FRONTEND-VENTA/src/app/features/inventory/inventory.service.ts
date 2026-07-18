import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Inventory, CreateInventoryDto, UpdateInventoryDto } from './inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/inventory`;

  getAll(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(this.API_URL);
  }

  getById(id: string): Observable<Inventory> {
    return this.http.get<Inventory>(`${this.API_URL}/${id}`);
  }

  getByProduct(productId: string): Observable<Inventory> {
    return this.http.get<Inventory>(`${this.API_URL}/product/${productId}`);
  }

  getLowStock(minStock?: number): Observable<Inventory[]> {
    let params = new HttpParams();
    if (minStock) {
      params = params.set('minStock', minStock.toString());
    }
    return this.http.get<Inventory[]>(`${this.API_URL}/low-stock`, { params });
  }

  create(inventory: CreateInventoryDto): Observable<Inventory> {
    return this.http.post<Inventory>(this.API_URL, inventory);
  }

  addStock(productId: string, quantity: number): Observable<Inventory> {
    return this.http.patch<Inventory>(`${this.API_URL}/add/${productId}`, { quantity });
  }

  subtractStock(productId: string, quantity: number): Observable<Inventory> {
    return this.http.patch<Inventory>(`${this.API_URL}/subtract/${productId}`, { quantity });
  }

  adjustStock(productId: string, quantity: number): Observable<Inventory> {
    return this.http.patch<Inventory>(`${this.API_URL}/adjust/${productId}`, { quantity });
  }
}