
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias de producción y desarrollo
RUN npm ci

# =====================================================
# Stage 2: Build Application
# =====================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias de la etapa anterior
COPY --from=dependencies /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Limpiar dependencias de desarrollo
RUN npm prune --production

# =====================================================
# Stage 3: Production Image
# =====================================================
FROM node:20-alpine AS production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar archivos necesarios
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Crear directorio de logs
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "dist/main.js"]

# =====================================================
# Stage 4: Development Image (Opcional)
# =====================================================
FROM node:20-alpine AS development

WORKDIR /app

# Instalar dependencias de desarrollo
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto y puerto de debug
EXPOSE 3000 9229

# Variables de entorno de desarrollo
ENV NODE_ENV=development
ENV PORT=3000

# Comando de inicio con hot-reload
CMD ["npm", "run", "start:dev"]

# =====================================================
# NOTAS DE USO
# =====================================================
#
# Build para producción:
#   docker build --target production -t sales-api:latest .
#
# Build para desarrollo:
#   docker build --target development -t sales-api:dev .
#
# Run en producción:
#   docker run -p 3000:3000 --env-file .env sales-api:latest
#
# Run en desarrollo:
#   docker run -p 3000:3000 -v $(pwd)/src:/app/src sales-api:dev
#
# =====================================================
# OPTIMIZACIONES APLICADAS
# =====================================================
#
# ✓ Multi-stage build (reduce tamaño de imagen)
# ✓ Alpine Linux (imagen base pequeña)
# ✓ Usuario no-root (seguridad)
# ✓ .dockerignore (excluir archivos innecesarios)
# ✓ npm ci (instalación determinística)
# ✓ npm prune (eliminar deps de desarrollo)
# ✓ Health check integrado
# ✓ Layers cacheables (package.json primero)
#
# =====================================================