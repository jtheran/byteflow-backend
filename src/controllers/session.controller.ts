import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { closeSession, getCurrentSessionStatus, openSession } from '../services/session.service';
import { sendSuccess } from '../utils/resp.util';

export const handleOpenSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const { initialBalance, notes } = req.body;

    const session = await openSession(id, initialBalance, notes);

    sendSuccess({
      res,
      req,
      action: "OPEN_CASH_REGISTER_SESSION",
      module: "CASH_CONTROL",
      statusCode: 201, // 201 Created
      message: 'Apertura de caja registrada con éxito. Ya puedes procesar ventas.',
      data: {
        user: { id, email },
        session
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleCloseSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const { actualBalance, notes } = req.body;

    const closedSession = await closeSession(id, actualBalance, notes);

    sendSuccess({
      res,
      req,
      action: "CLOSE_CASH_REGISTER_SESSION",
      module: "CASH_CONTROL",
      statusCode: 200,
      message: 'Arqueo y cierre de caja finalizado correctamente.',
      data: {
        user: { id, email },
        session: closedSession
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleGetCurrentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    
    const status = await getCurrentSessionStatus(id);

    sendSuccess({
      res,
      req,
      action: "GET_CURRENT_CASH_SESSION_STATUS",
      module: "CASH_CONTROL",
      statusCode: 200,
      message: 'Estado de la caja del turno actual consultado.',
      data: {
        user: { id, email },
        ...status
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};