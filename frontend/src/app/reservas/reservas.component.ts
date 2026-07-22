import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reserva, ReservasService } from './reservas.service';
import { Cliente, ClientesService } from '../clientes/clientes.service';
import { Cancha, CanchasService } from '../canchas/canchas.service';

// Pantalla CRUD de Reserva: listar, crear, editar horario, confirmar, cancelar, borrar.
@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contenedor-principal">
      <div class="contenido-ancho">
        <div class="tarjeta animate-fade-in">
          <h2>{{ editandoId ? 'Reprogramar reserva' : 'Nueva reserva' }}</h2>
          <form (ngSubmit)="guardar()">
            <label *ngIf="!editandoId">
              Cliente
              <select name="clienteId" [(ngModel)]="formulario.clienteId" required>
                <option *ngFor="let c of clientes" [value]="c.id">{{ c.nombre }}</option>
              </select>
            </label>
            <label *ngIf="!editandoId">
              Cancha
              <select name="canchaId" [(ngModel)]="formulario.canchaId" required>
                <option *ngFor="let c of canchas" [value]="c.id">{{ c.nombre }} — &#36;{{ c.tarifaBasePorHora }}/h</option>
              </select>
            </label>
            <label>Hora inicio <input name="horaInicio" type="datetime-local" [(ngModel)]="formulario.horaInicio" required /></label>
            <label>Hora fin <input name="horaFin" type="datetime-local" [(ngModel)]="formulario.horaFin" required /></label>
            <button type="submit">{{ editandoId ? 'Guardar cambios' : 'Reservar' }}</button>
            <button type="button" *ngIf="editandoId" (click)="cancelarEdicion()">Cancelar edición</button>
          </form>
          <p class="mensaje" [class]="mensajeTipo">{{ mensaje }}</p>
        </div>

        <div class="tarjeta animate-fade-in">
          <h2>Reservas</h2>
          <ul>
            <li *ngFor="let r of reservas">
              {{ r.cliente?.nombre }} — {{ r.cancha?.nombre }} — {{ r.estado }} — &#36;{{ r.monto }}
              <div>{{ r.horaInicio | date: 'short' }} a {{ r.horaFin | date: 'short' }}</div>
              <button type="button" *ngIf="r.estado === 'PENDIENTE'" (click)="editar(r)">Reprogramar</button>
              <button type="button" *ngIf="r.estado === 'PENDIENTE'" (click)="confirmar(r.id)">Confirmar</button>
              <button type="button" *ngIf="r.estado !== 'CANCELADA'" (click)="cancelar(r.id)">Cancelar</button>
              <button type="button" (click)="eliminar(r.id)">Borrar</button>
            </li>
            <li *ngIf="reservas.length === 0">Sin reservas todavía.</li>
          </ul>
        </div>
      </div>
    </div>
  `,
})
export class ReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  clientes: Cliente[] = [];
  canchas: Cancha[] = [];
  formulario: { clienteId: string; canchaId: string; horaInicio: string; horaFin: string } = {
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
    const operacion = this.editandoId
      ? this.reservasService.editar(this.editandoId, {
          horaInicio: this.formulario.horaInicio,
          horaFin: this.formulario.horaFin,
        })
      : this.reservasService.crear(this.formulario);

    operacion.subscribe({
      next: () => {
        this.mensaje = this.editandoId ? 'Reserva reprogramada.' : 'Reserva creada.';
        this.mensajeTipo = 'mensaje exito';
        this.cancelarEdicion();
        this.refrescar();
      },
      error: (error) => {
        this.mensaje = error.error?.message ?? 'No se pudo guardar la reserva.';
        this.mensajeTipo = 'mensaje error';
      },
    });
  }

  editar(reserva: Reserva): void {
    this.editandoId = reserva.id;
    this.formulario = {
      clienteId: reserva.cliente?.id ?? '',
      canchaId: reserva.cancha?.id ?? '',
      horaInicio: reserva.horaInicio.slice(0, 16),
      horaFin: reserva.horaFin.slice(0, 16),
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
    this.reservasService.eliminar(id).subscribe(() => this.refrescar());
  }
}