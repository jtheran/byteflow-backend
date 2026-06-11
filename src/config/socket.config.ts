// src/config/socket.config.ts
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import jwt from 'jsonwebtoken';
import config from './config';
import { corsMiddleware } from './cors.config';
import redisClient from './redis.config';

let io: Server;

export const initSocketServer = (httpServer: HttpServer): Server => {
  // Creamos un cliente duplicado de Redis específico para el manejo de sub/pub de Sockets
  const pubClient = redisClient;
  const subClient = redisClient.duplicate();

  io = new Server(httpServer, {
    cors: corsMiddleware
  });

  // Acoplamos el adaptador de Redis
  io.adapter(createAdapter(pubClient, subClient));

  // MIDDLEWARE DE SEGURIDAD: Blindamos la conexión WebSocket exigiendo el JWT
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];

    if (!token) {
      return next(new Error('Acceso denegado: Token de autenticación no proporcionado.'));
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string; role: string };
      // Inyectamos los datos del usuario autenticado directamente en el canal del socket
      (socket as any).user = decoded;
      next();
    } catch (err) {
      return next(new Error('Acceso denegado: Token inválido o expirado.'));
    }
  });

  // Conexión exitosa
  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`🔌 [WebSocket]: Usuario conectado [ID: ${user.id}] con Rol [${user.role}]`);

    // Unimos al usuario a una "sala" exclusiva con su ID. 
    // Esto nos permitirá enviarle notificaciones push directas e individuales.
    socket.join(`user:${user.id}`);

    // También lo unimos a una sala según su rol (ej: sala 'ADMIN') para alertas grupales
    socket.join(`role:${user.role}`);

    socket.on('disconnect', () => {
      console.log(`❌ [WebSocket]: Usuario [ID: ${user.id}] se ha desconectado.`);
    });
  });

  return io;
};

// Exportamos una función flecha segura para obtener la instancia global de IO desde cualquier servicio
export const getSocketInstance = (): Server => {
  if (!io) {
    throw new Error('Socket.io no ha sido inicializado en la plataforma.');
  }
  return io;
};