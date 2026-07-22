import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Administrador, AdministradoresService } from './administradores.service';

interface CanchaAdministrador {
id: string;
nombre: string;
tipo: string;
tarifaBasePorHora: number;
activa: boolean;
horaAperturaDesde: string;
horaCierreHasta: string;
ocupadaAhora: boolean;
}

@Component({
selector: 'app-administradores',
standalone: true,
imports: [CommonModule, FormsModule],
template: `
<div class="tarjeta">
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

<div class="tarjeta">
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

<div
  class="tarjeta"
  *ngIf="administradorSeleccionado"
>
  <h2>
    Panel de {{ administradorSeleccionado.nombre }}
  </h2>

  <p>
    <strong>Área:</strong>
    {{ administradorSeleccionado.areaAsignada }}
  </p>

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
    <span class="punto libre"></span> Libre ahora
    <span class="punto ocupada"></span> Ocupada ahora
    <span class="punto inactiva"></span> Inactiva
  </div>

  <div class="grilla-canchas">
    <div
      *ngFor="let cancha of canchas"
      class="celda-cancha"
      [class.libre]="cancha.activa && !cancha.ocupadaAhora"
      [class.ocupada]="cancha.activa && cancha.ocupadaAhora"
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

      <p class="etiqueta-estado">
        {{ !cancha.activa ? 'Inactiva' : (cancha.ocupadaAhora ? 'Ocupada ahora' : 'Libre ahora') }}
      </p>

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

  <p *ngIf="reporte">
    <strong>Reporte:</strong>
    {{ reporte }}
  </p>
</div>

<p
  class="mensaje"
  [class]="mensajeTipo"
>
  {{ mensaje }}
</p>
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
    border: 2px solid transparent;
    color: #fff;
  }

  .celda-cancha.libre {
    background-color: #16a34a;
  }

  .celda-cancha.ocupada {
    background-color: #dc2626;
  }

  .celda-cancha.inactiva {
    background-color: #6b7280;
  }

  .celda-cancha h4,
  .celda-cancha p {
    margin: 0.2rem 0;
  }

  .celda-cancha button {
    margin-top: 0.5rem;
    margin-right: 0.4rem;
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

reporte = '';

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
    this.mensaje = this.editandoAdministradorId
      ? 'Administrador actualizado.'
      : 'Administrador registrado.';

    this.mensajeTipo = 'mensaje exito';

    this.cancelarEdicionAdministrador();

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
.subscribe((reporte) => {
this.reporte = reporte;
});
}

editar(administrador: Administrador): void {
this.editandoAdministradorId = administrador.id;


this.formularioAdministrador = {
  nombre: administrador.nombre,
  areaAsignada: administrador.areaAsignada,
};


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

