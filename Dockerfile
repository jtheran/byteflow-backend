# ==========================================
# ETAPA 1: Dependencias y Compilación
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependencias necesarias para compilar ciertos paquetes nativos si se requiere
RUN apk add --no-cache libc6-compat

# Copiar archivos de definición de paquetes y esquemas
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (incluyendo devDependencies para TypeScript)
RUN npm ci

# Copiar el resto del código fuente del backend
COPY . .

# Generar el cliente de Prisma en la ruta personalizada asignada en tu esquema
RUN npx prisma generate

# Compilar TypeScript a JavaScript nativo (muda el código a la carpeta /dist u otra según tu tsconfig)
RUN npm run build

# Limpiar devDependencies y dejar solo las de producción para ahorrar espacio
RUN npm prune --production

# ==========================================
# ETAPA 2: Entorno de Ejecución Final
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

# Seteamos el entorno a producción
ENV NODE_ENV=production

# Crear un usuario del sistema sin privilegios por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressapp

# Copiar el código compilado y las dependencias limpias desde la etapa builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# Copiamos la carpeta generada de Prisma para que los servicios la localicen sin problemas
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma 

# Cambiar la propiedad de los archivos al usuario seguro
USER expressapp

# Exponer el puerto en el que corre tu API de ByteFlow POS (Ajústalo si usas otro, ej: 4000)
EXPOSE 3000

# Comando para arrancar la aplicación
CMD ["node", "dist/app.js"]