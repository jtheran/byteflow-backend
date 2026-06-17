// src/controllers/supplier.controller.ts
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { changeSupplierStatus, createSupplier, getAllSuppliers, updateSupplier } from '../services/supplier.service';
import { sendSuccess } from '../utils/resp.util';

export const handleCreateSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const supplier = await createSupplier(req.body);

    sendSuccess({
      res,
      req,
      action: "CREATE_NEW_SUPPLIER",
      module: "SUPPLIER",
      statusCode: 201,
      message: 'Proveedor registrado exitosamente en el sistema.',
      data: {
        user: { id, email },
        supplier
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleGetSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const result = await getAllSuppliers(page, limit, search);

    sendSuccess({
      res,
      req,
      action: "GET_SUPPLIERS_LIST",
      module: "SUPPLIER",
      statusCode: 200,
      message: 'Listado de proveedores recuperado.',
      data: {
        user: { id, email },
        ...result
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleUpdateSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const { id: supplierId } = req.params as { id: string };

    const supplier = await updateSupplier(supplierId, req.body);

    sendSuccess({
      res,
      req,
      action: "UPDATE_SUPPLIER_DATA",
      module: "SUPPLIER",
      statusCode: 200,
      message: 'Información del proveedor actualizada correctamente.',
      data: {
        user: { id, email },
        supplier
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleSoftDeleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const { id: supplierId } = req.params as { id: string };

    const supplier = await changeSupplierStatus(supplierId, false);

    sendSuccess({
      res,
      req,
      action: "SOFT_DELETE_SUPPLIER",
      module: "SUPPLIER",
      statusCode: 200,
      message: 'Proveedor dado de baja lógicamente en la plataforma.',
      data: {
        user: { id, email },
        supplier
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};