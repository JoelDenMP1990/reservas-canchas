import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../inventory.service';
import { Inventory } from '../inventory.model';
import { NotificationService } from '../../../core/services/notification.service';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DateFormatPipe],
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss']
})
export class InventoryListComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private notificationService = inject(NotificationService);

  inventories: Inventory[] = [];
  filteredInventories: Inventory[] = [];
  searchTerm = '';
  showLowStockOnly = false;

  ngOnInit(): void {
    this.loadInventories();
  }

  loadInventories(): void {
    this.inventoryService.getAll().subscribe({
      next: (data) => {
        this.inventories = data;
        this.filteredInventories = data;
      },
      error: () => {
        this.notificationService.error('Error al cargar inventario');
      }
    });
  }

  filterInventories(): void {
    this.filteredInventories = this.inventories.filter(inventory => {
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = 
        inventory.product?.name.toLowerCase().includes(searchLower) ||
        inventory.product?.code.toLowerCase().includes(searchLower);
      
      const matchesLowStock = !this.showLowStockOnly || 
        (inventory.availableQuantity <= (inventory.product?.minStock || 10));
      
      return matchesSearch && matchesLowStock;
    });
  }

  toggleLowStockFilter(): void {
    this.showLowStockOnly = !this.showLowStockOnly;
    this.filterInventories();
  }

  getStockStatus(inventory: Inventory): string {
    const available = Number(inventory.availableQuantity);
    const minStock = Number(inventory.product?.minStock || 0);

    if (available === 0) return 'Sin Stock';
    if (available <= minStock) return 'Stock Bajo';
    return 'Stock Normal';
  }

  getStockClass(inventory: Inventory): string {
    const available = Number(inventory.availableQuantity);
    const minStock = Number(inventory.product?.minStock || 0);

    if (available === 0) return 'badge-danger';
    if (available <= minStock) return 'badge-warning';
    return 'badge-success';
  }
}