import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notificacion, NotificacionesService } from './notificaciones.service';
import { Reserva, ReservasService } from '../reservas/reservas.service';

const TIPOS: Record<string, { etiqueta: string; icono: string }> = {
  CONFIRMACION: { etiqueta: 'Confirmación', icono: '✅' },
  CANCELACION: { etiqueta: 'Cancelación', icono: '❌' },
  RECORDATORIO: { etiqueta: 'Recordatorio', icono: '⏰' },
  PAGO: { etiqueta: 'Pago', icono: '💳' },
};

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tarjeta">
      <h2>🔔 Historial de Notificaciones</h2>
      <p>Consulta los avisos enviados automáticamente.</p>

      <ul class="linea-tiempo">
        <li *ngFor="let n of notificaciones">
          <span class="insignia">
            {{ icono(n.tipo) }} {{ etiqueta(n.tipo) }}
          </span>
          <p class="mensaje-texto">{{ n.mensaje }}</p>
          <small>{{ reservaLabel(n.reserva?.id) }} · {{ n.enviadaEn | date: 'short' }}</small>
        </li>
        <li *ngIf="notificaciones.length === 0">Sin notificaciones registradas todavía.</li>
      </ul>
    </div>
  `,
  styles: [`
    .tarjeta{
      max-width:700px;
      margin:20px auto;
      padding:20px;
      border-radius:12px;
      background:#ffffff;
      box-shadow:0 4px 10px rgba(0,0,0,.15);
    }
    .insignia { font-weight: bold; margin-right: 8px; }
    .mensaje-texto { margin: 6px 0; }
    ul { list-style: none; padding: 0; }
    li { background:#f8f9fa; margin:8px 0; padding:12px; border-radius:8px; }
  `]
})
export class NotificacionesComponent implements OnInit {
  notificaciones: Notificacion[] = [];
  reservas: Reserva[] = [];
  tipos = TIPOS;

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
    const info = TIPOS[tipo];
    return info?.icono ?? '🔔';
  }

  etiqueta(tipo: string): string {
    const info = TIPOS[tipo];
    return info?.etiqueta ?? tipo;
  }
}
