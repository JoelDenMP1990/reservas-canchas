import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';
import { SaleListComponent } from './sale-list/sale-list.component';
import { SaleFormComponent } from './sale-form/sale-form.component';
import { SaleDetailComponent } from './sale-detail/sale-detail.component';

export const salesRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: SaleListComponent },
      { path: 'new', component: SaleFormComponent },
      { path: 'edit/:id', component: SaleFormComponent },
      { path: 'detail/:id', component: SaleDetailComponent }
    ]
  }
];