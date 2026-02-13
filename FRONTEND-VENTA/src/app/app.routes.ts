import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes').then(m => m.productsRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'customers',
    loadChildren: () => import('./features/customers/customers.routes').then(m => m.customersRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'sales',
    loadChildren: () => import('./features/sales/sales.routes').then(m => m.salesRoutes),
    canActivate: [authGuard]
  },
  {
  path: 'proformas',
  loadChildren: () => import('./features/proformas/proformas.routes').then(m => m.proformasRoutes),
  canActivate: [authGuard]
   },
   {
  path: 'inventory',
  loadChildren: () => import('./features/inventory/inventory.routes').then(m => m.inventoryRoutes),
  canActivate: [authGuard]
   },
   {
  path: 'users',
  loadChildren: () => import('./features/users/users.routes').then(m => m.usersRoutes),
  canActivate: [authGuard]
  },
  
  { path: '**', redirectTo: '/login' }
];