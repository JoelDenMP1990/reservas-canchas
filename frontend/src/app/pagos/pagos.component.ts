import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pago, PagosService } from './pagos.service';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule],

  template: `
  <div class="tarjeta">
    <h2>💳 Historial de Pagos</h2>
    <p>Consulta todos los pagos procesados automáticamente.</p>

    <ul>
      <li *ngFor="let p of pagos">
        &#36;{{ p.monto }} —
        {{ p.metodoPago }} —
        {{ p.procesadoEn | date:'short' }}
      </li>

      <li *ngIf="pagos.length === 0">
        Sin pagos registrados todavía.
      </li>
    </ul>
  </div>
`,

  styles: [`
    .tarjeta{
      max-width:700px;
      margin:20px auto;
      padding:20px;
      border-radius:12px;
      background:#ffffff;
      box-shadow:0 4px 10px rgba(0,0,0,.15);
    }

    ul{
      list-style:none;
      padding:0;
    }

    li{
      background:#f8f9fa;
      margin:8px 0;
      padding:10px;
      border-radius:8px;
    }
  `]
})
export class PagosComponent implements OnInit {
  pagos: Pago[] = [];

  constructor(private readonly pagosService: PagosService) {}

  ngOnInit(): void {
    this.refrescar();
  }

  refrescar(): void {
    this.pagosService.listar().subscribe((pagos) => (this.pagos = pagos));
  }
}
