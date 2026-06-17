import express, { Application, Request, Response } from 'express';
import { corsMiddleware } from './config/cors.config';
import { helmetMiddleware, obfuscateHeadersMiddleware } from './config/helmet.config';
import { errorHandler } from './middlewares/error.middleware';
import { apiLimiter } from './middlewares/security.middleware';
import { xssSanitizer } from './middlewares/xss.middleware';
import hpp from 'hpp';

//Importacion de Documentacion
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger.config';

//Importacion de Rutas
import adminRoutes from './routes/admin.route';
import testRoutes from './routes/test/test.route.spec';
import authRoutes from './routes/auth.route';
import auditRoutes from './routes/audit.route';
import ModuleRoutes from './routes/modules.route';


const app: Application = express();

// Middlewares Globales de Seguridad y Parseo
app.disable('x-powered-by');
app.use(helmetMiddleware());
app.use(obfuscateHeadersMiddleware); 
app.use(corsMiddleware());
app.use(apiLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use('/assets', express.static('public'));
app.use(hpp());
app.use(xssSanitizer);

// Rutas
app.use('/test', testRoutes);
app.use('/auth', authRoutes);
app.use('/audit', auditRoutes);
app.use('/admin', adminRoutes);
app.use('/module', ModuleRoutes);
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


app.use(errorHandler);

export default app;