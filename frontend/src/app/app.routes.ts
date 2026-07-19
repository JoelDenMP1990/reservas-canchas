import { Routes } from '@angular/router';
import { ClientesComponent } from './clientes/clientes.component';
import { AdministradoresComponent } from './administradores/administradores.component';
import { CanchasComponent } from './canchas/canchas.component';
import { ReservasComponent } from './reservas/reservas.component';
import { PagosComponent } from './pagos/pagos.component';

export const routes: Routes = [
  { path: '', redirectTo: 'canchas', pathMatch: 'full' },
  { path: 'clientes', component: ClientesComponent },
  { path: 'administradores', component: AdministradoresComponent },
  { path: 'canchas', component: CanchasComponent },
  { path: 'reservas', component: ReservasComponent },
  { path: 'pagos', component: PagosComponent },
];
