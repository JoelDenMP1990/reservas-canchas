import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pago, PagosService } from './pagos.service';
import { Reserva, ReservasService } from '../reservas/reservas.service';

// Pantalla CRUD de Pago: listar, registrar, procesar, confirmar y borrar.
@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule],

  template: `
    <div class="tarjeta">
      <h2>💳 Gestión de Pagos</h2>
      <p>Registra los pagos y consulta los pagos realizados.</p>

      <form (ngSubmit)="guardar()">
        <div class="campo">
          <label for="reservaId">Reserva</label>

          <select
            id="reservaId"
            name="reservaId"
            [(ngModel)]="formulario.reservaId"
            required
          >
            <option value="" disabled>Seleccione una reserva</option>

            <option
              *ngFor="let r of reservasPendientes"
              [value]="r.id"
            >
              {{ r.cliente?.nombre }} —
              {{ r.cancha?.nombre }} —
              &#36;{{ r.monto }}
            </option>
          </select>
        </div>

        <div class="campo">
          <label for="monto">Monto ($)</label>

          <input
            id="monto"
            name="monto"
            type="number"
            min="0"
            [(ngModel)]="formulario.monto"
            required
          />
        </div>

        <div class="campo">
          <label for="metodoPago">Método de pago</label>

          <select
            id="metodoPago"
            name="metodoPago"
            [(ngModel)]="formulario.metodoPago"
            required
          >
            <option value="" disabled>Seleccione un método</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </div>

        <button class="btn-guardar" type="submit">
          💳 Procesar pago
        </button>
      </form>

      <p
        *ngIf="mensaje"
        class="mensaje"
        [class]="mensajeTipo"
      >
        {{ mensaje }}
      </p>
    </div>

    <div class="tarjeta">
      <h2>📋 Historial de Pagos</h2>

      <ul>
        <li *ngFor="let p of pagos">
          <div class="detalle-pago">
            <span>
              &#36;{{ p.monto }} —
              {{ p.metodoPago }} —
              {{ p.procesadoEn | date:'short' }}
            </span>

            <button
              class="btn-borrar"
              type="button"
              (click)="eliminar(p.id)"
            >
              Borrar
            </button>
          </div>
        </li>

        <li *ngIf="pagos.length === 0">
          Sin pagos todavía.
        </li>
      </ul>
    </div>
  `,

  styles: [`
    .tarjeta {
      max-width: 700px;
      margin: 20px auto;
      padding: 20px;
      border-radius: 12px;
      background: #ffffff;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }

    .campo {
      margin-bottom: 15px;
    }

    .campo label {
      display: block;
      margin-bottom: 6px;
      font-weight: bold;
    }

    input,
    select {
      width: 100%;
      box-sizing: border-box;
      padding: 10px;
      border: 1px solid #cccccc;
      border-radius: 8px;
    }

    .btn-guardar {
      padding: 10px 18px;
      border: none;
      border-radius: 8px;
      background: #0d6efd;
      color: white;
      cursor: pointer;
    }

    .btn-guardar:hover {
      background: #0b5ed7;
    }

    .btn-borrar {
      padding: 7px 12px;
      border: none;
      border-radius: 6px;
      background: #dc3545;
      color: white;
      cursor: pointer;
    }

    .btn-borrar:hover {
      background: #bb2d3b;
    }

    .mensaje {
      margin-top: 15px;
      padding: 10px;
      border-radius: 8px;
    }

    .exito {
      background: #d1e7dd;
      color: #0f5132;
    }

    .error {
      background: #f8d7da;
      color: #842029;
    }

    ul {
      padding: 0;
      list-style: none;
    }

    li {
      margin: 8px 0;
      padding: 10px;
      border-radius: 8px;
      background: #f8f9fa;
    }

    .detalle-pago {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
  `],
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

    this.reservasService.listar().subscribe((reservas) => {
      this.reservasPendientes = reservas.filter(
        (reserva) => reserva.estado === 'PENDIENTE',
      );
    });
  }

  refrescar(): void {
    this.pagosService.listar().subscribe((pagos) => {
      this.pagos = pagos;
    });
  }

  guardar(): void {
    this.pagosService.crear(this.formulario).subscribe({
      next: () => {
        this.mensaje = 'Pago procesado y reserva confirmada.';
        this.mensajeTipo = 'mensaje exito';

        this.formulario = {
          reservaId: '',
          monto: 0,
          metodoPago: '',
        };

        this.refrescar();
      },

      error: (error) => {
        this.mensaje =
          error.error?.message ?? 'No se pudo registrar el pago.';
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
        this.mensaje =
          error.error?.message ?? 'No se pudo eliminar el pago.';
        this.mensajeTipo = 'mensaje error';
      },
    });
  }
}