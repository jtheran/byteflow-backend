import express, { Application, Request, Response } from 'express';
import { corsMiddleware } from './config/cors.config';
import { helmetMiddleware, obfuscateHeadersMiddleware } from './config/helmet.config';
import { errorHandler } from './middlewares/error.middleware';
import prisma from './config/db.config';
import { apiLimiter } from './middlewares/security.middleware';
import hpp from 'hpp';
// @ts-ignore
import xss from 'xss-clean';

//Importacion de Documentacion
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger.config';

//Importacion de Rutas
import authRoutes from './routes/auth.route';
import auditRoutes from './routes/audit.route';

const app: Application = express();

// Middlewares Globales de Seguridad y Parseo
app.disable('x-powered-by');
app.use(helmetMiddleware());
app.use(obfuscateHeadersMiddleware); 
app.use(corsMiddleware());
app.use(apiLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(xss());
app.use(hpp());
app.use('/assets', express.static('public'));
app.use('/auth', authRoutes);
app.use('/audit', auditRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      explorer: true,
      customSiteTitle: 'ByteFlow API',
      customfavIcon: '/assets/favicon.ico',
      customCssUrl: '/assets/theme.css',
      customCss: `
      .swagger-ui .topbar {
        background-color: #0F172A;
      }

      .swagger-ui .topbar-wrapper img {
        display: none;
      }

      .swagger-ui .topbar-wrapper::before {
        content: '';
        display: block;
        width: 180px;
        height: 50px;
        background-image: url('/assets/logo.png');
        background-repeat: no-repeat;
        background-size: contain;
      }
    `,
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        displayRequestDuration: true,
      },
    })
  )

// Ruta Base de Prueba (Health Check)
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Intenta hacer un conteo rápido en la tabla roles para validar conexión
    const rolesCount = await prisma.role.count();

    res.status(200).json({
      status: 'success',
      message: 'ByteFlow API & Prisma están listos 🚀',
      database: 'Connected ✅',
      registeredRoles: rolesCount,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al conectar con la Base de Datos',
      error: error instanceof Error ? error.message : error
    });
  }
});

app.use(errorHandler);

export default app;