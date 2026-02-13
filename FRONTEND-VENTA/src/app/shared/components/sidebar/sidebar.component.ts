import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/enums';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: Role[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private authService = inject(AuthService);
  
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard', roles: [Role.ADMIN, Role.SELLER, Role.VIEWER] },
    { label: 'Ventas', icon: '💰', route: '/sales', roles: [Role.ADMIN, Role.SELLER, Role.VIEWER] },
    { label: 'Proformas', icon: '📄', route: '/proformas', roles: [Role.ADMIN, Role.SELLER, Role.VIEWER] },
    { label: 'Productos', icon: '📦', route: '/products', roles: [Role.ADMIN, Role.SELLER, Role.VIEWER] },
    { label: 'Clientes', icon: '👥', route: '/customers', roles: [Role.ADMIN, Role.SELLER, Role.VIEWER] },
    { label: 'Inventario', icon: '📋', route: '/inventory', roles: [Role.ADMIN, Role.SELLER, Role.VIEWER] },
    { label: 'Usuarios', icon: '👤', route: '/users', roles: [Role.ADMIN] },
  ];

  canAccess(roles: Role[]): boolean {
    return this.authService.hasRole(roles as string[]);
  }
}