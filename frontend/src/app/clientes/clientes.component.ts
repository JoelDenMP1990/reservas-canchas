import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { Cliente, ClientesService } from './clientes.service';

// Pantalla CRUD de Cliente: listar, crear, editar, borrar.
@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contenedor-principal">
      <div class="contenido-ancho">
        <div class="tarjeta animate-fade-in">
          <h2>
            <i class="icono">👤</i> {{ editandoId ? 'Editar Cliente' : 'Nuevo Cliente' }}
          </h2>
          
          <form (ngSubmit)="guardar()" class="formulario-grid">
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
                <div class="detalles-fila">
                  <span class="detalle-cliente">📧 {{ c.email }}</span>
                  <span class="detalle-cliente">📞 {{ c.telefono || 'Sin teléfono' }}</span>
                </div>
                
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
      </div>
    </div>
  `,
  styles: [`
    /* Fondo de césped con velo oscuro más ligero para apreciar mejor la cancha */
    .contenedor-principal {
      width: 100vw;
      min-height: calc(100vh - 70px);
      margin-left: calc(-50vw + 50%);
      padding: 40px 20px;
      background: linear-gradient(rgba(10, 35, 18, 0.55), rgba(10, 35, 18, 0.55)), 
                  url('https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=2000&q=80') no-repeat center center fixed;
      background-size: cover;
      box-sizing: border-box;
      position: relative;
    }

    .contenido-ancho {
      max-width: 1100px;
      margin: 0 auto;
    }

    /* Tarjetas semitransparentes (efecto cristal) */
    .tarjeta {
      background: rgba(255, 255, 255, 0.90);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.4);
    }
    
    h2 {
      color: #064e3b;
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 1.25rem;
      font-weight: 600;
      border-bottom: 2px solid rgba(0, 0, 0, 0.06);
      padding-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .icono {
      font-style: normal;
    }

    /* Formulario organizado en 3 columnas exactas de lado a lado */
    .formulario-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .campo-grupo {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .campo-grupo label {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.875rem;
    }

    .campo-grupo input {
      width: 100%;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: all 0.2s ease-in-out;
      outline: none;
      box-sizing: border-box;
    }

    .campo-grupo input:focus {
      border-color: #10b981;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
    }

    .botones-container {
      grid-column: 1 / -1;
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      font-size: 0.92rem;
      transition: all 0.2s ease-in-out;
    }

    .btn-guardar {
      background: #064e3b;
      color: white;
    }

    .btn-guardar:hover {
      background: #047857;
      transform: translateY(-1px);
    }

    .btn-cancelar {
      background: rgba(241, 245, 249, 0.9);
      color: #475569;
    }

    .btn-cancelar:hover {
      background: #e2e8f0;
    }

    .mensaje {
      grid-column: 1 / -1;
      margin-top: 15px;
      padding: 12px 16px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .mensaje.exito {
      background-color: rgba(240, 253, 244, 0.95);
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .mensaje.error {
      background-color: rgba(254, 242, 242, 0.95);
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .sin-datos {
      color: #475569;
      font-style: italic;
      text-align: center;
      padding: 20px;
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
      padding: 16px 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      transition: background-color 0.15s;
    }

    .item-cliente:hover {
      background-color: rgba(255, 255, 255, 0.6);
      border-radius: 8px;
    }

    .info-cliente {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nombre-cliente {
      font-weight: 600;
      color: #0f172a;
      font-size: 1rem;
      text-transform: capitalize;
    }

    .detalles-fila {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .detalle-cliente {
      color: #334155;
      font-size: 0.875rem;
    }

    .alerta-reservas {
      margin-top: 4px;
      font-size: 0.82rem;
      color: #0369a1;
      background: rgba(224, 242, 254, 0.9);
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
      width: fit-content;
    }

    .acciones-cliente {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .btn-accion {
      background: rgba(241, 245, 249, 0.8);
      border: none;
      padding: 8px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .btn-accion:hover {
      transform: translateY(-1px);
    }

    .btn-editar:hover { background: #e0f2fe; color: #0284c7; }
    .btn-info:hover { background: #dcfce7; color: #15803d; }
    .btn-borrar:hover { background: #fee2e2; color: #dc2626; }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ClientesComponent implements OnInit {
  private readonly clientesService = inject(ClientesService);

  clientes: Cliente[] = [];
  formulario: Partial<Cliente> = { nombre: '', email: '', telefono: '' };
  editandoId: string | null = null;
  mensaje = '';
  mensajeTipo = '';
  reservasActivasPorCliente: Record<string, any[]> = {};

  ngOnInit(): void {
    this.refrescar();
  }

  refrescar(): void {
    this.clientesService
      .listar()
      .pipe(take(1))
      .subscribe((clientes) => (this.clientes = clientes));
  }

  guardar(): void {
    const operacion = this.editandoId
      ? this.clientesService.editar(this.editandoId, this.formulario)
      : this.clientesService.crear(this.formulario);

    operacion.pipe(take(1)).subscribe({
      next: () => {
        this.mensaje = this.editandoId ? '¡Cliente actualizado con éxito!' : '¡Cliente registrado con éxito!';
        this.mensajeTipo = 'exito';
        this.cancelarEdicion();
        this.refrescar();
      },
      error: (error) => {
        this.mensaje = this.formatearMensajeError(error);
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
      this.clientesService
        .eliminar(id)
        .pipe(take(1))
        .subscribe(() => {
          this.mensaje = 'Cliente eliminado correctamente.';
          this.mensajeTipo = 'exito';
          this.refrescar();
        });
    }
  }

  verReservasActivas(cliente: Cliente): void {
    this.clientesService
      .getReservasActivas(cliente.id)
      .pipe(take(1))
      .subscribe((reservas) => {
        this.reservasActivasPorCliente[cliente.id] = reservas;
      });
  }

  private formatearMensajeError(error: any): string {
    let mensajeError = error?.error?.message ?? 'No se pudo guardar el cliente.';

    if (Array.isArray(mensajeError)) {
      mensajeError = mensajeError.join(', ');
    }

    return mensajeError
      .replace('nombre should not be empty', 'El nombre no puede estar vacío')
      .replace('email must be an email', 'El correo electrónico debe ser válido')
      .replace('Internal server error', 'Error del servidor. Asegúrate de ingresar un teléfono válido (solo números).');
  }
}