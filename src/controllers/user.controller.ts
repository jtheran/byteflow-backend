import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { changeUserStatus, createUser, getAllUsers, updateUser } from '../services/user.service';
import { sendSuccess } from '../utils/resp.util';

export const handleCreateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const newUser = await createUser(req.body);

    sendSuccess({
      res,
      req,
      action: "CREATE_NEW_USER_ACCOUNT",
      module: "USER",
      statusCode: 201,
      message: 'Cuenta de usuario creada con éxito en el POS.',
      data: {
        user: { id, email },
        newUser
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleGetUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const result = await getAllUsers(page, limit, search);

    sendSuccess({
      res,
      req,
      action: "GET_USERS_LIST",
      module: "USER",
      statusCode: 200,
      message: 'Listado de usuarios activos recuperado correctamente.',
      data: {
        user: { id, email },
        ...result
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleUpdateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const { id: targetUserId } = req.params as { id:string };

    const updatedUser = await updateUser(targetUserId, req.body);

    sendSuccess({
      res,
      req,
      action: "UPDATE_USER_ACCOUNT_DATA",
      module: "USER",
      statusCode: 200,
      message: 'Información del perfil actualizada exitosamente.',
      data: {
        user: { id, email },
        updatedUser
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleSoftDeleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const { id: targetUserId } = req.params as { id:string };

    const disabledUser = await changeUserStatus(targetUserId, false);

    sendSuccess({
      res,
      req,
      action: "SOFT_DELETE_USER_ACCOUNT",
      module: "USER",
      statusCode: 200,
      message: 'Usuario desactivado e inhabilitado para operar en el POS.',
      data: {
        user: { id, email },
        disabledUser
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};