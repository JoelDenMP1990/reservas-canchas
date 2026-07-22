import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header class="app-header">
      <div class="header-container">
        <!-- Logo y Título -->
        <div class="brand-wrapper">
          <span class="logo-badge">⚽</span>
          <h1 class="app-title">Sistema de Reservas de Canchas Deportivas</h1>
        </div>

        <!-- Menú de Navegación Organizado -->
        <nav class="app-nav">
          <div class="nav-group">
            <a routerLink="/canchas" routerLinkActive="activo">
              <span class="nav-icon">🏟️</span> Canchas
            </a>
            <a routerLink="/reservas" routerLinkActive="activo">
              <span class="nav-icon">📅</span> Reservas
            </a>
          </div>

          <div class="nav-divider"></div>

          <div class="nav-group">
            <a routerLink="/clientes" routerLinkActive="activo">
              <span class="nav-icon">👥</span> Clientes
            </a>
            <a routerLink="/administradores" routerLinkActive="activo">
              <span class="nav-icon">🛡️</span> Administradores
            </a>
          </div>

          <div class="nav-divider"></div>

          <div class="nav-group">
            <a routerLink="/pagos" routerLinkActive="activo">
              <span class="nav-icon">💳</span> Pagos
            </a>
            <a routerLink="/notificaciones" routerLinkActive="activo">
              <span class="nav-icon">🔔</span> Notificaciones
            </a>
          </div>
        </nav>
      </div>
    </header>
    <main class="app-main">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-header {
      background: linear-gradient(135deg, rgba(8, 28, 14, 0.96), rgba(15, 52, 27, 0.96));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 2px solid rgba(56, 161, 105, 0.35);
      color: white;
      padding: 0.75rem 1.5rem;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    .header-container {
      max-width: 1600px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: center;
    }

    @media (min-width: 1200px) {
      .header-container {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }

    .brand-wrapper {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .logo-badge {
      background: rgba(56, 161, 105, 0.25);
      border: 1px solid rgba(56, 161, 105, 0.5);
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }

    .app-title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: 0.3px;
      color: #f7fafc;
    }

    .app-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      align-items: center;
      justify-content: center;
    }

    .nav-group {
      display: flex;
      gap: 0.3rem;
    }

    .nav-divider {
      width: 1px;
      height: 20px;
      background: rgba(255, 255, 255, 0.2);
      margin: 0 0.2rem;
    }

    @media (max-width: 768px) {
      .nav-divider {
        display: none;
      }
    }

    .app-nav a {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      padding: 0.45rem 0.75rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s ease;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .app-nav a:hover {
      color: white;
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .app-nav a.activo {
      color: #ffffff;
      background: linear-gradient(135deg, #276749, #1e4e36);
      font-weight: 600;
      border-color: rgba(72, 187, 120, 0.5);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }

    .nav-icon {
      font-size: 0.85rem;
    }
  `]
})
export class AppComponent {}