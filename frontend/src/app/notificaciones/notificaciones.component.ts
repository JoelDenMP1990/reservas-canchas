import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Notificacion, NotificacionesService } from './notificaciones.service';
import { Reserva, ReservasService } from '../reservas/reservas.service';

// Tipos de notificación disponibles: ícono y clase de color para la insignia.
const TIPOS: Record<string, { etiqueta: string; icono: string }> = {
  CONFIRMACION: { etiqueta: 'Confirmación', icono: '✅' },
  CANCELACION: { etiqueta: 'Cancelación', icono: '❌' },
  RECORDATORIO: { etiqueta: 'Recordatorio', icono: '⏰' },
  PAGO: { etiqueta: 'Pago', icono: '💳' },
};

// Pantalla CRUD de Notificacion: enviar un aviso ligado a una reserva y ver el historial.
@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tarjeta">
      <h2>Enviar notificación</h2>
      <form (ngSubmit)="guardar()">
        <label>
          Reserva
          <select name="reservaId" [(ngModel)]="formulario.reservaId" required>
            <option *ngFor="let r of reservas" [value]="r.id">
              {{ r.cliente?.nombre }} — {{ r.cancha?.nombre }} — {{ r.estado }}
            </option>
          </select>
        </label>
        <label>
          Tipo
          <select name="tipo" [(ngModel)]="formulario.tipo" required>
            <option *ngFor="let clave of tiposDisponibles" [value]="clave">
              {{ tipos[clave].icono }} {{ tipos[clave].etiqueta }}
            </option>
          </select>
        </label>
        <label>Mensaje <input name="mensaje" [(ngModel)]="formulario.mensaje" required /></label>
        <button type="submit">Enviar</button>
      </form>
      <p class="mensaje" [class]="mensajeTipo">{{ mensaje }}</p>
    </div>

    <div class="tarjeta">
      <h2>Historial de notificaciones</h2>
      <ul class="linea-tiempo">
        <li *ngFor="let n of notificaciones">
          <span class="insignia" [class]="'insignia-' + n.tipo.toLowerCase()">
            {{ icono(n.tipo) }} {{ etiqueta(n.tipo) }}
          </span>
          <p class="mensaje-texto">{{ n.mensaje }}</p>
          <small>{{ reservaLabel(n.reserva?.id) }} · {{ n.enviadaEn | date: 'short' }}</small>
          <button type="button" (click)="eliminar(n.id)">Borrar</button>
        </li>
        <li *ngIf="notificaciones.length === 0">Sin notificaciones todavía.</li>
      </ul>
    </div>
  `,
})
export class NotificacionesComponent implements OnInit {
  notificaciones: Notificacion[] = [];
  reservas: Reserva[] = [];
  tipos = TIPOS;
  tiposDisponibles = Object.keys(TIPOS);
  formulario: { reservaId: string; tipo: string; mensaje: string } = {
    reservaId: '',
    tipo: 'CONFIRMACION',
    mensaje: '',
  };
  mensaje = '';
  mensajeTipo = '';

  constructor(
    private readonly notificacionesService: NotificacionesService,
    private readonly reservasService: ReservasService,
  ) {}

  ngOnInit(): void {
    this.refrescar();
    this.reservasService.listar().subscribe((reservas) => (this.reservas = reservas));
  }

  refrescar(): void {
    this.notificacionesService.listar().subscribe((notificaciones) => (this.notificaciones = notificaciones));
  }

  reservaLabel(reservaId?: string): string {
    const reserva = this.reservas.find((r) => r.id === reservaId);
    return reserva ? `${reserva.cliente?.nombre} — ${reserva.cancha?.nombre}` : 'Reserva';
  }

  icono(tipo: string): string {
    const info: { etiqueta: string; icono: string } | undefined = TIPOS[tipo];
    return info?.icono ?? '🔔';
  }

  etiqueta(tipo: string): string {
    const info: { etiqueta: string; icono: string } | undefined = TIPOS[tipo];
    return info?.etiqueta ?? tipo;
  }

  guardar(): void {
    this.notificacionesService.crear(this.formulario).subscribe({
      next: () => {
        this.mensaje = 'Notificación enviada.';
        this.mensajeTipo = 'mensaje exito';
        this.formulario = { reservaId: '', tipo: 'CONFIRMACION', mensaje: '' };
        this.refrescar();
      },
      error: (error) => {
        this.mensaje = error.error?.message ?? 'No se pudo enviar la notificación.';
        this.mensajeTipo = 'mensaje error';
      },
    });
  }

  eliminar(id: string): void {
    this.notificacionesService.eliminar(id).subscribe(() => this.refrescar());
  }
}
