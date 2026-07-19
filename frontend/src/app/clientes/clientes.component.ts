import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente, ClientesService } from './clientes.service';

// Pantalla CRUD de Cliente: listar, crear, editar, borrar.
@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tarjeta">
      <h2>{{ editandoId ? 'Editar cliente' : 'Nuevo cliente' }}</h2>
      <form (ngSubmit)="guardar()">
        <label>Nombre <input name="nombre" [(ngModel)]="formulario.nombre" required /></label>
        <label>Email <input name="email" type="email" [(ngModel)]="formulario.email" required /></label>
        <label>Teléfono <input name="telefono" [(ngModel)]="formulario.telefono" /></label>
        <button type="submit">{{ editandoId ? 'Guardar cambios' : 'Registrar cliente' }}</button>
        <button type="button" *ngIf="editandoId" (click)="cancelarEdicion()">Cancelar</button>
      </form>
      <p class="mensaje" [class]="mensajeTipo">{{ mensaje }}</p>
    </div>

    <div class="tarjeta">
      <h2>Clientes registrados</h2>
      <ul>
        <li *ngFor="let c of clientes">
          <strong>{{ c.nombre }}</strong> — {{ c.email }} — {{ c.telefono || 'sin teléfono' }}
          <button type="button" (click)="editar(c)">Editar</button>
          <button type="button" (click)="verReservasActivas(c)">Reservas activas</button>
          <button type="button" (click)="eliminar(c.id)">Borrar</button>
          <div *ngIf="reservasActivasPorCliente[c.id]">
            <em>Reservas activas: {{ reservasActivasPorCliente[c.id].length }}</em>
          </div>
        </li>
      </ul>
    </div>
  `,
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  formulario: Partial<Cliente> = { nombre: '', email: '', telefono: '' };
  editandoId: string | null = null;
  mensaje = '';
  mensajeTipo = '';
  reservasActivasPorCliente: Record<string, any[]> = {};

  constructor(private readonly clientesService: ClientesService) {}

  ngOnInit(): void {
    this.refrescar();
  }

  refrescar(): void {
    this.clientesService.listar().subscribe((clientes) => (this.clientes = clientes));
  }

  guardar(): void {
    const operacion = this.editandoId
      ? this.clientesService.editar(this.editandoId, this.formulario)
      : this.clientesService.crear(this.formulario);

    operacion.subscribe({
      next: () => {
        this.mensaje = this.editandoId ? 'Cliente actualizado.' : 'Cliente registrado.';
        this.mensajeTipo = 'mensaje exito';
        this.cancelarEdicion();
        this.refrescar();
      },
      error: (error) => {
        this.mensaje = error.error?.message ?? 'No se pudo guardar el cliente.';
        this.mensajeTipo = 'mensaje error';
      },
    });
  }

  editar(cliente: Cliente): void {
    this.editandoId = cliente.id;
    this.formulario = { nombre: cliente.nombre, email: cliente.email, telefono: cliente.telefono };
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.formulario = { nombre: '', email: '', telefono: '' };
  }

  eliminar(id: string): void {
    this.clientesService.eliminar(id).subscribe(() => this.refrescar());
  }

  verReservasActivas(cliente: Cliente): void {
    this.clientesService.getReservasActivas(cliente.id).subscribe((reservas) => {
      this.reservasActivasPorCliente[cliente.id] = reservas;
    });
  }
}
