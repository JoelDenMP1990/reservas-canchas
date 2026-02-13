import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, CreateProductDto, UpdateProductDto } from './product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/products`;

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.API_URL);
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`);
  }

  getByCode(code: string): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/code/${code}`);
  }

  getByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/category/${category}`);
  }

  create(product: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(this.API_URL, product);
  }

  update(id: string, product: UpdateProductDto): Observable<Product> {
    return this.http.patch<Product>(`${this.API_URL}/${id}`, product);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  activate(id: string): Observable<Product> {
    return this.http.patch<Product>(`${this.API_URL}/${id}/activate`, {});
  }

  deactivate(id: string): Observable<Product> {
    return this.http.patch<Product>(`${this.API_URL}/${id}/deactivate`, {});
  }

  restore(id: string): Observable<Product> {
    return this.http.patch<Product>(`${this.API_URL}/${id}/restore`, {});
  }
}