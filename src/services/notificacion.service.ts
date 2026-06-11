import { getSocketInstance } from '../config/socket.config';

interface INotificationPayload {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  metadata?: Record<string, any>;
}

// 1. Enviar notificación push a TODOS los usuarios conectados en la plataforma
export const sendNotificationToAll = (payload: INotificationPayload): void => {
  const io = getSocketInstance();
  io.emit('notification:push', {
    ...payload,
    createdAt: new Date()
  });
  console.log('notificacion push emitida')
};

// 2. Enviar notificación push únicamente a un rol específico (ej: solo Cajeros o solo Admins)
export const sendNotificationToRole = (role: string, payload: INotificationPayload): void => {
  const io = getSocketInstance();
  io.to(`role:${role}`).emit('notification:push', {
    ...payload,
    createdAt: new Date()
  });
};

// 3. Enviar notificación push ultra-específica a un solo usuario por su ID
export const sendNotificationToUser = (userId: string, payload: INotificationPayload): void => {
  const io = getSocketInstance();
  io.to(`user:${userId}`).emit('notification:push', {
    ...payload,
    createdAt: new Date()
  });
};