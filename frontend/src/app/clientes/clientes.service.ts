import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base';

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
}

@Injectable({ providedIn: 'root' })
export class ClientesService {
  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${API_BASE_URL}/clientes`);
  }

  crear(datos: Partial<Cliente>): Observable<Cliente> {
    return this.http.post<Cliente>(`${API_BASE_URL}/clientes`, datos);
  }

  editar(id: string, datos: Partial<Cliente>): Observable<Cliente> {
    return this.http.patch<Cliente>(`${API_BASE_URL}/clientes/${id}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/clientes/${id}`);
  }

  getReservasActivas(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/clientes/${id}/reservas-activas`);
  }
}
