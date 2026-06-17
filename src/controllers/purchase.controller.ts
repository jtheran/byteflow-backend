import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { processPurchase } from '../services/purchase.service';
import { sendSuccess } from '../utils/resp.util';

export const handleCreatePurchase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    
    const purchase = await processPurchase(req.body, id, email);

    sendSuccess({
      res,
      req,
      action: "PROCESS_SUPPLIER_PURCHASE",
      module: "PURCHASE",
      statusCode: 201,
      message: 'Compra registrada y stock actualizado correctamente.',
      data: {
        user: { id, email },
        purchase
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};