import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base';

export interface ClienteReserva {
  id: string;
  nombre: string;
}

export interface CanchaReserva {
  id: string;
  nombre: string;
}

export interface PagoReserva {
  id: string;
  metodoPago: string;
}

export interface Reserva {
  id: string;
  estado: string;
  horaInicio: string;
  horaFin: string;
  creadaEn: string;
  monto: number;
  cliente?: ClienteReserva;
  cancha?: CanchaReserva;
  pago?: PagoReserva;
}

export interface CrearReservaDto {
  clienteId: string;
  canchaId: string;
  horaInicio: string;
  horaFin: string;
  metodoPago?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private readonly apiUrl = `${API_BASE_URL}/reservas`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl);
  }

  crear(datos: CrearReservaDto): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, datos);
  }

  confirmar(id: string): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiUrl}/${id}/confirmar`, {});
  }

  cancelar(id: string): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiUrl}/${id}/cancelar`, {});
  }
}
// Servicio actualizado para la gestión de reservas
