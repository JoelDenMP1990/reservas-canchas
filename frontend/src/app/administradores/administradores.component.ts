import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Administrador, AdministradoresService } from './administradores.service';

// Pantalla CRUD de Administrador: listar, crear, editar, borrar.
@Component({
  selector: 'app-administradores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tarjeta">
      <h2>{{ editandoId ? 'Editar administrador' : 'Nuevo administrador' }}</h2>
      <form (ngSubmit)="guardar()">
        <label>Nombre <input name="nombre" [(ngModel)]="formulario.nombre" required /></label>
        <label>Área asignada <input name="areaAsignada" [(ngModel)]="formulario.areaAsignada" required /></label>
        <button type="submit">{{ editandoId ? 'Guardar cambios' : 'Registrar administrador' }}</button>
        <button type="button" *ngIf="editandoId" (click)="cancelarEdicion()">Cancelar</button>
      </form>
      <p class="mensaje" [class]="mensajeTipo">{{ mensaje }}</p>
    </div>

    <div class="tarjeta">
      <h2>Administradores registrados</h2>
      <ul>
        <li *ngFor="let a of administradores">
          <strong>{{ a.nombre }}</strong> — {{ a.areaAsignada }}
          <button type="button" (click)="editar(a)">Editar</button>
          <button type="button" (click)="verReporte(a)">Reporte de ocupación</button>
          <button type="button" (click)="eliminar(a.id)">Borrar</button>
          <div *ngIf="reportePorAdministrador[a.id]">
            <em>{{ reportePorAdministrador[a.id] }}</em>
          </div>
        </li>
      </ul>
    </div>
  `,
})
export class AdministradoresComponent implements OnInit {
  administradores: Administrador[] = [];
  formulario: Partial<Administrador> = { nombre: '', areaAsignada: '' };
  editandoId: string | null = null;
  mensaje = '';
  mensajeTipo = '';
  reportePorAdministrador: Record<string, string> = {};

  constructor(private readonly administradoresService: AdministradoresService) {}

  ngOnInit(): void {
    this.refrescar();
  }

  refrescar(): void {
    this.administradoresService.listar().subscribe((administradores) => (this.administradores = administradores));
  }

  guardar(): void {
    const operacion = this.editandoId
      ? this.administradoresService.editar(this.editandoId, this.formulario)
      : this.administradoresService.crear(this.formulario);

    operacion.subscribe({
      next: () => {
        this.mensaje = this.editandoId ? 'Administrador actualizado.' : 'Administrador registrado.';
        this.mensajeTipo = 'mensaje exito';
        this.cancelarEdicion();
        this.refrescar();
      },
      error: (error) => {
        this.mensaje = error.error?.message ?? 'No se pudo guardar el administrador.';
        this.mensajeTipo = 'mensaje error';
      },
    });
  }

  editar(administrador: Administrador): void {
    this.editandoId = administrador.id;
    this.formulario = { nombre: administrador.nombre, areaAsignada: administrador.areaAsignada };
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.formulario = { nombre: '', areaAsignada: '' };
  }

  eliminar(id: string): void {
    this.administradoresService.eliminar(id).subscribe(() => this.refrescar());
  }

  verReporte(administrador: Administrador): void {
    this.administradoresService.reporteOcupacion(administrador.id).subscribe((reporte) => {
      this.reportePorAdministrador[administrador.id] = reporte;
    });
  }
}
