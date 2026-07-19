import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base';

export interface Pago {
  id: string;
  monto: number;
  metodoPago: string;
  procesadoEn: string;
  reserva?: { id: string; estado: string };
}

@Injectable({ providedIn: 'root' })
export class PagosService {
  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${API_BASE_URL}/pagos`);
  }

  crear(datos: { reservaId: string; monto: number; metodoPago: string }): Observable<Pago> {
    return this.http.post<Pago>(`${API_BASE_URL}/pagos`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/pagos/${id}`);
  }
}
