# ⚡ ByteFlow POS — Backend Core

¡Bienvenido al motor central de **ByteFlow POS**! Este es un sistema de Punto de Venta (POS) modular de alta velocidad y grado empresarial, desarrollado por **ByteForge**. La plataforma está diseñada bajo una arquitectura limpia por capas globales utilizando **Node.js**, **TypeScript**, **Express** y **Prisma ORM** con soporte nativo para colas de mensajería asíncronas y auditoría automatizada.

---

## 🚀 Características Principales

* **Arquitectura por Capas Centralizadas:** Separación estricta de responsabilidades (Rutas, Middlewares, Controladores, Schemas de Validación, Servicios y Capa de Datos).
* **Validación de Datos en la Entrada:** Esquemas estrictos con **Zod** acoplados a un middleware interceptor global.
* **Pipeline de Mensajería Asíncrona:** Integración de alta prioridad con **BullMQ + Redis** para el despacho de contenido multimedia y texto vía WhatsApp sin bloquear el hilo principal de ejecución.
* **Monitoreo en Tiempo Real:** Interfaz gráfica integrada mediante **Bull Board** para auditar y gestionar las colas de datos activas y fallidas.
* **Kárdex de Inventario Automatizado:** Registro transaccional obligatorio en base de datos (`StockMovement`) para cada alteración física del stock de productos.
* **Diseño de Datos Resiliente:** Uso exclusivo del tipo de datos `Decimal` para precisión contable exacta y estrategia de `Soft-Delete` (eliminación lógica) para preservar el histórico de reportes.
* **Documentación Interactiva:** Especificación completa de la API con **Swagger / OpenAPI 3.0** estructurada en subficheros YAML para máxima legibilidad.

---

## 🛠️ Stack Tecnológico

* **Runtime:** Node.js (v18+ recomendado)
* **Lenguaje:** TypeScript
* **Framework Web:** Express
* **ORM:** Prisma (PostgreSQL)
* **Gestión de Colas:** BullMQ & Redis
* **Validación:** Zod
* **Monitoreo:** Bull Board
* **Documentación:** Swagger (YAML)

---

## 📂 Estructura del Proyecto

El código fuente se organiza bajo un patrón clásico centralizado por capas globales:

```text
byteflow-backend/
├── core/
│   └── prisma/
│       ├── schema.prisma        # Modelos relacionales de la base de datos
│       └── migrations/          # Historial de migraciones de base de datos
├── src/
│   ├── config/                  # Inicialización de bases de datos, Redis y variables globales
│   ├── controllers/             # Manejadores de peticiones HTTP y control de flujos
│   ├── docs/                    # Documentación externa OpenAPI 3.0 en formato YAML
│   │   ├── routes/              # Subcarpetas YAML para endpoints por contexto
│   │   └── schemas/             # Subcarpetas YAML para tipados y esquemas de Swagger
│   ├── middlewares/             # Interceptores de peticiones (Autenticación, Validación, Errores)
│   ├── routes/                  # Autopistas de endpoints de Express
│   ├── schemas/                 # Reglas de validación en tiempo de ejecución (Zod)
│   ├── services/                # Lógica pura de negocio e interacción con Prisma ORM
│   ├── utils/                   # Clases y funciones auxiliares estandarizadas
│   ├── app.ts                   # Configuración del servidor Express
│   └── index.ts                 # Punto de entrada del sistema
├── .env.example                 # Plantilla de variables de entorno
├── tsconfig.json                # Configuración del compilador de TypeScript
└── package.json                 # Dependencias y scripts del proyecto

⚙️ Configuración del Entorno de Desarrollo
1. Prerrequisitos
Asegúrate de tener corriendo en tu entorno (o mediante contenedores Docker):

Un servidor de PostgreSQL activo.

Una instancia de Redis (para BullMQ).

El contenedor del motor de mensajería OpenWA (si usas el pipeline de notificaciones).

2. Variables de Entorno
Crea un archivo .env en la raíz del proyecto basándote en .env.example:

Fragmento de código
PORT=4000
NODE_ENV=development

# Configuración de Base de Datos (PostgreSQL)
DATABASE_URL="postgresql://usuario:password@localhost:5432/byteflow_pos?schema=public"

# Configuración de Mensajería y Caché (Redis)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Configuración de Servicios Externos
OPENWA_API_URL="http://localhost:8080"
3. Instalación y Migraciones
Ejecuta los siguientes comandos en tu terminal de Windows/PowerShell o terminal Linux:

Bash
# Instalar dependencias del proyecto
npm install

# Sincronizar el esquema de Prisma con PostgreSQL y generar el cliente nativo
npx prisma migrate dev
🏃‍♂️ Scripts Disponibles
En el directorio del proyecto puedes ejecutar:

npm run dev: Levanta el servidor en entorno de desarrollo con recarga automática mediante nodemon/ts-node.

npm run build: Compila el código de TypeScript a JavaScript plano dentro de la carpeta dist/.

npm start: Ejecuta el código compilado en entornos de producción (node dist/index.js).

🛣️ Endpoints Principales y Rutas del Sistema
Una vez encendido el backend, dispondrás de los siguientes accesos clave:

Documentación Interactiva: http://localhost:4000/api-docs (Swagger UI)

Monitoreo de Colas Asíncronas: http://localhost:4000/api/v1/admin/queues (Tablero Bull Board)

Catálogo de Productos: /api/v1/products

Gestión de Clientes: /api/v1/clients

🛠️ Contribución y Desarrollo
Saca una rama (feature/nueva-funcionalidad) a partir de main o develop.

Si realizas cambios en el modelo de datos, actualiza schema.prisma y corre npx prisma migrate dev --name <descripcion_cambio>.

Documenta tus nuevos endpoints en los archivos YAML correspondientes dentro de src/docs/.

Abre un Pull Request describiendo detalladamente los cambios.

Developed with ⚡ by ByteForge — 2026.