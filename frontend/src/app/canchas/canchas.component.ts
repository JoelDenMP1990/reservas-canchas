import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cancha, CanchasService } from './canchas.service';
import { Administrador, AdministradoresService } from '../administradores/administradores.service';

@Component({
  selector: 'app-canchas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contenedor-principal">
      
      <!-- Panel Izquierdo: Formulario -->
      <div class="tarjeta form-container">
        <div class="tarjeta-header">
          <h2>
            <span class="icono">🏟️</span> 
            {{ editandoId ? 'Editar Cancha' : 'Nueva Cancha' }}
          </h2>
        </div>
        
        <form (ngSubmit)="guardar()" class="formulario">
          <div class="form-group">
            <label>Nombre de la cancha</label>
            <input name="nombre" [(ngModel)]="formulario.nombre" placeholder="Ej. Cancha Sintética 1" required />
          </div>

          <div class="form-group">
            <label>Tipo de superficie</label>
            <input name="tipo" [(ngModel)]="formulario.tipo" placeholder="Ej. Césped Sintético, Cemento..." required />
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label>Tarifa base ($/hora)</label>
              <input name="tarifaBasePorHora" type="number" min="0" [(ngModel)]="formulario.tarifaBasePorHora" required />
            </div>
            
            <div class="form-group half" *ngIf="!editandoId">
              <label>Administrador</label>
              <select name="administradorId" [(ngModel)]="formulario.administradorId" required>
                <option value="" disabled selected>Seleccione uno...</option>
                <option *ngFor="let a of administradores" [value]="a.id">{{ a.nombre }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label>Apertura</label>
              <input name="horaAperturaDesde" type="time" [(ngModel)]="formulario.horaAperturaDesde" required />
            </div>
            <div class="form-group half">
              <label>Cierre</label>
              <input name="horaCierreHasta" type="time" [(ngModel)]="formulario.horaCierreHasta" required />
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input name="activa" type="checkbox" [(ngModel)]="formulario.activa" />
              <span>Cancha Activa y disponible para reservas</span>
            </label>
          </div>

          <div class="acciones-formulario">
            <button type="submit" class="btn btn-primary">
              {{ editandoId ? '💾 Guardar cambios' : '➕ Registrar cancha' }}
            </button>
            <button type="button" class="btn btn-secondary" *ngIf="editandoId" (click)="cancelarEdicion()">
              Cancelar
            </button>
          </div>
        </form>

        <div *ngIf="mensaje" class="alerta" [ngClass]="mensajeTipo === 'mensaje error' ? 'alerta-error' : 'alerta-exito'">
          {{ mensaje }}
        </div>
      </div>

      <!-- Panel Derecho: Lista de Canchas -->
      <div class="tarjeta lista-container">
        <div class="tarjeta-header">
          <h2>
            <span class="icono">📋</span> Canchas Registradas
          </h2>
        </div>
        
        <div class="canchas-grid">
          <div class="cancha-item" *ngFor="let c of canchas">
            <div class="cancha-info">
              <div class="cancha-header">
                <h3>{{ c.nombre }}</h3>
                <span class="badge" [ngClass]="c.activa ? 'badge-activa' : 'badge-inactiva'">
                  {{ c.activa ? 'Activa' : 'Inactiva' }}
                </span>
              </div>
              <p class="cancha-detalle"><strong>Tipo:</strong> {{ c.tipo }}</p>
              <p class="cancha-detalle"><strong>Tarifa:</strong> $ {{ c.tarifaBasePorHora }} / hora</p>
              <p class="cancha-detalle"><strong>Horario:</strong> {{ c.horaAperturaDesde }} - {{ c.horaCierreHasta }}</p>
              <p class="cancha-detalle" *ngIf="c.administrador?.nombre">
                <strong>Admin:</strong> {{ c.administrador?.nombre }}
              </p>
            </div>
            <div class="cancha-acciones">
              <button type="button" class="btn-icon btn-edit" (click)="editar(c)" title="Editar">✏️</button>
              <button type="button" class="btn-icon btn-delete" (click)="eliminar(c.id)" title="Borrar">🗑️</button>
            </div>
          </div>
          
          <div class="estado-vacio" *ngIf="canchas.length === 0">
            <p>No hay canchas registradas aún.</p>
          </div>
        </div>
      </div>

    </div>
  `,

  styles: [`
   .contenedor-principal {
      width: 100vw;
      min-height: calc(100vh - 70px);
      margin-left: calc(-50vw + 50%);
      padding: 2rem 1rem;
      box-sizing: border-box;
      position: relative;
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 2rem;
      max-width: 1200px;
      margin: 2rem auto;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    } 

    /* Tarjetas*/
    .tarjeta {  
      backdrop-filter: blur(6px);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.5);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .tarjeta-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .tarjeta-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #1a4731;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Formularios*/
    .formulario {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .half {
      flex: 1;
    }

    label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 0.4rem;
    }

    input[type="text"], input[type="number"], input[type="time"], select {
      padding: 0.75rem;
      border: 1px solid #cbd5e0;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: all 0.2s;
      outline: none;
      background: rgba(255,255,255,0.9);
    }

    input:focus, select:focus {
      border-color: #276749;
      box-shadow: 0 0 0 3px rgba(39, 103, 73, 0.15);
      background: #ffffff;
    }

    .checkbox-group {
      margin-top: 0.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: normal;
      cursor: pointer;
    }

    .checkbox-label input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    /* Botones */
    .acciones-formulario {
      display: flex;
      gap: 1rem;
      margin-top: 1.25rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      flex: 1;
    }

    .btn-primary {
      background-color: #1a4731;
      color: white;
    }

    .btn-primary:hover {
      background-color: #276749;
    }

    .btn-secondary {
      background-color: #edf2f7;
      color: #4a5568;
    }

    .btn-secondary:hover {
      background-color: #e2e8f0;
    }

    /* lista de canchas*/
    .canchas-grid {
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem; 
      overflow-y: auto;
      max-height: 500px; 
    }

    .cancha-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem; 
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #fafbfc;
      transition: transform 0.1s, box-shadow 0.1s;
    }

    .cancha-item:hover {
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      transform: translateY(-1px);
      background: #ffffff;
    }

    .cancha-info {
      flex: 1;
    }

    .cancha-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.3rem;
    }

    .cancha-header h3 {
      margin: 0;
      font-size: 1rem;
      color: #2d3748;
    }

    .badge {
      padding: 0.2rem 0.5rem; 
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: bold;
      text-transform: uppercase;
    }

    .badge-activa {
      background-color: #c6f6d5;
      color: #22543d;
    }

    .badge-inactiva {
      background-color: #fed7d7;
      color: #822727;
    }

    .cancha-detalle {
      margin: 0.15rem 0; 
      font-size: 0.8rem;
      color: #718096;
    }

    /* Botones de acción  */
    .cancha-acciones {
      display: flex;
      gap: 0.4rem;
    }

    .btn-icon {
      background: #edf2f7;
      border: none;
      width: 32px; /* Más chico */
      height: 32px; /* Más chico */
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      font-size: 0.9rem;
    }

    .btn-edit:hover { background: #bee3f8; }
    .btn-delete:hover { background: #fed7d7; }

    /* Alertas */
    .alerta {
      margin: 1rem 1.5rem 1.5rem;
      padding: 0.85rem;
      border-radius: 6px;
      font-weight: 500;
      text-align: center;
      font-size: 0.9rem;
    }

    .alerta-exito {
      background-color: #c6f6d5;
      color: #22543d;
      border: 1px solid #9ae6b4;
    }

    .alerta-error {
      background-color: #fed7d7;
      color: #822727;
      border: 1px solid #feb2b2;
    }

    .estado-vacio {
      text-align: center;
      color: #a0aec0;
      padding: 1.5rem;
      font-size: 0.9rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .contenedor-principal {
        grid-template-columns: 1fr;
        padding: 0 1rem;
      }
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `] 

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
        
        setTimeout(() => this.mensaje = '', 3000);
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
    this.mensaje = '';
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
    if(confirm('¿Estás seguro de que deseas eliminar esta cancha?')) {
      this.canchasService.eliminar(id).subscribe(() => this.refrescar());
    }
  }
}