import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base';

export interface Administrador {
  id: string;
  nombre: string;
  areaAsignada: string;
}

@Injectable({ providedIn: 'root' })
export class AdministradoresService {
  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Administrador[]> {
    return this.http.get<Administrador[]>(`${API_BASE_URL}/administradores`);
  }

  crear(datos: Partial<Administrador>): Observable<Administrador> {
    return this.http.post<Administrador>(`${API_BASE_URL}/administradores`, datos);
  }

  editar(id: string, datos: Partial<Administrador>): Observable<Administrador> {
    return this.http.patch<Administrador>(`${API_BASE_URL}/administradores/${id}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/administradores/${id}`);
  }

  reporteOcupacion(id: string): Observable<string> {
    return this.http.get(`${API_BASE_URL}/administradores/${id}/reporte-ocupacion`, { responseType: 'text' });
  }
}
