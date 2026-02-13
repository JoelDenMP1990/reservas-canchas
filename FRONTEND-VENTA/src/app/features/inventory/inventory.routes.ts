import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component';
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { InventoryAdjustComponent } from './inventory-adjust/inventory-adjust.component';

export const inventoryRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: InventoryListComponent },
      { path: 'adjust', component: InventoryAdjustComponent },
      { path: 'adjust/:productId', component: InventoryAdjustComponent }
    ]
  }
];