import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { createRoleWithPermissions, getAllPermissions, getRolesSummary, updateRolePermissions } from '../services/role.service';
import { sendSuccess } from '../utils/resp.util';

export const handleGetPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const permissions = await getAllPermissions();

    sendSuccess({
      res,
      req,
      action: "GET_ALL_AVAILABLE_PERMISSIONS",
      module: "ROLE_MANAGEMENT",
      statusCode: 200,
      message: 'Catálogo de permisos atómicos del sistema recuperado.',
      data: { user: { id, email }, permissions }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleCreateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const role = await createRoleWithPermissions(req.body);

    sendSuccess({
      res,
      req,
      action: "CREATE_ROLE_WITH_PERMISSIONS",
      module: "ROLE_MANAGEMENT",
      statusCode: 201,
      message: 'Rol corporativo e intermedia de permisos creados con éxito.',
      data: { user: { id, email }, role }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleUpdateRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const { id: roleId } = req.params as { id:string };

    const updatedRole = await updateRolePermissions(roleId, req.body.permissions);

    sendSuccess({
      res,
      req,
      action: "SYNC_ROLE_PERMISSIONS",
      module: "ROLE_MANAGEMENT",
      statusCode: 200,
      message: 'Matriz de permisos actualizada para el rol seleccionado.',
      data: { user: { id, email }, role: updatedRole }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleGetRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const roles = await getRolesSummary();

    sendSuccess({
      res,
      req,
      action: "GET_ROLES_AND_PERMISSIONS_SUMMARY",
      module: "ROLE_MANAGEMENT",
      statusCode: 200,
      message: 'Listado completo de roles con conteo de operarios activos.',
      data: { user: { id, email }, roles }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};