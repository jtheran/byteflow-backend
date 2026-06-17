import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { changeCategoryStatus, createCategory, getAllCategories, updateCategory } from '../services/category.service';
import { sendSuccess } from '../utils/resp.util';

export const handleCreateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const category = await createCategory(req.body);

    sendSuccess({
      res,
      req,
      action: "CREATE_NEW_CATEGORY",
      module: "CATEGORY",
      statusCode: 201,
      message: 'Categoría creada de manera exitosa.',
      data: {
        user: { id, email },
        category
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleGetCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const result = await getAllCategories(page, limit, search);

    sendSuccess({
      res,
      req,
      action: "GET_CATEGORIES_LIST",
      module: "CATEGORY",
      statusCode: 200,
      message: 'Listado de categorías recuperado correctamente.',
      data: {
        user: { id, email },
        ...result
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleUpdateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const { id: categoryId } = req.params as { id: string };

    const category = await updateCategory(categoryId, req.body);

    sendSuccess({
      res,
      req,
      action: "UPDATE_CATEGORY_DATA",
      module: "CATEGORY",
      statusCode: 200,
      message: 'Categoría actualizada correctamente.',
      data: {
        user: { id, email },
        category
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleSoftDeleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const { id: categoryId } = req.params as { id: string };

    const category = await changeCategoryStatus(categoryId, false);

    sendSuccess({
      res,
      req,
      action: "SOFT_DELETE_CATEGORY",
      module: "CATEGORY",
      statusCode: 200,
      message: 'Categoría desactivada del catálogo del POS.',
      data: {
        user: { id, email },
        category
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};