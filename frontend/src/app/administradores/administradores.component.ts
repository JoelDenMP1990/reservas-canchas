import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Administrador, AdministradoresService, ReporteOcupacion, ResumenGeneralSistema } from './administradores.service';

interface FranjaHoraria {
inicio: string;
fin: string;
ocupada: boolean;
}

interface CanchaAdministrador {
id: string;
nombre: string;
tipo: string;
tarifaBasePorHora: number;
activa: boolean;
horaAperturaDesde: string;
horaCierreHasta: string;
horarios: FranjaHoraria[];
}

@Component({
selector: 'app-administradores',
standalone: true,
imports: [CommonModule, FormsModule],
template: `
<div class="contenedor-principal">
<div class="contenido-ancho">
<div class="tarjeta animate-fade-in">
<h2>{{ editandoAdministradorId ? 'Editar administrador' : 'Nuevo administrador' }}</h2>

  <form (ngSubmit)="guardarAdministrador()">
    <label>
      Nombre
      <input
        name="nombre"
        [(ngModel)]="formularioAdministrador.nombre"
        required
      />
    </label>

    <label>
      Área asignada
      <select
        name="areaAsignada"
        [(ngModel)]="formularioAdministrador.areaAsignada"
        required
      >
        <option value="">Seleccione un área</option>
        <option value="Zona Norte">Zona Norte</option>
        <option value="Zona Sur">Zona Sur</option>
        <option value="Zona Este">Zona Este</option>
        <option value="Zona Oeste">Zona Oeste</option>
      </select>
    </label>

    <button type="submit">
      {{ editandoAdministradorId ? 'Guardar cambios' : 'Registrar administrador' }}
    </button>

    <button
      type="button"
      *ngIf="editandoAdministradorId"
      (click)="cancelarEdicionAdministrador()"
    >
      Cancelar
    </button>
  </form>
</div>

<div class="tarjeta animate-fade-in">
  <h2>Seleccionar administrador</h2>

  <select
    name="administradorSeleccionado"
    [(ngModel)]="administradorSeleccionadoId"
    (ngModelChange)="seleccionarAdministrador()"
  >
    <option value="">Seleccione un administrador</option>

    <option
      *ngFor="let administrador of administradores"
      [value]="administrador.id"
    >
      {{ administrador.nombre }} — {{ administrador.areaAsignada }}
    </option>
  </select>
</div>

<div class="tarjeta animate-fade-in">
  <button type="button" (click)="verResumenGeneral()">
    Resumen general del sistema
  </button>

  <section *ngIf="resumenGeneral" class="resumen-general">
    <h2>Resumen general del sistema</h2>
    <div class="grilla-resumen">
      <div class="tarjeta-metrica"><strong>Administradores</strong><span>{{ resumenGeneral.administradores }}</span></div>
      <div class="tarjeta-metrica"><strong>Canchas registradas</strong><span>{{ resumenGeneral.canchasRegistradas }}</span></div>
      <div class="tarjeta-metrica"><strong>Canchas activas</strong><span>{{ resumenGeneral.canchasActivas }}</span></div>
      <div class="tarjeta-metrica"><strong>Canchas inactivas</strong><span>{{ resumenGeneral.canchasInactivas }}</span></div>
      <div class="tarjeta-metrica"><strong>Clientes</strong><span>{{ resumenGeneral.clientes }}</span></div>
      <div class="tarjeta-metrica"><strong>Reservas totales</strong><span>{{ resumenGeneral.reservasTotales }}</span></div>
      <div class="tarjeta-metrica"><strong>Confirmadas</strong><span>{{ resumenGeneral.reservasConfirmadas }}</span></div>
      <div class="tarjeta-metrica"><strong>Pendientes</strong><span>{{ resumenGeneral.reservasPendientes }}</span></div>
      <div class="tarjeta-metrica"><strong>Canceladas</strong><span>{{ resumenGeneral.reservasCanceladas }}</span></div>
      <div class="tarjeta-metrica"><strong>Pagos registrados</strong><span>{{ resumenGeneral.pagosRegistrados }}</span></div>
      <div class="tarjeta-metrica"><strong>Ingresos totales</strong><span>{{ resumenGeneral.ingresosTotales | currency:'USD':'symbol':'1.2-2' }}</span></div>
      <div class="tarjeta-metrica"><strong>Canchas ocupadas ahora</strong><span>{{ resumenGeneral.canchasOcupadasActualmente }}</span></div>
      <div class="tarjeta-metrica"><strong>Canchas libres ahora</strong><span>{{ resumenGeneral.canchasLibresActualmente }}</span></div>
    </div>
  </section>
</div>

<div
  class="tarjeta animate-fade-in"
  *ngIf="administradorSeleccionado"
>
  <h2>
    Panel de {{ administradorSeleccionado.nombre }}
  </h2>

  <p>
    <strong>Área:</strong>
    {{ administradorSeleccionado.areaAsignada }}
  </p>

  <button
    type="button"
    (click)="editar(administradorSeleccionado)"
  >
    Editar administrador
  </button>

  <hr />

  <button
    type="button"
    *ngIf="!mostrarFormularioCancha"
    (click)="mostrarFormularioCancha = true"
  >
    + Registrar cancha
  </button>

  <ng-container *ngIf="mostrarFormularioCancha">
  <h3>
    {{ editandoCanchaId ? 'Editar cancha' : 'Registrar nueva cancha' }}
  </h3>

  <form (ngSubmit)="guardarCancha()">
    <label>
      Nombre de la cancha
      <input
        name="nombreCancha"
        [(ngModel)]="formularioCancha.nombre"
        required
      />
    </label>

    <label>
      Tipo de cancha
      <select
        name="tipo"
        [(ngModel)]="formularioCancha.tipo"
        required
      >
        <option value="">Seleccione un tipo</option>
        <option value="Futbol">Fútbol</option>
        <option value="Basquet">Básquet</option>
        <option value="Volley">Volley</option>
        <option value="Tenis">Tenis</option>
      </select>
    </label>

    <label>
      Tarifa base por hora
      <input
        name="tarifaBasePorHora"
        type="number"
        min="0"
        [(ngModel)]="formularioCancha.tarifaBasePorHora"
        required
      />
    </label>

    <label>
      Hora de apertura
      <input
        name="horaAperturaDesde"
        type="time"
        [(ngModel)]="formularioCancha.horaAperturaDesde"
        required
      />
    </label>

    <label>
      Hora de cierre
      <input
        name="horaCierreHasta"
        type="time"
        [(ngModel)]="formularioCancha.horaCierreHasta"
        required
      />
    </label>

    <label>
      <input
        name="activa"
        type="checkbox"
        [(ngModel)]="formularioCancha.activa"
      />
      Cancha activa
    </label>

    <button type="submit">
      {{ editandoCanchaId ? 'Guardar cambios' : 'Registrar cancha' }}
    </button>

    <button
      type="button"
      (click)="cancelarEdicionCancha()"
    >
      Cancelar
    </button>
  </form>
  </ng-container>

  <hr />

  <h3>Mis canchas</h3>

  <p *ngIf="canchas.length === 0">
    Este administrador todavía no tiene canchas registradas.
  </p>

  <div class="leyenda">
    <span class="punto libre"></span> Horario libre
    <span class="punto ocupada"></span> Horario ocupado
    <span class="punto inactiva"></span> Cancha inactiva
  </div>

  <div class="grilla-canchas">
    <div
      *ngFor="let cancha of canchas"
      class="celda-cancha"
      [class.inactiva]="!cancha.activa"
    >
      <h4>{{ cancha.nombre }}</h4>

      <p>
        <strong>Tipo:</strong> {{ cancha.tipo }}
      </p>

      <p>
        <strong>Tarifa:</strong>
        \${{ cancha.tarifaBasePorHora }}/hora
      </p>

      <p>
        <strong>Horario:</strong>
        {{ cancha.horaAperturaDesde }} -
        {{ cancha.horaCierreHasta }}
      </p>

      <p *ngIf="!cancha.activa" class="etiqueta-estado">Inactiva</p>

      <div class="franjas" *ngIf="cancha.activa">
        <span
          *ngFor="let franja of cancha.horarios"
          class="franja"
          [class.ocupada]="franja.ocupada"
          [class.libre]="!franja.ocupada"
          [title]="franja.inicio + ' - ' + franja.fin"
        >
          {{ franja.inicio }}
        </span>
      </div>

      <button
        type="button"
        (click)="editarCancha(cancha)"
      >
        Editar
      </button>

      <button
        type="button"
        (click)="eliminarCancha(cancha.id)"
      >
        Eliminar
      </button>
    </div>
  </div>

  <button
    type="button"
    (click)="verReporte(administradorSeleccionado)"
  >
    Ver reporte de ocupación
  </button>

  <section *ngIf="reporte" class="reporte-ocupacion">
    <h3>Reporte de ocupación</h3>
    <p><strong>Administrador:</strong> {{ reporte.administrador.nombre }}</p>
    <p><strong>Área:</strong> {{ reporte.administrador.areaAsignada }}</p>

    <h4>Resumen</h4>
    <p><strong>Canchas registradas:</strong> {{ reporte.resumen.canchasRegistradas }}</p>
    <p><strong>Canchas activas:</strong> {{ reporte.resumen.canchasActivas }}</p>

    <h4>Ocupación actual</h4>
    <div class="grilla-ocupacion">
      <div *ngFor="let detalle of reporte.ocupacion" class="detalle-ocupacion">
        <p><strong>Cancha:</strong> {{ detalle.cancha }}</p>
        <ng-container *ngIf="detalle.estado !== 'LIBRE'; else canchaLibre">
          <p><strong>Cliente:</strong> {{ detalle.cliente }}</p>
          <p><strong>Fecha:</strong> {{ detalle.horaInicio | date:'yyyy-MM-dd' }}</p>
          <p><strong>Horario:</strong> {{ detalle.horaInicio | date:'HH:mm' }} - {{ detalle.horaFin | date:'HH:mm' }}</p>
        </ng-container>
        <ng-template #canchaLibre></ng-template>
        <p><strong>Estado:</strong> {{ detalle.estado }}</p>
      </div>
    </div>
  </section>
</div>

<p
  class="mensaje"
  [class]="mensajeTipo"
>
  {{ mensaje }}
</p>
</div>
</div>
`,
styles: [`
  .grilla-canchas {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }

  .celda-cancha {
    border-radius: 10px;
    padding: 1rem;
    border: 2px solid #e2e8f0;
    background-color: #f8fafc;
  }

  .celda-cancha.inactiva {
    background-color: #6b7280;
    color: #fff;
  }

  .celda-cancha h4,
  .celda-cancha p {
    margin: 0.2rem 0;
  }

  .celda-cancha button {
    margin-top: 0.5rem;
    margin-right: 0.4rem;
  }

  .franjas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin: 0.5rem 0;
  }

  .franja {
    font-size: 0.7rem;
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
    color: #fff;
  }

  .franja.libre {
    background-color: #16a34a;
  }

  .franja.ocupada {
    background-color: #dc2626;
  }

  .leyenda {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }

  .punto {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-left: 0.6rem;
  }

  .punto:first-child {
    margin-left: 0;
  }

  .punto.libre { background-color: #16a34a; }
  .punto.ocupada { background-color: #dc2626; }
  .punto.inactiva { background-color: #6b7280; }

  .reporte-ocupacion { margin-top: 1rem; }
  .grilla-ocupacion {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }
  .detalle-ocupacion {
    border: 1px solid #bfdbfe;
    border-left: 3px solid #2563eb;
    border-radius: 8px;
    padding: 0.75rem;
  }
  .detalle-ocupacion p { margin: 0.2rem 0; }
  .resumen-general { margin-top: 1rem; }
  .grilla-resumen {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 0.75rem;
  }
  .tarjeta-metrica {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    padding: 0.75rem;
    background-color: #eff6ff;
  }
  .tarjeta-metrica span { font-size: 1.3rem; color: #1d4ed8; }
`],
})
export class AdministradoresComponent implements OnInit {
administradores: Administrador[] = [];

administradorSeleccionadoId = '';
administradorSeleccionado: Administrador | null = null;

canchas: CanchaAdministrador[] = [];

formularioAdministrador: Partial<Administrador> = {
nombre: '',
areaAsignada: '',
};

formularioCancha: Partial<CanchaAdministrador> = {
nombre: '',
tipo: '',
tarifaBasePorHora: 20,
activa: true,
horaAperturaDesde: '08:00',
horaCierreHasta: '22:00',
};

editandoAdministradorId: string | null = null;
editandoCanchaId: string | null = null;
mostrarFormularioCancha = false;

reporte: ReporteOcupacion | null = null;
resumenGeneral: ResumenGeneralSistema | null = null;

mensaje = '';
mensajeTipo = '';

constructor(
private readonly administradoresService: AdministradoresService,
) {}

ngOnInit(): void {
this.refrescarAdministradores();
}

refrescarAdministradores(): void {
this.administradoresService
.listar()
.subscribe((administradores) => {
this.administradores = administradores;
});
}

guardarAdministrador(): void {
const estabaEditando = Boolean(this.editandoAdministradorId);
const operacion = this.editandoAdministradorId
? this.administradoresService.editar(
this.editandoAdministradorId,
this.formularioAdministrador,
)
: this.administradoresService.crear(
this.formularioAdministrador,
);

operacion.subscribe({
  next: () => {
    this.mensaje = estabaEditando
      ? 'Administrador actualizado.'
      : 'Administrador registrado.';

    this.mensajeTipo = 'mensaje exito';

    this.cancelarEdicionAdministrador();

    if (estabaEditando) {
      this.administradorSeleccionadoId = '';
      this.administradorSeleccionado = null;
      this.canchas = [];
      this.reporte = null;
    }

    this.refrescarAdministradores();
  },

  error: (error) => {
    this.mensaje =
      error.error?.message ??
      'No se pudo guardar el administrador.';

    this.mensajeTipo = 'mensaje error';
  },
});

}

seleccionarAdministrador(): void {
this.cancelarEdicionCancha();
this.reporte = null;

if (!this.administradorSeleccionadoId) {
this.administradorSeleccionado = null;
this.canchas = [];
return;
}

this.administradorSeleccionado =
  this.administradores.find(
    (administrador) =>
      administrador.id === this.administradorSeleccionadoId,
  ) ?? null;

if (this.administradorSeleccionado) {
  this.cargarCanchas();
}

}

cargarCanchas(): void {
if (!this.administradorSeleccionadoId) {
return;
}

this.administradoresService
  .listarCanchas(this.administradorSeleccionadoId)
  .subscribe({
    next: (canchas) => {
      this.canchas = canchas;
    },

    error: (error) => {
      this.mensaje =
        error.error?.message ??
        'No se pudieron cargar las canchas.';

      this.mensajeTipo = 'mensaje error';
    },
  });

}

guardarCancha(): void {
  const datos = {
    ...this.formularioCancha,
    tarifaBasePorHora: Number(this.formularioCancha.tarifaBasePorHora),
  };

  if (this.editandoCanchaId) {
    this.administradoresService
      .editarCancha(this.editandoCanchaId, datos)
      .subscribe({
        next: () => {
          this.mensaje = 'Cancha actualizada correctamente.';
          this.cancelarEdicionCancha();
          this.cargarCanchas();
        },
        error: (error) => {
          this.mensaje =
            error.error?.message ?? 'No se pudo actualizar la cancha.';
        },
      });
  } else {
    this.administradoresService
      .registrarCancha(this.administradorSeleccionadoId, datos)
      .subscribe({
        next: () => {
          this.mensaje = 'Cancha registrada correctamente.';
          this.cancelarEdicionCancha();
          this.cargarCanchas();
        },
        error: (error) => {
          this.mensaje =
            error.error?.message ?? 'No se pudo registrar la cancha.';
        },
      });
  }
}

editarCancha(cancha: CanchaAdministrador): void {
this.editandoCanchaId = cancha.id;
this.mostrarFormularioCancha = true;

this.formularioCancha = {
  nombre: cancha.nombre,
  tipo: cancha.tipo,
  tarifaBasePorHora: cancha.tarifaBasePorHora,
  activa: cancha.activa,
  horaAperturaDesde: cancha.horaAperturaDesde,
  horaCierreHasta: cancha.horaCierreHasta,
};


}

eliminarCancha(id: string): void {
if (!this.administradorSeleccionadoId) {
return;
}


this.administradoresService
  .eliminarCancha(
    this.administradorSeleccionadoId,
    id,
  )
  .subscribe({
    next: () => {
      this.mensaje = 'Cancha eliminada.';
      this.mensajeTipo = 'mensaje exito';

      this.cargarCanchas();
    },

    error: (error) => {
      this.mensaje =
        error.error?.message ??
        'No se pudo eliminar la cancha.';

      this.mensajeTipo = 'mensaje error';
    },
  });

}

verReporte(administrador: Administrador): void {
this.administradoresService
.reporteOcupacion(administrador.id)
.subscribe({
  next: (reporte) => {
    this.reporte = reporte;
  },
  error: (error) => {
    this.mensaje = error.error?.message ?? 'No se pudo generar el reporte de ocupación.';
    this.mensajeTipo = 'mensaje error';
  },
});
}

verResumenGeneral(): void {
this.administradoresService
.resumenGeneral()
.subscribe({
  next: (resumen) => {
    this.resumenGeneral = resumen;
  },
  error: (error) => {
    this.mensaje = error.error?.message ?? 'No se pudo cargar el resumen general.';
    this.mensajeTipo = 'mensaje error';
  },
});
}

editar(administrador: Administrador): void {
this.editandoAdministradorId = administrador.id;

this.formularioAdministrador = {
  nombre: administrador.nombre,
  areaAsignada: administrador.areaAsignada,
};

this.administradorSeleccionadoId = '';
this.administradorSeleccionado = null;
this.canchas = [];
this.reporte = null;
}

cancelarEdicionAdministrador(): void {
this.editandoAdministradorId = null;


this.formularioAdministrador = {
  nombre: '',
  areaAsignada: '',
};


}

cancelarEdicionCancha(): void {
this.editandoCanchaId = null;
this.mostrarFormularioCancha = false;

this.formularioCancha = {
  nombre: '',
  tipo: '',
  tarifaBasePorHora: 20,
  activa: true,
  horaAperturaDesde: '08:00',
  horaCierreHasta: '22:00',
};


}

eliminarAdministrador(id: string): void {
this.administradoresService
.eliminar(id)
.subscribe(() => {
this.refrescarAdministradores();
});
}
}
