import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../product.service';
import { Product } from '../product.model';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CustomCurrencyPipe, ConfirmDialogComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  selectedCategory = '';
  categories: string[] = [];
  
  showDeleteDialog = false;
  productToDelete: Product | null = null;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
        this.extractCategories();
      },
      error: () => {
        this.notificationService.error('Error al cargar productos');
      }
    });
  }

  extractCategories(): void {
    const categorySet = new Set(this.products.map(p => p.category).filter(c => c));
    this.categories = Array.from(categorySet) as string[];
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           product.code.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }

  confirmDelete(product: Product): void {
    this.productToDelete = product;
    this.showDeleteDialog = true;
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
    this.productToDelete = null;
  }

  deleteProduct(): void {
    if (this.productToDelete) {
      this.productService.delete(this.productToDelete.id).subscribe({
        next: () => {
          this.notificationService.success('Producto eliminado correctamente');
          this.loadProducts();
          this.cancelDelete();
        },
        error: () => {
          this.notificationService.error('Error al eliminar producto');
          this.cancelDelete();
        }
      });
    }
  }

  toggleActive(product: Product): void {
    const action = product.isActive ? 
      this.productService.deactivate(product.id) : 
      this.productService.activate(product.id);

    action.subscribe({
      next: () => {
        this.notificationService.success(
          `Producto ${product.isActive ? 'desactivado' : 'activado'} correctamente`
        );
        this.loadProducts();
      },
      error: () => {
        this.notificationService.error('Error al actualizar producto');
      }
    });
  }
}