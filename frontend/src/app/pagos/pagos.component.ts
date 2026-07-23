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
  <div class="contenedor-principal">
    <div class="contenido-ancho">
      <div class="tarjeta animate-fade-in">
        <h2>💳 Gestión de Pagos</h2>
        <p>Registra los pagos y consulta los pagos realizados.</p>

        <form (ngSubmit)="guardar()">

          <label>
            Reserva
            <select name="reservaId" [(ngModel)]="formulario.reservaId" required>
              <option *ngFor="let r of reservasPendientes" [value]="r.id">
                {{ r.cliente?.nombre }} — {{ r.cancha?.nombre }} — &#36;{{ r.monto }}
              </option>
            </select>
          </label>

          <div class="campo">
            <label>Monto ($)</label>
            <input
              name="monto"
              type="number"
              min="0"
              [(ngModel)]="formulario.monto"
              required
            />
          </div>

          <div class="campo">
            <label>Método de pago</label>
            <select name="metodoPago" [(ngModel)]="formulario.metodoPago" required>
              <option value="" disabled>Seleccione un método</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>

          <button class="btn-guardar" type="submit">
            💳 Procesar Pago
          </button>

        </form>

        <p class="mensaje" [class]="mensajeTipo">
          {{ mensaje }}
        </p>
      </div>

      <div class="tarjeta animate-fade-in">
        <h2>📋 Historial de Pagos</h2>

        <ul>
          <li *ngFor="let p of pagos">
            &#36;{{ p.monto }} —
            {{ p.metodoPago }} —
            {{ p.procesadoEn | date:'short' }}

            <button type="button" (click)="eliminar(p.id)">
              Borrar
            </button>
          </li>

          <li *ngIf="pagos.length === 0">
            Sin pagos todavía.
          </li>
        </ul>
      </div>
    </div>
  </div>
`,

  styles: [`
    .campo{
      margin-bottom:15px;
    }

    .campo label{
      display:block;
      font-weight:bold;
      margin-bottom:6px;
    }

    input,select{
      width:100%;
      padding:10px;
      border:1px solid #ccc;
      border-radius:8px;
      box-sizing:border-box;
    }

    .btn-guardar{
      background:#0d6efd;
      color:white;
      border:none;
      padding:10px 18px;
      border-radius:8px;
      cursor:pointer;
    }

    ul{
      list-style:none;
      padding:0;
    }

    li{
      background:rgba(248, 249, 250, 0.9);
      margin:8px 0;
      padding:10px;
      border-radius:8px;
    }
  `]
})
export class PagosComponent implements OnInit {
  pagos: Pago[] = [];
  reservasPendientes: Reserva[] = [];
  formulario: {
    reservaId: string;
    monto: number;
    metodoPago: '' | 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  } = {
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
    this.pagosService.eliminar(id).subscribe({
      next: () => {
        this.mensaje = 'Pago eliminado correctamente.';
        this.mensajeTipo = 'mensaje exito';
        this.refrescar();
      },
      error: (error) => {
        this.mensaje = error.error?.message ?? 'No se pudo eliminar el pago.';
        this.mensajeTipo = 'mensaje error';
      },
    });
  }
}