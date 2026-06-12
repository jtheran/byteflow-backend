import { Request, Response, NextFunction } from 'express';
import { changeClientStatus, createClient, getAllClients, getClientByIdOrDocument, updateClient } from '../services/client.service';
import { sendSuccess } from '../utils/resp.util';

export const handleCreateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await createClient(req.body);
    sendSuccess({ res, req, statusCode: 201, message: 'Cliente registrado exitosamente.', data: client });
  } catch (error) {
    next(error);
  }
};

export const handleGetClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const result = await getAllClients(page, limit, search);
    sendSuccess({ res, req, statusCode: 200, message: 'Listado de clientes recuperado.', data: result });
  } catch (error) {
    next(error);
  }
};

export const handleFindClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier } = req.params; // Puede ser UUID o Cédula/NIT crudo
    const client = await getClientByIdOrDocument(identifier);
    sendSuccess({ res, req, statusCode: 200, message: 'Cliente localizado.', data: client });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updated = await updateClient(id, req.body);
    sendSuccess({ res, req, statusCode: 200, message: 'Datos del cliente actualizados.', data: updated });
  } catch (error) {
    next(error);
  }
};

export const handleSoftDeleteClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await changeClientStatus(id, false);
    sendSuccess({ res, req, statusCode: 200, message: 'Cliente dado de baja lógicamente en el POS.', data: deleted });
  } catch (error) {
    next(error);
  }
};