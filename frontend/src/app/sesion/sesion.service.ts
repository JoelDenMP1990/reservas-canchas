import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Rol = 'ADMINISTRADOR' | 'CLIENTE';

export interface Sesion {
  rol: Rol;
  clienteId?: string;
  clienteNombre?: string;
}

// SesionService: el sistema no tiene login real (es un proyecto de prueba académico).
// Guarda solo qué rol eligió el usuario al entrar y, si es Cliente, quién dijo ser.
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly sesionSubject = new BehaviorSubject<Sesion | null>(null);
  readonly sesion$ = this.sesionSubject.asObservable();

  obtener(): Sesion | null {
    return this.sesionSubject.value;
  }

  entrarComoAdministrador(): void {
    this.sesionSubject.next({ rol: 'ADMINISTRADOR' });
  }

  entrarComoCliente(clienteId: string, clienteNombre: string): void {
    this.sesionSubject.next({ rol: 'CLIENTE', clienteId, clienteNombre });
  }

  salir(): void {
    this.sesionSubject.next(null);
  }
}
