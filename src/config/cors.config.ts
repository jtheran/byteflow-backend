import cors from 'cors';

const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
    'https://admin.byteflowpos.com',
    'https://cajero.byteflowpos.com'
    ]
  : [
    'http://localhost:3000', 
    'http://localhost:5842'
    ];

export const corsMiddleware = () => {
  return cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Bloqueado por políticas CORS de ByteFlow de alta seguridad.'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // Cache de preflight por 24 horas
  });
};