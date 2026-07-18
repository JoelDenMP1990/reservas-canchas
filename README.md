# 🧾 ProyectoVenta
### Sistema de Gestión Comercial
Sistema profesional de gestión de ventas desarrollado con arquitectura moderna, enfocado en seguridad, escalabilidad y buenas prácticas.
## 🚀 Características
- ✅ Gestión de usuarios con roles y permisos
- ✅ Gestión de clientes
- ✅ Gestión de productos
- ✅ Control de inventario con stock mínimo
- ✅ Ventas
- ✅ Proformas
- ✅ Historial de precios
- ✅ Auditoría de acciones
- ✅ Seguridad avanzada (JWT, Guards, Interceptors)
- ✅ Dockerización
## 🏗️ Arquitectura del Proyecto

PROYECTO-VENTA
│
├── FRONTEND-VENTA → Angular
└── backend-venta → NestJS

## 🖥️ Frontend

- Angular
- Arquitectura modular
- Guards de autenticación
- Interceptores HTTP
- Componentes reutilizables

## ⚙️ Backend

- NestJS
- TypeORM
- PostgreSQL
- JWT Authentication
- Control de roles
- Auditoría de eventos

## 📦 Instalación

### 1️⃣ Clonar repositorio

```bash
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
Autenticación JWT

Roles y permisos

Middleware de seguridad

Registro de auditoría

🐳 Docker
docker-compose up --build
👨‍💻 Autor
Joel Moran
Desarrollador Full Stack

📄 Licencia
Proyecto privado.

