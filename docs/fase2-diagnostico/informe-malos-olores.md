# Informe de Diagnóstico — Malos Olores (Fase 2)

**Grupo 1** · Dominio D1 · Fase 2 (Diagnóstico)

Se identificaron **6 malos olores** en el código base funcional (`apps/backend/src`), todos
concentrados en `ReservaService` — lo cual es en sí mismo evidencia del smell #3 (Large/God Class).
Cada uno se corrige con una técnica de refactorización específica en la Fase 3 (ver
`docs/fase3-refactorizacion/informe-refactorizacion.md`).

---

## 1. Long Method

**Ubicación:** `apps/backend/src/application/ReservaService.ts:20-86` (método `crearReserva`).

**Evidencia:** el método hace, en una sola pieza de ~65 líneas: (a) buscar la cancha, (b) validar
disponibilidad recorriendo todas las reservas existentes, (c) calcular la tarifa con un árbol de
condicionales, (d) construir y persistir la `Reserva`, y (e) notificar al cliente. Un lector necesita
sostener las 5 responsabilidades en la cabeza a la vez para entender el método completo.

**Justificación como smell:** viola el Principio de Responsabilidad Única (SRP) a nivel de método;
dificulta las pruebas unitarias de cada paso por separado y aumenta el riesgo de introducir errores
al modificar cualquiera de las 5 responsabilidades.

**Refactor planeado:** R1 — Extract Method (Fase 3, nivel Métodos).

---

## 2. Duplicated Code

**Ubicación:** `apps/backend/src/application/ReservaService.ts:96-120` (método `cotizarPrecio`),
duplicado exacto del bloque de `crearReserva()` en `apps/backend/src/application/ReservaService.ts:43-67`.

**Evidencia:** el árbol de condicionales que calcula la tarifa según `TipoCancha` y hora del día está
copiado literalmente entre `crearReserva()` y `cotizarPrecio()`.

**Justificación como smell:** cualquier cambio en las reglas de tarifa (por ejemplo, agregar un nuevo
tipo de cancha o ajustar un descuento) debe replicarse manualmente en dos lugares — es cuestión de
tiempo antes de que ambas copias diverjan.

**Refactor planeado:** R2 — Extract Method / eliminar duplicación (Fase 3, nivel Métodos), resuelto de
forma definitiva con R6 (Strategy) al centralizar el cálculo en una sola implementación por política.

---

## 3. Large Class / God Class

**Ubicación:** `apps/backend/src/application/ReservaService.ts` (clase completa, 146 líneas).

**Evidencia:** `ReservaService` conoce las reglas de disponibilidad, las reglas de tarifa, la política
de cancelación **y** la lógica de notificación al cliente. Cuatro razones distintas para cambiar la
clase (cuatro responsabilidades) violan el SRP a nivel de clase.

**Justificación como smell:** una clase que hace demasiado es difícil de probar de forma aislada, de
reutilizar parcialmente y de entender de un vistazo — típicamente el primer síntoma de que el diseño
necesita más colaboradores especializados.

**Refactor planeado:** R3 — Extract Class (`NotificacionService`) y R4 — Move Method (lógica de
disponibilidad), Fase 3, nivel Clases y objetos.

---

## 4. Primitive Obsession

**Ubicación:** `apps/backend/src/domain/Reserva.ts:8-17` (atributos `fecha`, `horaInicio`, `horaFin`
como `string` sueltos) y su uso disperso en `apps/backend/src/application/ReservaService.ts:34-37,44,131`.

**Evidencia:** la franja horaria de una reserva —un concepto de negocio con reglas propias (no puede
tener `horaFin` antes de `horaInicio`, dos franjas pueden solaparse, etc.)— se representa con tres
strings primitivos sin ningún método propio. La lógica de solapamiento (línea 37) y de cálculo de
antelación (línea 131) queda esparcida en el servicio en vez de vivir junto a los datos que interpreta.

**Justificación como smell:** no hay un solo lugar donde validar o consultar reglas de la franja
horaria; cada consumidor debe reimplementar la lógica de comparación de horas a partir de strings.

**Refactor planeado:** R5 — Replace Primitive with Object (introducir `FranjaHoraria`), Fase 3, nivel
Datos.

---

## 5. Complex Conditional

**Ubicación:** `apps/backend/src/application/ReservaService.ts:45-67` (y su duplicado en `96-120`).

**Evidencia:** tres niveles de `if/else` anidados (tipo de cancha → franja horaria) para determinar el
factor de tarifa aplicable.

**Justificación como smell:** cada nuevo tipo de cancha o nueva política de precio (p. ej. tarifa de
temporada alta) obliga a modificar este bloque existente, violando el principio Abierto/Cerrado (OCP)
y arriesgando romper una combinación ya probada al tocar otra.

**Refactor planeado:** R6 — Replace Conditional with Strategy (patrón ya justificado en
`docs/fase1-diseno-uml/00-documento-diseno.md` sección 7), Fase 3, nivel Condicionales.

---

## 6. Magic Numbers

**Ubicación:**
- `apps/backend/src/application/ReservaService.ts:47,49,55,57,63` — factores de descuento/recargo
  (`0.8`, `1.3`, `0.9`, `1.2`, `0.85`) sin constante con nombre.
- `apps/backend/src/application/ReservaService.ts:46,48,54,56,62` — límites de horario (`6`, `10`,
  `18`, `22`) hardcodeados.
- `apps/backend/src/application/ReservaService.ts:136` — mínimo de horas de antelación para cancelar
  (`2`) sin constante con nombre.

**Evidencia:** ningún número tiene un identificador que explique su significado de negocio; hay que
leer el contexto completo para inferir que `0.8` es "descuento de horario valle" y `2` es "antelación
mínima de cancelación en horas".

**Justificación como smell:** dificulta ajustar reglas de negocio (¿dónde cambio la antelación mínima
de cancelación? ¿es la misma constante usada en dos lugares o una coincidencia?) y hace el código menos
autoexplicativo.

**Refactor planeado:** R5 — Replace Magic Number with Symbolic Constant, Fase 3, nivel Datos (agrupado
con la introducción de `FranjaHoraria` porque ambos tocan el mismo módulo).

---

## Resumen de trazabilidad

| # | Mal olor | Ubicación principal | Refactor (Fase 3) | Nivel |
|---|----------|----------------------|--------------------|-------|
| 1 | Long Method | `ReservaService.crearReserva()` | R1 | Métodos |
| 2 | Duplicated Code | `crearReserva()` / `cotizarPrecio()` | R2 | Métodos |
| 3 | Large/God Class | `ReservaService` (clase completa) | R3, R4 | Clases y objetos |
| 4 | Primitive Obsession | `Reserva.fecha/horaInicio/horaFin` | R5 | Datos |
| 5 | Complex Conditional | Cálculo de tarifa (if/else anidado) | R6 | Condicionales |
| 6 | Magic Numbers | Factores de tarifa y antelación mínima | R5 | Datos |
