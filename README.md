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

## Estructura del repositorio

```
docs/
  fase1-diseno-uml/        Documento de diseño 4+1 y diagramas UML (PlantUML)
  fase2-diagnostico/       Informe de malos olores identificados en el código base
  fase3-refactorizacion/   Informe final de refactorización y diagrama de clases actualizado
src/
  domain/                  Entidades y value objects del dominio
  application/             Servicios de aplicación (casos de uso)
  infrastructure/          Repositorios en memoria
  demo/                    Script de demostración por consola
tests/                     Suite de pruebas unitarias (Jest)
```

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Pruebas

```bash
npm test
```

## Demo por consola

Ejecuta el flujo completo de los 3 casos de uso principales:

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
