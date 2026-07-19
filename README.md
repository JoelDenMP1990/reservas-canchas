# Sistema de Reservas de Canchas Deportivas

Proyecto académico — **Diseño de Software** — sistema de reservas de canchas deportivas.

## Descripción

Permite a administradores registrar canchas, a clientes reservarlas por horario, y procesar el pago
de cada reserva. El diseño sigue el diagrama de clases del equipo: 5 clases, cada una su propio
módulo en backend y frontend, con relaciones bien definidas en la base de datos.

## Arquitectura

**Monorepo** con dos paquetes (npm workspaces):

- `backend/` — API REST en **NestJS + TypeORM + PostgreSQL**.
- `frontend/` — interfaz web en **Angular**, consume la API del backend.

```
backend/src/
  clientes/          Cliente        (persona que reserva)
  administradores/   Administrador  (persona que registra/gestiona canchas)
  canchas/           Cancha
  reservas/          Reserva
  pagos/             Pago
frontend/src/app/
  clientes/          pantalla CRUD de Cliente
  administradores/   pantalla CRUD de Administrador
  canchas/           pantalla CRUD de Cancha
  reservas/          pantalla CRUD de Reserva (crear, reprogramar, confirmar, cancelar)
  pagos/             pantalla CRUD de Pago (registrar pago = confirma la reserva)
db/
  init.sql           copia completa de la base (esquema + datos de prueba)
```

Cada clase del diagrama es un módulo independiente tanto en backend como en frontend, para que
cada integrante del equipo pueda ubicar y trabajar sobre "su" clase sin pisar el trabajo de otros.

### Relaciones de la base de datos

- Un **Administrador** registra muchas **Canchas** (1 a 0..*).
- Un **Cliente** realiza muchas **Reservas** (1 a 0..*).
- Una **Cancha** tiene muchas **Reservas** (1 a 0..*).
- Una **Reserva** genera a lo sumo un **Pago** (1 a 0..1).

## Requisitos

- Node.js 18+ y npm
- PostgreSQL instalado localmente (no se usa Docker en este proyecto)

## Configurar la base de datos

1. Crea el rol y la base (una sola vez), conectado como superusuario de Postgres:

   ```sql
   CREATE ROLE canchas WITH LOGIN PASSWORD 'canchas' CREATEDB;
   CREATE DATABASE canchas_reservas OWNER canchas;
   ```

2. Carga la copia de la base (esquema + datos de prueba) que está en `db/init.sql`:

   ```bash
   psql -U canchas -h localhost -d canchas_reservas -f db/init.sql
   ```

   Esto crea las 5 tablas con sus relaciones y deja datos de prueba listos: 2 administradores,
   3 clientes, 3 canchas y 3 reservas (una confirmada con pago, una cancelada, una pendiente).

## Instalación

```bash
npm install
```

Instala las dependencias de ambos workspaces (`backend` y `frontend`) desde la raíz.

En `backend/`, copia `.env.example` a `.env` (ya trae los valores por defecto que coinciden con el
paso anterior: usuario `canchas`, base `canchas_reservas`).

## Ejecutar el sistema

```bash
npm run dev:backend    # levanta la API en http://localhost:3000
npm run dev:frontend   # levanta la UI en http://localhost:4200 (otra terminal)
```

Si prefieres partir de una base vacía en lugar de `db/init.sql`, el backend crea el esquema solo
(`synchronize: true`) al arrancar; luego puedes poblarla con datos de prueba corriendo:

```bash
npm run seed --workspace=backend
```

## Pruebas

```bash
npm test
```

Corre la suite de Jest del backend (pruebas simples y directas sobre las entidades y servicios).

## Colaboración y protección de `main`

- `main` está protegida en GitHub: nadie puede hacer `git push` directo, force-push ni borrarla.
- Todo cambio entra por Pull Request, y debe cumplir:
  - Checks en verde: `analyze`, `sec-secrets`, `sec-npm-audit`, `test`.
  - 1 aprobación, pero solo cuenta la de un *code owner* (ver `.github/CODEOWNERS`).
- Los admins del repo (coordinación) están exentos de estas reglas para poder resolver bloqueos o
  emergencias sin depender de un tercero; el resto del equipo pasa siempre por el flujo completo.
- Guía paso a paso para contribuir: ver `CONTRIBUTING.md`.

## Equipo

| Rol | Integrante |
|-----|------------|
| Coordinador/a | Jhonatan Moran |
| Integrante | Bryan Cabrera |
| Integrante | Dimas Duque |
| Integrante | Dayana Guilcaso |
| Integrante | Josué Jiménez |
| Integrante | Adriana Martínez |
| Integrante | Leonardo Reyes |
