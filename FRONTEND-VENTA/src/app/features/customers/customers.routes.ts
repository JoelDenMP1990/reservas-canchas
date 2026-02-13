import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerFormComponent } from './customer-form/customer-form.component';

export const customersRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: CustomerListComponent },
      { path: 'new', component: CustomerFormComponent },
      { path: 'edit/:id', component: CustomerFormComponent }
    ]
  }
];