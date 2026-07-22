import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header>
      <h1>Sistema de Reservas de Canchas Deportivas</h1>
      <nav>
        <a routerLink="/canchas" routerLinkActive="activo">Canchas</a>
        <a routerLink="/administradores" routerLinkActive="activo">Administradores</a>
        <a routerLink="/clientes" routerLinkActive="activo">Clientes</a>
        <a routerLink="/reservas" routerLinkActive="activo">Reservas</a>
        <a routerLink="/pagos" routerLinkActive="activo">Pagos</a>
        <a routerLink="/notificaciones" routerLinkActive="activo">Notificaciones</a>
      </nav>
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent {}
