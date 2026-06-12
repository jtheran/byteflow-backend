import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';
import { sendSuccess } from '../utils/resp.util';
import createHttpError, { CreateHttpError } from 'http-errors';


export const handleCreateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || 'system';
    const userEmail = (req as any).user?.email || 'unknown@byteforge.com';

    const product = await productService.createProduct(req.body, userId, userEmail);

    sendSuccess({
      res, 
      req,
      action: "CREATE_NEW_PRODUCT",
      module: "PRODUCT", 
      statusCode: 201, 
      message: 'Producto creado de manera exitosa en el inventario.', 
      data: {
        user: {
            id: userId,
            email: userEmail
        },
        product
     }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleGetProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const result = await productService.getAllProducts(page, limit, search);

    sendSuccess({
      res, 
      req,
      action: "GET_PRODUCTS",
      module: "PRODUCT",  
      statusCode: 200, 
      message: 'Listado de productos recuperado correctamente.', 
      data: result
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleFindProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier } = req.params as { identifier: string };
    const userId = (req as any).user?.id || 'system';
    const userEmail = (req as any).user?.email || 'unknown@byteforge.com';

    const product = await productService.getProductBySkuOrId(identifier);

    sendSuccess({
      res, 
      req,
      action: "GET_PRODUCT",
      module: "PRODUCT",  
      statusCode: 200, 
      message: 'Producto localizado.', 
      data: {
        user: {
            id: userId,
            email: userEmail
        },
        product
     }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleUpdateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id:string };
      const updated = await productService.updateProduct(id, req.body);
  
      sendSuccess({
        res, 
        req,
        action: "UPDATE_PRODUCT",
        module: "PRODUCT", 
        statusCode: 200, 
        message: 'Producto actualizado exitosamente.', 
        data: updated
      });
    } catch (error) {
        next(createHttpError(500, `${error}`));
    }
  };
  
  export const handleToggleProductStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string};
      const { isActive } = req.body; // Se espera un booleano: true o false
  
      const updated = await productService.changeProductStatus(id, isActive);
      const actionText = isActive ? 'activado' : 'desactivado';
  
      sendSuccess({
        res, 
        req,
        action: "STATUS_PRODUCT",
        module: "PRODUCT",  
        statusCode: 200, 
        message: `Producto ${actionText} correctamente para el catálogo.`, 
        data: updated
      });
    } catch (error) {
        next(createHttpError(500, `${error}`));
    }
  };