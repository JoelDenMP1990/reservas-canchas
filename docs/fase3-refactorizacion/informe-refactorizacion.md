# Informe Final de Refactorización (Fase 3)

**Grupo 1** · Dominio D1 · Fase 3 (Refactorización)

Se aplicaron **6 refactorizaciones**, una por commit, cubriendo los 4 niveles exigidos (métodos,
clases y objetos, datos, condicionales). En cada una se siguió el ciclo seguro: **verificar pruebas
en verde → aplicar una técnica pequeña → volver a correr las pruebas → commit**. Ninguna
refactorización cambió el comportamiento observable del sistema (mismos resultados de
`npm run demo` y de la API antes y después de cada paso).

Evolución de la suite de pruebas a lo largo de la fase: **11 → 11 → 11 → 11 → 14 → 17** tests,
siempre en verde (los aumentos corresponden a pruebas nuevas para los colaboradores introducidos en
R5 y R6, no a correcciones de pruebas rotas).

---

## R1 — Extract Method

- **Nivel:** Métodos.
- **Mal olor que corrige:** #1 Long Method (`ReservaService.crearReserva`).
- **Commit:** `eea2e1b` — `refactor(metodos): extraer métodos de crearReserva (R1 - Extract Method)`.
- **Antes:** un método de ~65 líneas que buscaba la cancha, verificaba disponibilidad, calculaba la
  tarifa, persistía la reserva y notificaba, todo en el mismo bloque.
- **Después:** `crearReserva()` pasa a ser un orquestador de ~7 líneas que delega en
  `buscarCanchaOFallar`, `verificarDisponibilidad`, `calcularTarifa`, `crearYPersistirReserva` y
  `notificar`, cada uno con una sola responsabilidad y nombre explícito.
- **Pruebas:** 11/11 en verde antes y después.

## R2 — Extract Method (eliminar duplicación)

- **Nivel:** Métodos.
- **Mal olor que corrige:** #2 Duplicated Code (`crearReserva` / `cotizarPrecio`).
- **Commit:** `b7e0031` — `refactor(metodos): eliminar duplicación de cálculo de tarifa (R2 - Extract Method)`.
- **Antes:** `cotizarPrecio()` mantenía una copia exacta del árbol de condicionales de tarifa que
  también vivía en `crearReserva()` (vía el método recién extraído `calcularTarifa`).
- **Después:** `cotizarPrecio()` simplemente llama a `this.calcularTarifa(cancha, horaInicio)` — una
  sola fuente de verdad para el cálculo de tarifa.
- **Pruebas:** 11/11 en verde antes y después.

## R3 — Extract Class

- **Nivel:** Clases y objetos.
- **Mal olor que corrige:** #3 Large/God Class (parcial: responsabilidad de notificación).
- **Commit:** `b9b7895` — `refactor(clases): extraer NotificacionService de ReservaService (R3 - Extract Class)`.
- **Antes:** `ReservaService` llamaba directamente a `console.log` para notificar al cliente.
- **Después:** se crea `NotificacionService` con el método `notificar(mensaje)`, inyectado por
  constructor. `ReservaService` pierde una de sus cuatro razones para cambiar.
- **Pruebas:** 11/11 en verde antes y después.

## R4 — Move Method

- **Nivel:** Clases y objetos.
- **Mal olor que corrige:** #3 Large/God Class (parcial: responsabilidad de disponibilidad).
- **Commit:** `cfed976` — `refactor(clases): mover verificación de disponibilidad a DisponibilidadService (R4 - Move Method)`.
- **Antes:** la lógica de solapamiento de franjas horarias vivía como método privado de
  `ReservaService`, sin depender de ningún estado propio de esa clase.
- **Después:** se crea `DisponibilidadService`, colaborador dedicado inyectado por constructor, que
  concentra esta responsabilidad y puede evolucionar (o probarse) de forma independiente.
- **Pruebas:** 11/11 en verde antes y después.

## R5 — Replace Primitive with Object + Replace Magic Number with Symbolic Constant

