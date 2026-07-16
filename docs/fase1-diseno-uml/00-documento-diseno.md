# Documento de Diseño — Sistema de Reservas de Canchas Deportivas

**Grupo 1** · Dominio D1 · Fase 1 (Modelado)

## 1. Descripción general del sistema

El sistema permite a **clientes** reservar **canchas deportivas** (fútbol, básquet, tenis, vóley)
en franjas horarias específicas, calculando automáticamente la tarifa según el tipo de cancha y el
horario (aplicando descuentos en horarios de baja demanda), y a **administradores** registrar y
mantener el catálogo de canchas disponibles. El sistema notifica al cliente ante la confirmación o
cancelación de una reserva.

Alcance mínimo cubierto: 3 casos de uso principales, 8 clases de dominio, lenguaje TypeScript.

## 2. Decisión de arquitectura: monorepo (backend + frontend) sobre microservicios

Se evaluaron tres alternativas de organización del sistema:

| Alternativa | Descripción | Descartada porque... |
|---|---|---|
| Backend único, sin frontend propio | Solo API, probada con Postman/Insomnia | El equipo necesita demostrar el sistema de forma visual en la sustentación |
| Microservicios (reservas, canchas, notificaciones como servicios independientes) | Cada capacidad desplegada por separado, con comunicación entre servicios | El dominio es único y cohesivo, con 8 clases y 3 casos de uso — dividirlo agregaría orquestación, descubrimiento de servicios y despliegue distribuido sin ningún beneficio de escalabilidad real a este tamaño |
| **Monorepo con `apps/backend` + `apps/frontend`** ✅ | Un repositorio, dos paquetes independientes (npm workspaces), cada uno con su propio `package.json`, dependencias y build | — (elegida) |

**Justificación:** el monorepo da el desacople que sí se necesita (backend y frontend evolucionan y
se despliegan por separado, cada uno con su propio ciclo de build) sin la complejidad operativa de
microservicios, que no aporta nada a un dominio de este tamaño. Mantener ambos paquetes en un mismo
repositorio también simplifica la evidencia de trabajo colaborativo en Git que pide la rúbrica (un
solo historial de commits, un solo pipeline de CI).

## 3. Modelo de vistas 4+1

| Vista | Qué documenta en este proyecto | Artefacto |
|-------|----------------------------------|-----------|
| **Lógica** | Las abstracciones del dominio (entidades, value objects, relaciones) y los servicios que orquestan los casos de uso. | `diagrama-clases.puml` |
| **De procesos** | Cómo colaboran los objetos en tiempo de ejecución para completar un caso de uso, incluyendo el flujo condicional (p. ej. aplicar o no un descuento). | `secuencia-crear-reserva.puml`, `secuencia-cancelar-reserva.puml` |
| **De desarrollo** | El repositorio es un **monorepo** con dos paquetes (`apps/backend`, `apps/frontend`). Dentro de `apps/backend`, el código se organiza en capas con responsabilidades separadas: `domain/` (entidades puras, sin dependencias externas), `application/` (servicios que implementan los casos de uso), `infrastructure/` (adaptadores de persistencia, aquí repositorios en memoria) y `api/` (adaptador HTTP con Express que expone `application/` como REST). Esta separación permite sustituir la persistencia en memoria por una base de datos real, o el adaptador HTTP por otro protocolo, sin tocar el dominio. | Estructura de carpetas `apps/backend/src/` (ver `README.md`) |
| **Física** | Alcance del curso: `apps/backend` corre como un único proceso Node.js que expone la API REST; `apps/frontend` es una SPA estática servida por separado y consume esa API por HTTP. No hay distribución entre múltiples nodos ni bases de datos externas. | — (justificación textual, no aplica diagrama de despliegue separado dado el alcance) |
| **De escenarios** | Los casos de uso que amarran las otras 4 vistas y validan que el diseño cubre los requisitos reales. | `diagrama-casos-uso.puml` |

## 4. Casos de uso

Ver `diagrama-casos-uso.puml`.

- **UC1 — Crear Reserva** (actor: Cliente): el cliente selecciona una cancha y una franja horaria;
  el sistema «include» **Verificar Disponibilidad** y, si la franja corresponde a un horario de baja
  demanda, «extend» **Aplicar Descuento por Horario**.
- **UC2 — Cancelar Reserva** (actores: Cliente, Administrador): «include» **Verificar Política de
  Cancelación** (antelación mínima) antes de permitir la cancelación.
- **UC3 — Registrar Cancha** (actor: Administrador): alta de una nueva cancha en el catálogo.

## 5. Diagrama de clases (inicial)

Ver `diagrama-clases.puml`. Resumen de las 8 clases/tipos de dominio:

`Usuario` (abstracta) — `Cliente` — `Administrador` — `Cancha` — `FranjaHoraria` — `Reserva` —
`EstadoReserva` (enum) — `EstrategiaTarifa` (interfaz + 3 implementaciones).

Multiplicidades clave: una `Reserva` pertenece a exactamente un `Cliente` y una `Cancha` (0..* → 1);
una `Reserva` compone exactamente una `FranjaHoraria` (agregación fuerte, 1 a 1).

## 6. Diagramas de secuencia

- `secuencia-crear-reserva.puml` — flujo completo de UC1, incluyendo el punto de decisión que activa
  la extensión de descuento y la selección de la estrategia de tarifa concreta.
- `secuencia-cancelar-reserva.puml` — flujo de UC2, incluyendo el camino alternativo cuando no se
  cumple la política de cancelación.

## 7. Patrón de diseño justificado: Strategy

**Problema:** el cálculo de la tarifa de una reserva depende de al menos dos factores independientes
(tipo de cancha y franja horaria) y de reglas de negocio que es previsible que cambien o crezcan
(nuevas promociones, tarifas por temporada). Resolverlo con una cadena de condicionales dentro de
`ReservaService` viola el principio Abierto/Cerrado (OCP): cada nueva política de precio obligaría a
modificar el método existente, con riesgo de romper las reglas ya probadas.

**Solución aplicada:** se define la interfaz `EstrategiaTarifa` con un único método
`calcular(cancha, franja): number`, implementada por `TarifaEstandar`, `TarifaHorarioPico` y
`TarifaPromocional`. `ReservaService` depende únicamente de la abstracción `EstrategiaTarifa` (Dependency
Inversion) y delega en ella el cálculo, en vez de conocer las reglas de cada tarifa.

**Beneficio:** agregar una nueva política de precio (p. ej. tarifa por temporada alta) es agregar una
clase nueva, sin tocar `ReservaService` ni las estrategias existentes — cumple OCP y facilita probar
cada política de tarifa de forma aislada.

> Nota de trazabilidad: en la Fase 2 (MVP funcional) el equipo implementa el cálculo de tarifa como
> una cadena de condicionales por razones de velocidad de entrega — es uno de los malos olores
> documentados en el informe de diagnóstico. La Fase 3 aplica el refactor **Replace Conditional with
> Strategy (R6)** para llevar el código al diseño aquí justificado.
