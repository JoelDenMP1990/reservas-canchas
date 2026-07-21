import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base';

export interface Notificacion {
  id: string;
  tipo: string;
  mensaje: string;
  enviadaEn: string;
  reserva?: { id: string };
}

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${API_BASE_URL}/notificaciones`);
  }

  crear(datos: { reservaId: string; tipo: string; mensaje: string }): Observable<Notificacion> {
    return this.http.post<Notificacion>(`${API_BASE_URL}/notificaciones`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/notificaciones/${id}`);
  }
}
