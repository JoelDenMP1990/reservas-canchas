# Sistema de Reservas de Canchas Deportivas

**Grupo 1**

Proyecto académico — dominio **D1 (Sistema de reservas)** — que integra modelado UML bajo el
enfoque **4+1**, diseño orientado a objetos y un proceso disciplinado de refactorización respaldado
por pruebas unitarias y control de versiones.

## Descripción

Permite a clientes reservar canchas deportivas (fútbol, básquet, tenis, vóley) por franjas horarias,
calculando la tarifa según el tipo de cancha y el horario (con descuentos en horarios de baja
demanda), y a administradores registrar nuevas canchas. Incluye notificación al cliente ante cambios
de estado de su reserva.

## Casos de uso principales

1. **Crear Reserva** — «include» Verificar Disponibilidad, «extend» Aplicar Descuento por Horario.
2. **Cancelar Reserva** — «include» Verificar Política de Cancelación.
3. **Registrar Cancha** — (rol Administrador).

## Arquitectura

**Monorepo** con dos paquetes (npm workspaces):

- `apps/backend` — API REST (Express) + toda la lógica de dominio y de aplicación. Aquí viven las
  8 clases de dominio, los servicios de los casos de uso, los repositorios en memoria y las pruebas
  unitarias. Es el paquete evaluado por la rúbrica (UML, OO/SOLID, malos olores, refactor).
- `apps/frontend` — interfaz web (Vite + TypeScript) que consume la API del backend para ejecutar
  los 3 casos de uso desde el navegador.

Se eligió **monorepo** en vez de microservicios porque el sistema tiene un único dominio cohesivo
(reservas de canchas) sin necesidad de escalar o desplegar componentes por separado; dividirlo en
microservicios habría agregado complejidad de infraestructura (comunicación entre servicios,
orquestación) sin beneficio real para el alcance del proyecto. La separación backend/frontend en
paquetes independientes ya da el desacople necesario para evolucionar cada capa por separado.

```
docs/
  fase1-diseno-uml/        Documento de diseño 4+1 y diagramas UML (PlantUML)
  fase2-diagnostico/       Informe de malos olores identificados en el código base
  fase3-refactorizacion/   Informe final de refactorización y diagrama de clases actualizado
apps/
  backend/
    src/
      domain/              Entidades y value objects del dominio
      application/          Servicios de aplicación (casos de uso)
      infrastructure/       Repositorios en memoria
      api/                  Rutas y controladores Express (adaptador HTTP sobre application/)
      demo/                 Script de demostración por consola
    tests/                 Suite de pruebas unitarias (Jest)
  frontend/
    src/                   Interfaz web (TypeScript + Vite) que consume la API
```

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

Instala las dependencias de ambos workspaces (`apps/backend` y `apps/frontend`) desde la raíz.

## Pruebas

```bash
npm test
```

Corre la suite de Jest del backend (donde vive toda la lógica evaluada por la rúbrica).

## Ejecutar el sistema

```bash
npm run dev:backend    # levanta la API en http://localhost:3000
npm run dev:frontend   # levanta la UI en http://localhost:5173 (otra terminal)
```

## Demo por consola

Alternativa rápida sin levantar servidores, ejecuta el flujo completo de los 3 casos de uso:

```bash
npm run demo
```

## Equipo

| Rol | Integrante |
|-----|------------|
| Coordinador/a | Jhonatan Moran |
| Responsable de modelado | _(por definir)_ |
| Responsable de pruebas | _(por definir)_ |
| Responsable de repositorio | _(por definir)_ |

> Los roles rotan por fase según lo indicado en la guía del proyecto.

## Fases del proyecto

- **Fase 1 — Modelado:** ver `docs/fase1-diseno-uml/`.
- **Fase 2 — Diagnóstico:** código base funcional + `docs/fase2-diagnostico/informe-malos-olores.md`.
- **Fase 3 — Refactorización:** ver `docs/fase3-refactorizacion/informe-refactorizacion.md`, con un
  commit por cada técnica aplicada (`git log` refleja el ciclo pruebas → refactor → pruebas → commit).
