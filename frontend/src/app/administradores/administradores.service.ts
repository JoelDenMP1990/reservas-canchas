import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base';

export interface Administrador {
  id: string;
  nombre: string;
  areaAsignada: string;
}

export interface FranjaHoraria {
  inicio: string;
  fin: string;
  ocupada: boolean;
}

export interface Cancha {
  id: string;
  nombre: string;
  tipo: string;
  tarifaBasePorHora: number;
  activa: boolean;
  horaAperturaDesde: string;
  horaCierreHasta: string;
  horarios: FranjaHoraria[];
  administrador?: {
    id: string;
    nombre: string;
  };
}

export interface DetalleOcupacion {
  cancha: string;
  estado: string;
  cliente?: string;
  horaInicio?: string;
  horaFin?: string;
}

export interface ReporteOcupacion {
  administrador: Administrador;
  resumen: {
    canchasRegistradas: number;
    canchasActivas: number;
  };
  ocupacion: DetalleOcupacion[];
}

@Injectable({
  providedIn: 'root',
})
export class AdministradoresService {
  constructor(private readonly http: HttpClient) {}

  // =========================
  // ADMINISTRADORES
  // =========================

  listar(): Observable<Administrador[]> {
    return this.http.get<Administrador[]>(
      `${API_BASE_URL}/administradores`,
    );
  }

  crear(
    datos: Partial<Administrador>,
  ): Observable<Administrador> {
    return this.http.post<Administrador>(
      `${API_BASE_URL}/administradores`,
      datos,
    );
  }

  editar(
    id: string,
    datos: Partial<Administrador>,
  ): Observable<Administrador> {
    return this.http.patch<Administrador>(
      `${API_BASE_URL}/administradores/${id}`,
      datos,
    );
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(
      `${API_BASE_URL}/administradores/${id}`,
    );
  }

  // =========================
  // REPORTES
  // =========================

  reporteOcupacion(id: string): Observable<ReporteOcupacion> {
    return this.http.get<ReporteOcupacion>(
      `${API_BASE_URL}/administradores/${id}/reporte-ocupacion`,
    );
  }

  // =========================
  // CANCHAS DEL ADMINISTRADOR
  // =========================

  listarCanchas(
    administradorId: string,
  ): Observable<Cancha[]> {
    return this.http.get<Cancha[]>(
      `${API_BASE_URL}/administradores/${administradorId}/canchas`,
    );
  }

  registrarCancha(
    administradorId: string,
    datos: Partial<Cancha>,
  ): Observable<Cancha> {
    return this.http.post<Cancha>(
      `${API_BASE_URL}/administradores/${administradorId}/canchas`,
      datos,
    );
  }

  editarCancha(
    canchaId: string,
    datos: Partial<Cancha>,
  ): Observable<Cancha> {
    return this.http.patch<Cancha>(
      `${API_BASE_URL}/canchas/${canchaId}`,
      datos,
    );
  }

  eliminarCancha(
    administradorId: string,
    canchaId: string,
  ): Observable<void> {
    return this.http.delete<void>(
      `${API_BASE_URL}/administradores/${administradorId}/canchas/${canchaId}`,
    );
  }

  
}
