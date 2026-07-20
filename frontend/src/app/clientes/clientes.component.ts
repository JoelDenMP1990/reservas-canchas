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
    <div class="tarjeta animate-fade-in">
      <h2>
        <i class="icono">👤</i> {{ editandoId ? 'Editar Cliente' : 'Nuevo Cliente' }}
      </h2>
      <form (ngSubmit)="guardar()">
        <div class="campo-grupo">
          <label>Nombre</label>
          <input name="nombre" [(ngModel)]="formulario.nombre" placeholder="Ej. Juan Pérez" required />
        </div>
        
        <div class="campo-grupo">
          <label>Email</label>
          <input name="email" type="email" [(ngModel)]="formulario.email" placeholder="juan@correo.com" required />
        </div>
        
        <div class="campo-grupo">
          <label>Teléfono</label>
          <input name="telefono" [(ngModel)]="formulario.telefono" placeholder="Ej. 0999999999" />
        </div>
        
        <div class="botones-container">
          <button type="submit" class="btn btn-guardar">
            {{ editandoId ? '💾 Guardar cambios' : '➕ Registrar cliente' }}
          </button>
          <button type="button" class="btn btn-cancelar" *ngIf="editandoId" (click)="cancelarEdicion()">
            ❌ Cancelar
          </button>
        </div>
      </form>
      
      <div *ngIf="mensaje" class="mensaje" [class]="mensajeTipo">
        {{ mensaje }}
      </div>
    </div>

    <div class="tarjeta animate-fade-in">
      <h2><i class="icono">📋</i> Clientes Registrados</h2>
      
      <div *ngIf="clientes.length === 0" class="sin-datos">
        No hay clientes registrados en la base de datos.
      </div>

      <ul class="lista-clientes">
        <li *ngFor="let c of clientes" class="item-cliente">
          <div class="info-cliente">
            <span class="nombre-cliente">{{ c.nombre }}</span>
            <span class="detalle-cliente">📧 {{ c.email }}</span>
            <span class="detalle-cliente">📞 {{ c.telefono || 'Sin teléfono' }}</span>
            
            <div *ngIf="reservasActivasPorCliente[c.id]" class="alerta-reservas">
              📅 Reservas activas: <strong>{{ reservasActivasPorCliente[c.id].length }}</strong>
            </div>
          </div>
          
          <div class="acciones-cliente">
            <button type="button" class="btn-accion btn-editar" title="Editar" (click)="editar(c)">✏️</button>
            <button type="button" class="btn-accion btn-info" title="Ver Reservas" (click)="verReservasActivas(c)">📅</button>
            <button type="button" class="btn-accion btn-borrar" title="Borrar" (click)="eliminar(c.id)">🗑️</button>
          </div>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .tarjeta {
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    
    h2 {
      color: #14452F;
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 1.5rem;
      border-bottom: 2px solid #edf2f7;
      padding-bottom: 10px;
    }

    .icono {
      margin-right: 8px;
    }

    .campo-grupo {
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
    }

    .campo-grupo label {
      font-weight: 600;
      margin-bottom: 6px;
      color: #4a5568;
      font-size: 0.9rem;
    }

    .campo-grupo input {
      padding: 10px 14px;
      border: 1.5px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: all 0.2s ease-in-out;
      outline: none;
    }

    .campo-grupo input:focus {
      border-color: #14452F;
      box-shadow: 0 0 0 3px rgba(20, 69, 47, 0.15);
    }

    .botones-container {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      font-size: 0.95rem;
      transition: background 0.2s;
    }

    .btn-guardar {
      background: #14452F;
      color: white;
    }

    .btn-guardar:hover {
      background: #0f3524;
    }

    .btn-cancelar {
      background: #edf2f7;
      color: #4a5568;
    }

    .btn-cancelar:hover {
      background: #e2e8f0;
    }

    .mensaje {
      margin-top: 15px;
      padding: 12px 16px;
      border-radius: 6px;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .mensaje.exito {
      background-color: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .mensaje.error {
      background-color: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .sin-datos {
      color: #718096;
      font-style: italic;
      text-align: center;
      padding: 15px;
    }

    .lista-clientes {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .item-cliente {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border-bottom: 1px solid #edf2f7;
      transition: background 0.2s;
    }

    .item-cliente:hover {
      background-color: #f8fafc;
    }

    .info-cliente {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .nombre-cliente {
      font-weight: 600;
      color: #2d3748;
      font-size: 1.05rem;
    }

    .detalle-cliente {
      color: #718096;
      font-size: 0.88rem;
    }

    .alerta-reservas {
      margin-top: 5px;
      font-size: 0.85rem;
      color: #2b6cb0;
      background: #ebf8ff;
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-block;
    }

    .acciones-cliente {
      display: flex;
      gap: 6px;
    }

    .btn-accion {
      background: #edf2f7;
      border: none;
      padding: 8px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.95rem;
      transition: transform 0.1s, background 0.2s;
    }

    .btn-accion:hover {
      transform: scale(1.08);
    }

    .btn-editar:hover { background: #fef3c7; }
    .btn-info:hover { background: #dbeafe; }
    .btn-borrar:hover { background: #fee2e2; }

    .animate-fade-in {
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
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
        this.mensaje = this.editandoId ? '¡Cliente actualizado con éxito!' : '¡Cliente registrado con éxito!';
        this.mensajeTipo = 'exito';
        this.cancelarEdicion();
        this.refrescar();
      },
      error: (error) => {
        let mensajeError = error.error?.message ?? 'No se pudo guardar el cliente.';
        
        if (Array.isArray(mensajeError)) {
          mensajeError = mensajeError.join(', ');
        }
        
        mensajeError = mensajeError
          .replace('nombre should not be empty', 'El nombre no puede estar vacío')
          .replace('email must be an email', 'El correo electrónico debe ser válido')
          .replace('Internal server error', 'Error del servidor. Asegúrate de ingresar un teléfono válido (solo números).');

        this.mensaje = mensajeError;
        this.mensajeTipo = 'error';
      },
    });
  }

  editar(cliente: Cliente): void {
    this.editandoId = cliente.id;
    this.formulario = { nombre: cliente.nombre, email: cliente.email, telefono: cliente.telefono };
    this.mensaje = ''; 
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.formulario = { nombre: '', email: '', telefono: '' };
  }

  eliminar(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.clientesService.eliminar(id).subscribe(() => {
        this.mensaje = 'Cliente eliminado correctamente.';
        this.mensajeTipo = 'exito';
        this.refrescar();
      });
    }
  }

  verReservasActivas(cliente: Cliente): void {
    this.clientesService.getReservasActivas(cliente.id).subscribe((reservas) => {
      this.reservasActivasPorCliente[cliente.id] = reservas;
    });
  }
}