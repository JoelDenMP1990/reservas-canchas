import { Routes } from '@angular/router';
import { ClientesComponent } from './clientes/clientes.component';
import { AdministradoresComponent } from './administradores/administradores.component';
import { CanchasComponent } from './canchas/canchas.component';
import { ReservasComponent } from './reservas/reservas.component';
import { PagosComponent } from './pagos/pagos.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { soloAdministrador } from './sesion/solo-administrador.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'canchas', pathMatch: 'full' },
  { path: 'clientes', component: ClientesComponent, canActivate: [soloAdministrador] },
  { path: 'administradores', component: AdministradoresComponent, canActivate: [soloAdministrador] },
  { path: 'canchas', component: CanchasComponent },
  { path: 'reservas', component: ReservasComponent },
  { path: 'pagos', component: PagosComponent, canActivate: [soloAdministrador] },
  { path: 'notificaciones', component: NotificacionesComponent, canActivate: [soloAdministrador] },
];
