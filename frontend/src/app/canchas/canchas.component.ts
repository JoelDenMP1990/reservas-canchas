import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cancha, CanchasService } from './canchas.service';
import { Administrador, AdministradoresService } from '../administradores/administradores.service';

// Pantalla CRUD de Cancha: listar, crear, editar, borrar.
@Component({
  selector: 'app-canchas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tarjeta">
      <h2>{{ editandoId ? 'Editar cancha' : 'Nueva cancha' }}</h2>
      <form (ngSubmit)="guardar()">
        <label>Nombre <input name="nombre" [(ngModel)]="formulario.nombre" required /></label>
        <label>Tipo <input name="tipo" [(ngModel)]="formulario.tipo" required /></label>
        <label
          >Tarifa base ($/hora)
          <input name="tarifaBasePorHora" type="number" min="0" [(ngModel)]="formulario.tarifaBasePorHora" required
        /></label>
        <label>Hora apertura <input name="horaAperturaDesde" type="time" [(ngModel)]="formulario.horaAperturaDesde" required /></label>
        <label>Hora cierre <input name="horaCierreHasta" type="time" [(ngModel)]="formulario.horaCierreHasta" required /></label>
        <label>
          <input name="activa" type="checkbox" [(ngModel)]="formulario.activa" /> Activa
        </label>
        <label *ngIf="!editandoId">
          Administrador
          <select name="administradorId" [(ngModel)]="formulario.administradorId" required>
            <option *ngFor="let a of administradores" [value]="a.id">{{ a.nombre }}</option>
          </select>
        </label>
        <button type="submit">{{ editandoId ? 'Guardar cambios' : 'Registrar cancha' }}</button>
        <button type="button" *ngIf="editandoId" (click)="cancelarEdicion()">Cancelar</button>
      </form>
      <p class="mensaje" [class]="mensajeTipo">{{ mensaje }}</p>
    </div>

    <div class="tarjeta">
      <h2>Canchas registradas</h2>
      <ul>
        <li *ngFor="let c of canchas">
          <strong>{{ c.nombre }}</strong> ({{ c.tipo }}) — &#36;{{ c.tarifaBasePorHora }}/h —
          {{ c.activa ? 'activa' : 'inactiva' }} — administrador: {{ c.administrador?.nombre }}
          <button type="button" (click)="editar(c)">Editar</button>
          <button type="button" (click)="eliminar(c.id)">Borrar</button>
        </li>
      </ul>
    </div>
  `,
})
export class CanchasComponent implements OnInit {
  canchas: Cancha[] = [];
  administradores: Administrador[] = [];
  formulario: Partial<Cancha> = {
    nombre: '',
    tipo: '',
    tarifaBasePorHora: 20,
    activa: true,
    horaAperturaDesde: '08:00',
    horaCierreHasta: '22:00',
    administradorId: '',
  };
  editandoId: string | null = null;
  mensaje = '';
  mensajeTipo = '';

  constructor(
    private readonly canchasService: CanchasService,
    private readonly administradoresService: AdministradoresService,
  ) {}

  ngOnInit(): void {
    this.refrescar();
    this.administradoresService.listar().subscribe((administradores) => (this.administradores = administradores));
  }

  refrescar(): void {
    this.canchasService.listar().subscribe((canchas) => (this.canchas = canchas));
  }

  guardar(): void {
    const operacion = this.editandoId
      ? this.canchasService.editar(this.editandoId, this.formulario)
      : this.canchasService.crear(this.formulario);

    operacion.subscribe({
      next: () => {
        this.mensaje = this.editandoId ? 'Cancha actualizada.' : 'Cancha registrada.';
        this.mensajeTipo = 'mensaje exito';
        this.cancelarEdicion();
        this.refrescar();
      },
      error: (error) => {
        this.mensaje = error.error?.message ?? 'No se pudo guardar la cancha.';
        this.mensajeTipo = 'mensaje error';
      },
    });
  }

  editar(cancha: Cancha): void {
    this.editandoId = cancha.id;
    this.formulario = {
      nombre: cancha.nombre,
      tipo: cancha.tipo,
      tarifaBasePorHora: cancha.tarifaBasePorHora,
      activa: cancha.activa,
      horaAperturaDesde: cancha.horaAperturaDesde,
      horaCierreHasta: cancha.horaCierreHasta,
    };
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.formulario = {
      nombre: '',
      tipo: '',
      tarifaBasePorHora: 20,
      activa: true,
      horaAperturaDesde: '08:00',
      horaCierreHasta: '22:00',
      administradorId: '',
    };
  }

  eliminar(id: string): void {
    this.canchasService.eliminar(id).subscribe(() => this.refrescar());
  }
}
