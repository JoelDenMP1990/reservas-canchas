import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmDialogComponent, DateFormatPipe],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  selectedRole = '';
  
  showDeleteDialog = false;
  userToDelete: User | null = null;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
      },
      error: () => {
        this.notificationService.error('Error al cargar usuarios');
      }
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = 
        user.fullName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower);
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      
      return matchesSearch && matchesRole;
    });
  }

  confirmDelete(user: User): void {
    this.userToDelete = user;
    this.showDeleteDialog = true;
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
    this.userToDelete = null;
  }

  deleteUser(): void {
    if (this.userToDelete) {
      this.userService.delete(this.userToDelete.id).subscribe({
        next: () => {
          this.notificationService.success('Usuario eliminado correctamente');
          this.loadUsers();
          this.cancelDelete();
        },
        error: () => {
          this.notificationService.error('Error al eliminar usuario');
          this.cancelDelete();
        }
      });
    }
  }

  toggleActive(user: User): void {
    const action = user.isActive ? 
      this.userService.deactivate(user.id) : 
      this.userService.activate(user.id);

    action.subscribe({
      next: () => {
        this.notificationService.success(
          `Usuario ${user.isActive ? 'desactivado' : 'activado'} correctamente`
        );
        this.loadUsers();
      },
      error: () => {
        this.notificationService.error('Error al actualizar usuario');
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'badge-danger';
      case 'SELLER':
        return 'badge-primary';
      case 'VIEWER':
        return 'badge-secondary';
      default:
        return 'badge-secondary';
    }
  }

  getRoleLabel(role: string): string {
    const labels: any = {
      ADMIN: 'Administrador',
      SELLER: 'Vendedor',
      VIEWER: 'Visualizador'
    };
    return labels[role] || role;
  }
}