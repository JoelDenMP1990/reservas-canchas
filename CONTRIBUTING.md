# Guía de colaboración

Esta guía es para cualquier integrante del equipo que vaya a trabajar con **editor + terminal**
(no hace falta ninguna herramienta especial). Sigue estos pasos en orden, una sola vez para
configurar tu copia local, y luego cada vez que quieras aportar un cambio.

> **Repo activo:** `https://github.com/JoelDenMP1990/reservas-canchas` — clónalo desde ahí.

## 0. Requisitos previos

- Tener Git instalado (`git --version` para comprobarlo).
- Tener cuenta en GitHub y haber sido agregado/a como colaborador del repositorio (te llega una
  invitación por correo o notificación en GitHub — acéptala).
- Node.js 18+ y PostgreSQL instalados localmente si vas a correr el proyecto (ver `README.md`).

## 1. Clonar el repositorio (solo la primera vez)

```bash
git clone https://github.com/JoelDenMP1990/reservas-canchas.git
cd reservas-canchas
```

## 2. Configurar tu identidad de Git (solo la primera vez, por proyecto)

**Importante:** usa `--local` (sin `--global`) para que esta identidad aplique solo a este
repositorio y no pise la configuración que uses en tus otros proyectos.

```bash
git config --local user.name "Tu Nombre Completo"
git config --local user.email "el-email-con-el-que-tienes-cuenta-en-github@ejemplo.com"
```

El email debe ser el mismo con el que tienes cuenta en GitHub (o uno verificado en tu cuenta),
para que el commit quede vinculado a tu perfil y no aparezca como "Unknown author" en el
historial. Verifica que quedó bien:

```bash
git config --local user.name
git config --local user.email
```

## 3. Crear tu rama de trabajo

Nunca trabajes directo sobre `main` (está protegida, no vas a poder pushear ahí de todos modos).
Antes de crear tu rama, asegúrate de partir desde la versión más reciente:

```bash
git checkout main
git pull origin main
git checkout -b feature/tu-nombre-tarea
```

Convención de nombre: `feature/tu-nombre-tarea-corta`, todo en minúsculas, palabras separadas
por guiones. Ejemplos:

- `feature/maria-tests-cancha`
- `feature/carlos-listar-reservas-cliente`

## 4. Hacer tus cambios y confirmar (commit)

Edita el código con tu editor de preferencia. Luego:

```bash
git status                     # revisa qué archivos cambiaste
git add ruta/al/archivo.ts     # agrega los archivos específicos que modificaste
git commit -m "tipo(alcance): descripción corta del cambio"
```

Ejemplos de mensajes de commit siguiendo el estilo del proyecto:

- `test(cancha): agregar pruebas de validación de tarifa negativa`
- `feat(reservas): agregar endpoint para listar reservas por cliente`
- `fix(frontend): corregir mensaje de error al cancelar reserva`

## 5. Subir tu rama

```bash
git push -u origin feature/tu-nombre-tarea
```

La primera vez que hagas push, la terminal te va a pedir tus credenciales de GitHub. Si te pide
usuario/contraseña y falla, usa un **Personal Access Token** propio (GitHub → Settings → Developer
settings → Personal access tokens, scope `repo`) como contraseña en vez de tu contraseña real.

## 6. Abrir el Pull Request (PR)

1. Entra a `https://github.com/JoelDenMP1990/reservas-canchas`.
2. GitHub suele mostrar un botón **Compare & pull request** para la rama que acabas de subir.
3. Rama base: `main`. Rama de comparación: la tuya (`feature/tu-nombre-tarea`).
4. Escribe un título y una breve descripción de qué hiciste y por qué.
5. Click en **Create pull request**.

## 7. Qué pasa después

- El pipeline de CI corre automáticamente (`analyze`, `sec-secrets`, `sec-npm-audit`, `test`,
  `build`). Debe quedar en verde.
- Se necesita 1 aprobación de un *code owner* (ver `.github/CODEOWNERS`) para poder mergear.
- Una vez mergeado, tu commit queda permanentemente en el historial de `main` con tu nombre y
  tu email — esa es tu evidencia de participación individual para la rúbrica.

## Reglas rápidas

- **Nunca hagas `git push` directo a `main`.** `main` está protegida técnicamente en GitHub: el
  push directo, el force-push y el borrado de la rama están bloqueados por reglas de protección de
  rama, no solo por acuerdo de equipo. Todo cambio, sin excepción, va por rama + Pull Request.
- Un commit por cambio lógico, no un commit gigante con todo mezclado.
- Antes de empezar una tarea nueva, siempre `git checkout main && git pull origin main` antes de
  crear la rama, para partir de la última versión.
- Si tu rama tarda varios días y `main` avanzó, actualiza la tuya con
  `git checkout feature/tu-rama && git merge main` antes de pedir el PR, para evitar conflictos
  grandes al final.
