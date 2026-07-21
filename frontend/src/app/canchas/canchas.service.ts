import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base';

export interface Cancha {
  id: string;
  nombre: string;
  tipo: string;
  tarifaBasePorHora: number;
  activa: boolean;
  horaAperturaDesde: string;
  horaCierreHasta: string;
  administradorId?: string;
  administrador?: { id: string; nombre: string };
}

@Injectable({ providedIn: 'root' })
export class CanchasService {
  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(`${API_BASE_URL}/canchas`);
  }

  crear(datos: Partial<Cancha>): Observable<Cancha> {
    return this.http.post<Cancha>(`${API_BASE_URL}/canchas`, datos);
  }

  editar(id: string, datos: Partial<Cancha>): Observable<Cancha> {
    return this.http.patch<Cancha>(`${API_BASE_URL}/canchas/${id}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/canchas/${id}`);
  }
}
