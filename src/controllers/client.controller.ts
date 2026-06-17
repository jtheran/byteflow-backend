import { Request, Response, NextFunction } from 'express';
import { changeClientStatus, createClient, getAllClients, getClientByIdOrDocument, updateClient } from '../services/client.service';
import { sendSuccess } from '../utils/resp.util';
import createHttpError from 'http-errors';

export const handleCreateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string }
    const client = await createClient(req.body);
    sendSuccess({ 
      res, 
      req,
      action: "CREATE_NEW_CLIENT",
      module: "CLIENT", 
      statusCode: 201, 
      message: 'Cliente registrado exitosamente.', 
      data: {
        user: {
          id,
          email,
        },
        client 
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleGetClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const clients = await getAllClients(page, limit, search);
    sendSuccess({ 
      res, 
      req,
      action: "GET_CLIENTS",
      module: "CLIENT",  
      statusCode: 200, 
      message: 'Listado de clientes recuperado.', 
      data: {
        user: {
          id,
          email,
        },
        clients
      } 
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleFindClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string }
    const { identifier } = req.params as { identifier: string}; 
    const client = await getClientByIdOrDocument(identifier);
    sendSuccess({ 
      res, 
      req,
      action: "GET_CLIENT",
      module: "CLIENT",   
      statusCode: 200, 
      message: 'Cliente localizado.', 
      data: {
        user: {
          id,
          email,
        },
        client
      } 
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleUpdateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string};
    const { email = "unknow@byteforge.com" } = req.user as { email: string }
    const client = await updateClient(id, req.body);
    sendSuccess({ 
      res, 
      req,
      action: "UPDATE_CLIENT",
      module: "CLIENT",
      statusCode: 200, 
      message: 'Datos del cliente actualizados.', 
      data: {
        user: {
          id,
          email,
        },
        client
      } 
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleSoftDeleteClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string};
    const { email = "unknow@byteforge.com" } = req.user as { email: string }
    const client = await changeClientStatus(id, false);
    sendSuccess({ 
      res, 
      req,
      action: "DELETE_CLIENT",
      module: "CLIENT", 
      statusCode: 200, 
      message: 'Cliente dado de baja lógicamente en el POS.', 
      data: {
        user: {
          id,
          email,
        },
        client
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};