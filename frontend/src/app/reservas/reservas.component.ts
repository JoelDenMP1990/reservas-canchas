import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reserva, ReservasService } from './reservas.service';
import { Cliente, ClientesService } from '../clientes/clientes.service';
import { Cancha, CanchasService } from '../canchas/canchas.service';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contenedor-principal">
      <div class="contenido-ancho">
        
        <!-- Tarjeta de Formulario -->
        <div class="tarjeta animate-fade-in">
          <h2>{{ editandoId ? 'Reprogramar reserva' : 'Nueva reserva' }}</h2>
          <form (ngSubmit)="guardar()">
            <label *ngIf="!editandoId">
              Cliente
              <select name="clienteId" [(ngModel)]="formulario.clienteId" required>
                <option value="" disabled selected>Seleccione un cliente...</option>
                <option *ngFor="let c of clientes" [value]="c.id">{{ c.nombre }}</option>
              </select>
            </label>
            <label *ngIf="!editandoId">
              Cancha
              <select name="canchaId" [(ngModel)]="formulario.canchaId" required>
                <option value="" disabled selected>Seleccione una cancha...</option>
                <option *ngFor="let c of canchas" [value]="c.id">{{ c.nombre }} — &#36;{{ c.tarifaBasePorHora }}/h</option>
              </select>
            </label>
            <label>Hora inicio <input name="horaInicio" type="datetime-local" [(ngModel)]="formulario.horaInicio" required /></label>
            <label>Hora fin <input name="horaFin" type="datetime-local" [(ngModel)]="formulario.horaFin" required /></label>
            
            <div style="grid-column: 1 / -1; display: flex; gap: 0.5rem; margin-top: 0.5rem;">
              <button type="submit">{{ editandoId ? 'Guardar cambios' : 'Crear reserva' }}</button>
              <button type="button" *ngIf="editandoId" class="btn-cancelar" (click)="cancelarEdicion()">Cancelar edición</button>
            </div>
          </form>
          <p *ngIf="mensaje" [class]="mensajeTipo" style="margin-top: 1rem;">{{ mensaje }}</p>
        </div>

        <!-- Tarjeta de Listado -->
        <div class="tarjeta animate-fade-in">
          <h2>Lista de reservas</h2>
          <ul>
            <li *ngFor="let r of reservas">
              <div>
                <strong>{{ r.cancha?.nombre || 'Cancha' }}</strong> — {{ r.cliente?.nombre || 'Cliente' }} (&#36;{{ r.monto }})
                <br />
                <small>{{ r.horaInicio | date: 'short' }} a {{ r.horaFin | date: 'short' }}</small>
                <br />
                <span class="etiqueta-estado" [style.color]="r.estado === 'PENDIENTE' ? '#d97706' : r.estado === 'CONFIRMADA' ? '#1b4332' : '#dc2626'">
                  Estado: {{ r.estado }}
                </span>
              </div>
              <div class="acciones">
                <button type="button" class="btn-sm" *ngIf="r.estado === 'PENDIENTE'" (click)="editar(r)">Reprogramar</button>
                <button type="button" class="btn-sm btn-confirmar" *ngIf="r.estado === 'PENDIENTE'" (click)="confirmar(r.id)">Confirmar</button>
                <button type="button" class="btn-sm btn-cancelar" *ngIf="r.estado !== 'CANCELADA'" (click)="cancelar(r.id)">Cancelar</button>
                <button type="button" class="btn-sm btn-borrar" (click)="eliminar(r.id)">Borrar</button>
              </div>
            </li>
            <li *ngIf="reservas.length === 0" style="text-align: center; color: #334155; border-left: none; padding: 1.5rem; background: transparent;">
              Sin reservas todavía.
            </li>
          </ul>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .tarjeta {
      background: rgba(255, 255, 255, 0.78);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 12px;
      padding: 1.8rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }

    h2 {
      margin-top: 0;
      color: #1b4332;
      font-size: 1.4rem;
      border-bottom: 2px solid rgba(27, 67, 50, 0.15);
      padding-bottom: 0.5rem;
    }

    form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.2rem;
      margin-top: 1rem;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      font-weight: 600;
      font-size: 0.88rem;
      color: #0f172a;
    }

    input, select {
      width: 100%;
      padding: 0.65rem 0.8rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.95rem;
      background-color: rgba(255, 255, 255, 0.85);
      box-sizing: border-box;
      transition: all 0.2s ease;
      color: #0f172a;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #2d6a4f;
      background-color: #ffffff;
      box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.2);
    }

    button {
      background-color: #2d6a4f;
      color: white;
      border: none;
      padding: 0.65rem 1.2rem;
      font-size: 0.9rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    button:hover {
      background-color: #1b4332;
    }

    ul {
      list-style: none;
      padding: 0;
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    li {
      background: rgba(255, 255, 255, 0.65);
      border-left: 4px solid #2d6a4f;
      padding: 1rem;
      border-radius: 0 8px 8px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.6);
      color: #0f172a;
    }

    li strong {
      color: #0f172a;
    }

    li small {
      color: #334155;
      font-weight: 500;
    }

    .acciones {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .btn-sm {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
    }

    .btn-confirmar {
      background-color: #0284c7;
    }
    .btn-confirmar:hover {
      background-color: #0369a1;
    }

    .btn-cancelar {
      background-color: #d97706;
    }
    .btn-cancelar:hover {
      background-color: #b45309;
    }

    .btn-borrar {
      background-color: #dc2626;
    }
    .btn-borrar:hover {
      background-color: #b91c1c;
    }

    .etiqueta-estado {
      font-size: 0.8rem;
      font-weight: 700;
    }

    .mensaje-exito {
      background-color: rgba(209, 250, 229, 0.9);
      color: #065f46;
      padding: 0.8rem;
      border-radius: 6px;
      font-weight: 500;
      border: 1px solid #bbf7d0;
    }
    .mensaje-error {
      background-color: rgba(254, 226, 226, 0.9);
      color: #991b1b;
      padding: 0.8rem;
      border-radius: 6px;
      font-weight: 500;
      border: 1px solid #fecaca;
    }
  `]
})
export class ReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  clientes: Cliente[] = [];
  canchas: Cancha[] = [];
  formulario = {
    clienteId: '',
    canchaId: '',
    horaInicio: '',
    horaFin: '',
  };
  editandoId: string | null = null;
  mensaje = '';
  mensajeTipo = '';

  constructor(
    private readonly reservasService: ReservasService,
    private readonly clientesService: ClientesService,
    private readonly canchasService: CanchasService,
  ) {}

  ngOnInit(): void {
    this.refrescar();
    this.clientesService.listar().subscribe((clientes) => (this.clientes = clientes));
    this.canchasService.listar().subscribe((canchas) => (this.canchas = canchas));
  }

  refrescar(): void {
    this.reservasService.listar().subscribe((reservas) => (this.reservas = reservas));
  }

  guardar(): void {
    const { clienteId, canchaId, horaInicio, horaFin } = this.formulario;

    const operacion = this.editandoId
      ? this.reservasService.editar(this.editandoId, { horaInicio, horaFin })
      : this.reservasService.crear({ clienteId, canchaId, horaInicio, horaFin });

    operacion.subscribe({
      next: () => {
        this.mensaje = this.editandoId ? 'Reserva reprogramada.' : 'Reserva creada.';
        this.mensajeTipo = 'mensaje-exito';
        this.cancelarEdicion();
        this.refrescar();
      },
      error: (err: any) => {
        this.mensaje = err.error?.message ?? 'No se pudo guardar la reserva.';
        this.mensajeTipo = 'mensaje-error';
      },
    });
  }

  editar(reserva: any): void {
    this.editandoId = reserva.id;
    this.formulario = {
      clienteId: reserva.cliente?.id ?? reserva.clienteId ?? '',
      canchaId: reserva.cancha?.id ?? reserva.canchaId ?? '',
      horaInicio: reserva.horaInicio ? reserva.horaInicio.slice(0, 16) : '',
      horaFin: reserva.horaFin ? reserva.horaFin.slice(0, 16) : '',
    };
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.formulario = { clienteId: '', canchaId: '', horaInicio: '', horaFin: '' };
  }

  confirmar(id: string): void {
    this.reservasService.confirmar(id).subscribe(() => this.refrescar());
  }

  cancelar(id: string): void {
    this.reservasService.cancelar(id).subscribe(() => this.refrescar());
  }

  eliminar(id: string): void {
    if (confirm('¿Está seguro de eliminar esta reserva?')) {
      this.reservasService.eliminar(id).subscribe(() => this.refrescar());
    }
  }
}