import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pago, PagosService } from './pagos.service';
import { Reserva, ReservasService } from '../reservas/reservas.service';

// Pantalla CRUD de Pago: listar, registrar (procesa y confirma la reserva), borrar.
@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tarjeta">
      <h2>Registrar pago</h2>
      <form (ngSubmit)="guardar()">
        <label>
          Reserva
          <select name="reservaId" [(ngModel)]="formulario.reservaId" required>
            <option *ngFor="let r of reservasPendientes" [value]="r.id">
              {{ r.cliente?.nombre }} — {{ r.cancha?.nombre }} — &#36;{{ r.monto }}
            </option>
          </select>
        </label>
        <label>Monto <input name="monto" type="number" min="0" [(ngModel)]="formulario.monto" required /></label>
        <label>Método de pago <input name="metodoPago" [(ngModel)]="formulario.metodoPago" required /></label>
        <button type="submit">Procesar pago</button>
      </form>
      <p class="mensaje" [class]="mensajeTipo">{{ mensaje }}</p>
    </div>

    <div class="tarjeta">
      <h2>Pagos registrados</h2>
      <ul>
        <li *ngFor="let p of pagos">
          &#36;{{ p.monto }} — {{ p.metodoPago }} — {{ p.procesadoEn | date: 'short' }}
          <button type="button" (click)="eliminar(p.id)">Borrar</button>
        </li>
        <li *ngIf="pagos.length === 0">Sin pagos todavía.</li>
      </ul>
    </div>
  `,
})
export class PagosComponent implements OnInit {
  pagos: Pago[] = [];
  reservasPendientes: Reserva[] = [];
  formulario: { reservaId: string; monto: number; metodoPago: string } = {
    reservaId: '',
    monto: 0,
    metodoPago: '',
  };
  mensaje = '';
  mensajeTipo = '';

  constructor(
    private readonly pagosService: PagosService,
    private readonly reservasService: ReservasService,
  ) {}

  ngOnInit(): void {
    this.refrescar();
    this.reservasService
      .listar()
      .subscribe((reservas) => (this.reservasPendientes = reservas.filter((r) => r.estado === 'PENDIENTE')));
  }

  refrescar(): void {
    this.pagosService.listar().subscribe((pagos) => (this.pagos = pagos));
  }

  guardar(): void {
    this.pagosService.crear(this.formulario).subscribe({
      next: () => {
        this.mensaje = 'Pago procesado y reserva confirmada.';
        this.mensajeTipo = 'mensaje exito';
        this.formulario = { reservaId: '', monto: 0, metodoPago: '' };
        this.refrescar();
      },
      error: (error) => {
        this.mensaje = error.error?.message ?? 'No se pudo registrar el pago.';
        this.mensajeTipo = 'mensaje error';
      },
    });
  }

  eliminar(id: string): void {
    this.pagosService.eliminar(id).subscribe(() => this.refrescar());
  }
}
