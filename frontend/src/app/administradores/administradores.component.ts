import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Administrador, AdministradoresService } from './administradores.service';

<<<<<<< HEAD
interface CanchaAdministrador {
id: string;
nombre: string;
tipo: string;
tarifaBasePorHora: number;
activa: boolean;
horaAperturaDesde: string;
horaCierreHasta: string;
}

=======
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

>>>>>>> 0510489affe3eaa2ee12e77005e014882520362a
@Component({
selector: 'app-administradores',
standalone: true,
imports: [CommonModule, FormsModule],
template: `
<<<<<<< HEAD
<div class="tarjeta">
=======
<div class="contenedor-principal">
<div class="contenido-ancho">
<div class="tarjeta animate-fade-in">
>>>>>>> 0510489affe3eaa2ee12e77005e014882520362a
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

<<<<<<< HEAD
<div class="tarjeta">
=======
<div class="tarjeta animate-fade-in">
>>>>>>> 0510489affe3eaa2ee12e77005e014882520362a
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
<<<<<<< HEAD
  class="tarjeta"
=======
  class="tarjeta animate-fade-in"
>>>>>>> 0510489affe3eaa2ee12e77005e014882520362a
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

<<<<<<< HEAD
=======
  <button
    type="button"
    *ngIf="!mostrarFormularioCancha"
    (click)="mostrarFormularioCancha = true"
  >
    + Registrar cancha
  </button>

  <ng-container *ngIf="mostrarFormularioCancha">
>>>>>>> 0510489affe3eaa2ee12e77005e014882520362a
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
<<<<<<< HEAD
      *ngIf="editandoCanchaId"
=======
>>>>>>> 0510489affe3eaa2ee12e77005e014882520362a
      (click)="cancelarEdicionCancha()"
    >
      Cancelar
    </button>
  </form>
<<<<<<< HEAD
=======
  </ng-container>
>>>>>>> 0510489affe3eaa2ee12e77005e014882520362a

  <hr />

  <h3>Mis canchas</h3>

  <p *ngIf="canchas.length === 0">
    Este administrador todavía no tiene canchas registradas.
  </p>

<<<<<<< HEAD
  <div *ngFor="let cancha of canchas">
    <div class="tarjeta">
=======
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
>>>>>>> 0510489affe3eaa2ee12e77005e014882520362a
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

<<<<<<< HEAD
      <p>
        <strong>Estado:</strong>
        {{ cancha.activa ? 'Activa' : 'Inactiva' }}
      </p>
=======
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
>>>>>>> 0510489affe3eaa2ee12e77005e014882520362a

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
<<<<<<< HEAD
`,
=======
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
`],
>>>>>>> 0510489affe3eaa2ee12e77005e014882520362a
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
<<<<<<< HEAD
=======
mostrarFormularioCancha = false;
>>>>>>> 0510489affe3eaa2ee12e77005e014882520362a

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
<<<<<<< HEAD
=======
this.cancelarEdicionCancha();

>>>>>>> 0510489affe3eaa2ee12e77005e014882520362a
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
<<<<<<< HEAD
=======
          this.cancelarEdicionCancha();
>>>>>>> 0510489affe3eaa2ee12e77005e014882520362a
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
<<<<<<< HEAD
=======
          this.cancelarEdicionCancha();
>>>>>>> 0510489affe3eaa2ee12e77005e014882520362a
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
<<<<<<< HEAD

=======
this.mostrarFormularioCancha = true;
>>>>>>> 0510489affe3eaa2ee12e77005e014882520362a

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
<<<<<<< HEAD
=======
this.mostrarFormularioCancha = false;
>>>>>>> 0510489affe3eaa2ee12e77005e014882520362a

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