- **Nivel:** Datos.
- **Mal olor que corrige:** #4 Primitive Obsession y #6 Magic Numbers (antelación mínima).
- **Commit:** `e0b501b` — `refactor(datos): introducir FranjaHoraria y constantes simbólicas (R5 - ...)`.
- **Antes:** `Reserva` guardaba `fecha`, `horaInicio` y `horaFin` como tres strings sueltos; la
  lógica de solapamiento y de cálculo de antelación se reimplementaba a partir de esos strings en
  cada consumidor; `cancelarReserva()` comparaba contra un `2` sin nombre.
- **Después:** se introduce el value object `FranjaHoraria` (con `seSolapaCon`,
  `horaInicioComoNumero`, `calcularInicioComoFecha`), y `Reserva` pasa a tener un único atributo
  `franjaHoraria: FranjaHoraria`. Se agregan las constantes `ANTELACION_MINIMA_CANCELACION_HORAS` y
  `MILISEGUNDOS_POR_HORA`. **Cambio de contrato:** `crearReserva()` ahora recibe una `FranjaHoraria`
  en vez de 3 strings, y el JSON de la API anida `franjaHoraria` en vez de exponer los 3 campos
  planos — se actualizaron la ruta HTTP, el demo y el tipo `Reserva` del frontend en el mismo commit.
- **Pruebas:** 11/11 antes → 14/14 después (se agregan 3 pruebas de `FranjaHoraria.seSolapaCon`).

## R6 — Replace Conditional with Strategy

- **Nivel:** Condicionales.
- **Mal olor que corrige:** #5 Complex Conditional y #6 Magic Numbers (factores de tarifa).
- **Commit:** `3c927c6` — `refactor(condicionales): reemplazar árbol if/else de tarifas por patrón Strategy (R6 - ...)`.
- **Antes:** `calcularTarifa()` tenía un árbol if/else de 3 niveles (tipo de cancha × franja
  horaria) con los factores de descuento/recargo hardcodeados.
- **Después:** se introduce la interfaz `EstrategiaTarifa` con las implementaciones
  `TarifaEstandar`, `TarifaHorarioPico` y `TarifaPromocional` (cada una con sus propias constantes
  de factor con nombre), seleccionadas por `SelectorEstrategiaTarifa`. `ReservaService` delega el
  cálculo en la estrategia seleccionada. Este es el patrón que ya se había justificado en
  `docs/fase1-diseno-uml/00-documento-diseno.md` sección 7 — la Fase 3 cierra esa trazabilidad.
- **Pruebas:** 14/14 antes → 17/17 después (se agregan 3 pruebas de `SelectorEstrategiaTarifa`).

---

## Resumen de trazabilidad (informe de malos olores → refactor → commit)

| Mal olor (Fase 2) | Refactor | Nivel | Commit |
|---|---|---|---|
| #1 Long Method | R1 | Métodos | `eea2e1b` |
| #2 Duplicated Code | R2 | Métodos | `b7e0031` |
| #3 Large/God Class | R3, R4 | Clases y objetos | `b9b7895`, `cfed976` |
| #4 Primitive Obsession | R5 | Datos | `e0b501b` |
| #5 Complex Conditional | R6 | Condicionales | `3c927c6` |
| #6 Magic Numbers | R5 (antelación), R6 (factores de tarifa) | Datos / Condicionales | `e0b501b`, `3c927c6` |

## Diseño final de `ReservaService`

Al cierre de la Fase 3, `ReservaService` pasó de una God Class con 4 responsabilidades mezcladas a
un orquestador que coordina 4 colaboradores especializados, todos inyectados por constructor:

```
ReservaService
 ├── ReservaRepository        (persistencia)
 ├── CanchaRepository         (persistencia)
 ├── NotificacionService      (R3 — notificación)
 ├── DisponibilidadService    (R4 — disponibilidad)
 └── SelectorEstrategiaTarifa (R6 — cálculo de tarifa vía Strategy)
```

Ver `diagrama-clases-actualizado.puml` para el diagrama de clases completo tras la refactorización.
