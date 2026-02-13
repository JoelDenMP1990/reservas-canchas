import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserFormComponent } from './user-form/user-form.component';
import { roleGuard } from '../../core/guards/role.guard';

export const usersRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [roleGuard(['ADMIN'])],
    children: [
      { path: '', component: UserListComponent },
      { path: 'new', component: UserFormComponent },
      { path: 'edit/:id', component: UserFormComponent }
    ]
  }
];