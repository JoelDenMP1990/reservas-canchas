import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base';

export interface Reserva {
  id: string;
  estado: string;
  horaInicio: string;
  horaFin: string;
  creadaEn: string;
  monto: number;
  cliente?: { id: string; nombre: string };
  cancha?: { id: string; nombre: string };
  pago?: { id: string; metodoPago: string };
}

@Injectable({ providedIn: 'root' })
export class ReservasService {
  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${API_BASE_URL}/reservas`);
  }

  crear(datos: {
    clienteId: string;
    canchaId: string;
    horaInicio: string;
    horaFin: string;
    metodoPago?: string;
  }): Observable<Reserva> {
    return this.http.post<Reserva>(`${API_BASE_URL}/reservas`, datos);
  }

  confirmar(id: string): Observable<Reserva> {
    return this.http.post<Reserva>(`${API_BASE_URL}/reservas/${id}/confirmar`, {});
  }

  cancelar(id: string): Observable<Reserva> {
    return this.http.post<Reserva>(`${API_BASE_URL}/reservas/${id}/cancelar`, {});
  }
}
