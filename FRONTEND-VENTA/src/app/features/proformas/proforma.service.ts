import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Proforma, CreateProformaDto, UpdateProformaDto } from './proforma.model';

@Injectable({ providedIn: 'root' })
export class ProformaService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/proformas`;

  getAll(): Observable<Proforma[]> {
    return this.http.get<Proforma[]>(this.API_URL);
  }

  getById(id: string): Observable<Proforma> {
    return this.http.get<Proforma>(`${this.API_URL}/${id}`);
  }

  getByNumber(proformaNumber: string): Observable<Proforma> {
    return this.http.get<Proforma>(`${this.API_URL}/number/${proformaNumber}`);
  }

  getByCustomer(customerId: string): Observable<Proforma[]> {
    return this.http.get<Proforma[]>(`${this.API_URL}/customer/${customerId}`);
  }

  create(proforma: CreateProformaDto): Observable<Proforma> {
    return this.http.post<Proforma>(this.API_URL, proforma);
  }

  update(id: string, proforma: UpdateProformaDto): Observable<Proforma> {
    return this.http.patch<Proforma>(`${this.API_URL}/${id}`, proforma);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  approve(id: string): Observable<Proforma> {
    return this.http.patch<Proforma>(`${this.API_URL}/${id}/approve`, {});
  }

  reject(id: string): Observable<Proforma> {
    return this.http.patch<Proforma>(`${this.API_URL}/${id}/reject`, {});
  }

  convert(id: string): Observable<Proforma> {
    return this.http.patch<Proforma>(`${this.API_URL}/${id}/convert`, {});
  }
}