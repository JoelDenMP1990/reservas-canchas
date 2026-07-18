import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';
import { ProformaListComponent } from './proforma-list/proforma-list.component';
import { ProformaFormComponent } from './proforma-form/proforma-form.component';
import { ProformaDetailComponent } from './proforma-detail/proforma-detail.component';

export const proformasRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: ProformaListComponent },
      { path: 'new', component: ProformaFormComponent },
      { path: 'edit/:id', component: ProformaFormComponent },
      { path: 'detail/:id', component: ProformaDetailComponent }
    ]
  }
];