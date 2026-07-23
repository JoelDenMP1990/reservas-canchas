import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Cliente, ClientesService } from '../clientes/clientes.service';
import { SesionService } from '../sesion/sesion.service';

// Pantalla de inicio: como el sistema no tiene login (proyecto de prueba), el usuario
// simplemente elige con qué rol quiere entrar. Si elige Cliente, además dice quién es.
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pantalla-inicio">
      <div class="tarjeta-bienvenida">
        <h1>⚽ Sistema de Reservas de Canchas Deportivas</h1>
        <p class="subtitulo">Elige con qué rol quieres entrar</p>

        <div class="cuadros" *ngIf="paso === 'inicio'">
          <button type="button" class="cuadro cuadro-cliente" (click)="elegirCliente()">
            <span class="icono">🙋</span>
            <h2>Cliente</h2>
            <p>
              Consulta disponibilidad, reserva una cancha, revisa tus reservas y
              cancélalas (hasta 2 horas antes). Si la cancha es gratuita se omite el
              pago; si no, tú mismo procesas el pago al reservar.
            </p>
          </button>

          <button type="button" class="cuadro cuadro-admin" (click)="entrarComoAdministrador()">
            <span class="icono">🛡️</span>
            <h2>Administrador</h2>
            <p>
              Acceso completo: gestiona canchas, clientes, administradores, revisa
              pagos y notificaciones de todo el sistema.
            </p>
          </button>
        </div>

        <div class="eleccion-cliente" *ngIf="paso === 'elegir-cliente'">
          <label>
            ¿Quién eres?
            <select name="clienteId" [(ngModel)]="clienteIdSeleccionado">
              <option value="" disabled selected>-- Selecciona tu nombre --</option>
              <option *ngFor="let c of clientes" [value]="c.id">{{ c.nombre }}</option>
            </select>
          </label>
          <div class="acciones">
            <button type="button" class="btn-volver" (click)="volver()">Volver</button>
            <button
              type="button"
              class="btn-entrar"
              [disabled]="!clienteIdSeleccionado"
              (click)="entrarComoCliente()"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pantalla-inicio {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }

    .tarjeta-bienvenida {
      background: rgba(255, 255, 255, 0.92);
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 900px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
      text-align: center;
    }

    h1 {
      margin: 0 0 0.5rem;
      color: #1b4332;
      font-size: 1.6rem;
    }

    .subtitulo {
      color: #4a5568;
      margin-bottom: 2rem;
    }

    .cuadros {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 700px) {
      .cuadros {
        grid-template-columns: 1fr;
      }
    }

    .cuadro {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      padding: 2rem 1.5rem;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      background: #f8fafc;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .cuadro:hover {
      border-color: #2d6a4f;
      background: #f0fdf4;
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }

    .cuadro .icono {
      font-size: 2.5rem;
    }

    .cuadro h2 {
      margin: 0;
      color: #1b4332;
    }

    .cuadro p {
      margin: 0;
      color: #4a5568;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .eleccion-cliente {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.2rem;
      max-width: 360px;
      margin: 0 auto;
    }

    .eleccion-cliente label {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      width: 100%;
      font-weight: 600;
      color: #334155;
      text-align: left;
    }

    .eleccion-cliente select {
      padding: 0.65rem 0.8rem;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.95rem;
    }

    .acciones {
      display: flex;
      gap: 0.8rem;
      width: 100%;
    }

    .acciones button {
      flex: 1;
      padding: 0.65rem 1rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-volver {
      background: #edf2f7;
      color: #4a5568;
    }

    .btn-entrar {
      background: #2d6a4f;
      color: white;
    }

    .btn-entrar:disabled {
      background: #a0aec0;
      cursor: not-allowed;
    }
  `],
})
export class InicioComponent implements OnInit {
  paso: 'inicio' | 'elegir-cliente' = 'inicio';
  clientes: Cliente[] = [];
  clienteIdSeleccionado = '';

  constructor(
    private readonly clientesService: ClientesService,
    private readonly sesionService: SesionService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.clientesService.listar().subscribe((clientes) => (this.clientes = clientes));
  }

  entrarComoAdministrador(): void {
    this.sesionService.entrarComoAdministrador();
    this.router.navigateByUrl('/canchas');
  }

  elegirCliente(): void {
    this.paso = 'elegir-cliente';
  }

  volver(): void {
    this.paso = 'inicio';
    this.clienteIdSeleccionado = '';
  }

  entrarComoCliente(): void {
    const cliente = this.clientes.find((c) => c.id === this.clienteIdSeleccionado);
    if (!cliente) {
      return;
    }
    this.sesionService.entrarComoCliente(cliente.id, cliente.nombre);
    this.router.navigateByUrl('/reservas');
  }
}
