import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { getSaleById, processSale } from '../services/sale.service';
import { sendSuccess } from '../utils/resp.util';

export const handleCreateSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const sale = await processSale(req.body, id, email);

    sendSuccess({
      res,
      req,
      action: "PROCESS_NEW_SALE_TRANSACTION",
      module: "SALE",
      statusCode: 21, // 201 Created
      message: 'Venta procesada y facturada correctamente.',
      data: {
        user: { id, email },
        sale,
      },
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};

export const handleGetSaleDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    const { id: saleId } = req.params as { id: string};

    const sale = await getSaleById(saleId);

    sendSuccess({
      res,
      req,
      action: "GET_SALE_DETAILS_BY_ID",
      module: "SALE",
      statusCode: 200,
      message: 'Detalle de transacción recuperado.',
      data: {
        user: { id, email },
        sale,
      },
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};