import { Response, Request } from 'express';
import { createAuditLog } from '../services/audit.service'; 

interface ISendResponse {
  res: Response;
  req: Request;
  statusCode?: number;
  message: string;
  data?: any;
  action: string;
  module: string;
}

export const sendSuccess = ({ res, req, action, module, statusCode = 200, message, data }: ISendResponse): void => {
  createAuditLog({
    userId: data.user.id,
    userEmail: data.user.email,
    action,
    module,
    description: message,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    statusCode,
  });

  res.status(statusCode).json({
    status: 'success',
    statusCode,
    message,
    ...(data && { data }),
  });
};