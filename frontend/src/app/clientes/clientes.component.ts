import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { Cliente, ClientesService } from './clientes.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contenedor-principal">
      <div class="contenido-ancho">
        <div class="tarjeta animate-fade-in">
          <h2>
            <span class="icono-badge">👤</span> {{ editandoId ? 'Editar Cliente' : 'Nuevo Cliente' }}
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
              <button type="submit" class="btn btn-guardar" [disabled]="guardando">
                {{ guardando ? '⏳ Guardando...' : (editandoId ? '💾 Guardar cambios' : '➕ Registrar cliente') }}
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
          <h2><span class="icono-badge">📋</span> Clientes Registrados</h2>

          <div class="campo-grupo campo-busqueda">
            <input
              name="filtro"
              [(ngModel)]="filtro"
              [ngModelOptions]="{ standalone: true }"
              placeholder="🔎 Buscar por nombre o email..."
            />
          </div>
          
          <div *ngIf="clientes.length === 0" class="sin-datos">
            No hay clientes registrados en la base de datos.
          </div>

          <div *ngIf="clientes.length > 0 && clientesFiltrados.length === 0" class="sin-datos">
            No hay clientes que coincidan con "{{ filtro }}".
          </div>

          <ul class="lista-clientes">
            <li *ngFor="let c of clientesFiltrados; trackBy: trackById" class="item-cliente">
              <div class="info-principal">
                <div class="avatar-inicial" [class.avatar-mujer]="esMujer(c.nombre)">
                  {{ esMujer(c.nombre) ? '👩' : '👨' }}
                </div>
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
    .contenedor-principal {
      width: 100vw;
      min-height: calc(100vh - 70px);
      margin-left: calc(-50vw + 50%);
      padding: 40px 20px;
      box-sizing: border-box;
      position: relative;
    }

    .contenido-ancho {
      max-width: 1100px;
      margin: 0 auto;
    }

    .tarjeta {
      background: rgba(255, 255, 255, 0.72);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.6);
    }
    
    h2 {
      color: #064e3b;
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 1.3rem;
      font-weight: 800;
      border-bottom: 2px solid rgba(6, 78, 59, 0.12);
      padding-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .icono-badge {
      background: rgba(6, 78, 59, 0.1);
      padding: 6px 10px;
      border-radius: 10px;
      font-size: 1.1rem;
    }

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
      font-weight: 700;
      color: #0f172a;
      font-size: 0.875rem;
    }

    .campo-grupo input {
      width: 100%;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.95);
      border: 1.5px solid #cbd5e1;
      border-radius: 10px;
      font-size: 0.95rem;
      color: #0f172a;
      outline: none;
      box-sizing: border-box;
    }

    .campo-grupo input:focus {
      border-color: #064e3b;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(6, 78, 59, 0.15);
    }

    .campo-busqueda {
      margin-bottom: 20px;
    }

    .botones-container {
      grid-column: 1 / -1;
      display: flex;
      gap: 12px;
      margin-top: 10px;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      font-size: 0.95rem;
      transition: all 0.2s ease-in-out;
    }

    .btn-guardar {
      background: #064e3b;
      color: white;
      box-shadow: 0 4px 12px rgba(6, 78, 59, 0.3);
    }

    .btn-guardar:hover:not(:disabled) {
      background: #047857;
      transform: translateY(-2px);
    }

    .btn-cancelar {
      background: #e2e8f0;
      color: #334155;
    }

    .mensaje {
      grid-column: 1 / -1;
      margin-top: 15px;
      padding: 12px 16px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .mensaje.exito { background-color: rgba(240, 253, 244, 0.95); color: #166534; border: 1px solid #bbf7d0; }
    .mensaje.error { background-color: rgba(254, 242, 242, 0.95); color: #991b1b; border: 1px solid #fecaca; }

    .sin-datos {
      color: #1e293b;
      font-style: italic;
      text-align: center;
      padding: 24px;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 10px;
    }

    .lista-clientes {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .item-cliente {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(226, 232, 240, 0.8);
      border-left: 5px solid #064e3b;
      border-radius: 12px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    }

    .item-cliente:hover {
      background: rgba(255, 255, 255, 0.98);
      transform: translateX(4px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
    }

    .info-principal {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .avatar-inicial {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #064e3b, #047857);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      box-shadow: 0 4px 10px rgba(6, 78, 59, 0.3);
      flex-shrink: 0;
    }

    .avatar-mujer {
      background: linear-gradient(135deg, #be185d, #e11d48) !important;
      box-shadow: 0 4px 10px rgba(190, 24, 93, 0.3) !important;
    }

    .info-cliente {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nombre-cliente {
      font-weight: 800;
      color: #0f172a;
      font-size: 1.05rem;
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
      font-weight: 600;
    }

    .alerta-reservas {
      margin-top: 4px;
      font-size: 0.82rem;
      color: #0369a1;
      background: #e0f2fe;
      padding: 3px 10px;
      border-radius: 6px;
      display: inline-block;
      width: fit-content;
      font-weight: 700;
    }

    .acciones-cliente {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .btn-accion {
      background: rgba(241, 245, 249, 0.9);
      border: 1px solid #cbd5e1;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-accion:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    .btn-editar:hover { background: #e0f2fe; color: #0284c7; border-color: #7dd3fc; }
    .btn-info:hover { background: #dcfce7; color: #15803d; border-color: #86efac; }
    .btn-borrar:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

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
  guardando = false;
  mensaje = '';
  mensajeTipo: 'exito' | 'error' | '' = '';
  reservasActivasPorCliente: Record<string, any[]> = {};
  filtro = '';

  private mensajeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.refrescar();
  }

  get clientesFiltrados(): Cliente[] {
    const texto = this.filtro.trim().toLowerCase();
    if (!texto) {
      return this.clientes;
    }
    return this.clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(texto) ||
        c.email.toLowerCase().includes(texto)
    );
  }

  trackById(_index: number, cliente: Cliente): string {
    return cliente.id;
  }

  esMujer(nombre: string): boolean {
    if (!nombre) return false;
    const primerNombre = nombre.trim().toLowerCase().split(' ')[0];
    
    const nombresFemeninosExcepcion = ['carmen', 'beatriz', 'raquel', 'isabel', 'pilar', 'mercedes', 'luz', 'ruth', 'inés'];
    if (nombresFemeninosExcepcion.includes(primerNombre)) {
      return true;
    }

    const nombresMasculinosExcepcion = ['luca', 'andrea', 'nicola', 'elías', 'josué', 'borja'];
    if (nombresMasculinosExcepcion.includes(primerNombre)) {
      return false;
    }

    return primerNombre.endsWith('a');
  }

  refrescar(): void {
    this.clientesService
      .listar()
      .pipe(take(1))
      .subscribe((clientes) => (this.clientes = clientes));
  }

  guardar(): void {
    if (this.guardando) {
      return;
    }
    this.guardando = true;

    const operacion = this.editandoId
      ? this.clientesService.editar(this.editandoId, this.formulario)
      : this.clientesService.crear(this.formulario);

    operacion.pipe(take(1)).subscribe({
      next: () => {
        this.mostrarMensaje(
          this.editandoId ? '¡Cliente actualizado con éxito!' : '¡Cliente registrado con éxito!',
          'exito'
        );
        this.guardando = false;
        this.cancelarEdicion();
        this.refrescar();
      },
      error: (error) => {
        this.mostrarMensaje(this.formatearMensajeError(error), 'error');
        this.guardando = false;
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
          this.mostrarMensaje('Cliente eliminado correctamente.', 'exito');
          delete this.reservasActivasPorCliente[id];
          this.refrescar();
        });
    }
  }

  verReservasActivas(cliente: Cliente): void {
    if (this.reservasActivasPorCliente[cliente.id]) {
      delete this.reservasActivasPorCliente[cliente.id];
      return;
    }

    this.clientesService
      .getReservasActivas(cliente.id)
      .pipe(take(1))
      .subscribe((reservas) => {
        this.reservasActivasPorCliente[cliente.id] = reservas;
      });
  }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    if (this.mensajeTimeoutId) {
      clearTimeout(this.mensajeTimeoutId);
    }
    this.mensaje = texto;
    this.mensajeTipo = tipo;
    this.mensajeTimeoutId = setTimeout(() => {
      this.mensaje = '';
      this.mensajeTipo = '';
    }, 3000);
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