import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Customer, CreateCustomerDto, UpdateCustomerDto } from './customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/customers`;

  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.API_URL);
  }

  getById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.API_URL}/${id}`);
  }

  getByDocument(documentNumber: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.API_URL}/document/${documentNumber}`);
  }

  create(customer: CreateCustomerDto): Observable<Customer> {
    return this.http.post<Customer>(this.API_URL, customer);
  }

  update(id: string, customer: UpdateCustomerDto): Observable<Customer> {
    return this.http.patch<Customer>(`${this.API_URL}/${id}`, customer);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  activate(id: string): Observable<Customer> {
    return this.http.patch<Customer>(`${this.API_URL}/${id}/activate`, {});
  }

  deactivate(id: string): Observable<Customer> {
    return this.http.patch<Customer>(`${this.API_URL}/${id}/deactivate`, {});
  }

  restore(id: string): Observable<Customer> {
    return this.http.patch<Customer>(`${this.API_URL}/${id}/restore`, {});
  }
}