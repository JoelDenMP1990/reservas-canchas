🧾 ProyectoVenta – Sistema de Gestión Comercial

Sistema profesional de gestión de ventas desarrollado con arquitectura moderna, enfocado en seguridad, escalabilidad y buenas prácticas.

Incluye:

✅ Gestión de usuarios con roles y permisos

✅ Gestión de clientes

✅ Gestión de productos

✅ Control de inventario con stock mínimo

✅ Ventas

✅ Proformas

✅ Historial de precios

✅ Auditoría de acciones

✅ Seguridad avanzada (JWT, Guards, Interceptors)

✅ Dockerización

🏗️ Arquitectura del Proyecto
PROYECTO-VENTA
│
├── FRONTEND-VENTA     → Angular
└── backend-venta      → NestJS

🔹 Frontend

Angular

Arquitectura modular

Guards de autenticación y roles

Interceptores HTTP

Manejo de estados de carga

Componentes reutilizables

🔹 Backend

NestJS

TypeORM

JWT Authentication

Roles & Guards

Auditoría de eventos

Middleware de seguridad

Docker support

🚀 Tecnologías Utilizadas
Frontend

Angular

TypeScript

SCSS

Backend

NestJS

Node.js

TypeScript

PostgreSQL

TypeORM

JWT

Docker

⚙️ Instalación y Ejecución
1️⃣ Clonar repositorio
git clone https://github.com/JoelDenMP1990/ProyectoVenta.git
cd ProyectoVenta

2️⃣ Backend
cd backend-venta
npm install
npm run start:dev

3️⃣ Frontend
cd FRONTEND-VENTA
npm install
ng serve


Abrir en navegador:

http://localhost:4200

🔐 Seguridad

El sistema implementa:

Autenticación con JWT

Control de acceso basado en roles

Interceptores de transformación y logging

Middleware de seguridad

Protección contra ataques comunes

Auditoría de acciones del sistema

🐳 Docker

El backend incluye soporte Docker:

docker-compose up --build

📊 Funcionalidades Principales

Dashboard con métricas

Gestión completa de ventas

Proformas convertibles en ventas

Control de inventario automático

Historial de precios

Gestión de usuarios y roles

Registro de auditoría

📦 Versión

v1.0.0 – Sistema base estable

👨‍💻 Autor

Joel Moran
Desarrollador Full Stack

📄 Licencia

Proyecto privado. Uso comercial restringido.
