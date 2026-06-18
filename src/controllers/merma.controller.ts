import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { getExpiredProductsAlerts, processStockAdjustment } from '../services/merma.service';
import { sendSuccess } from '../utils/resp.util';

export const handleCreateAdjustment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    
    const result = await processStockAdjustment(req.body, id, email);

    sendSuccess({
      res,
      req,
      action: req.body.type === 'MERMA' ? "RECORD_INVENTORY_WASTE_MERMA" : "MANUAL_STOCK_ADJUSTMENT",
      module: "INVENTORY_CONTROL",
      statusCode: 201,
      message: 'Movimiento de ajuste de inventario aplicado y auditado con éxito.',
      data: {
        user: { id, email },
        ...result
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleGetExpiredAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    
    const expiredProducts = await getExpiredProductsAlerts();

    sendSuccess({
      res,
      req,
      action: "GET_EXPIRED_PRODUCTS_REPORT",
      module: "INVENTORY_CONTROL",
      statusCode: 200,
      message: 'Reporte de productos vencidos generado para auditoría de mermas.',
      data: {
        user: { id, email },
        expiredProducts
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};