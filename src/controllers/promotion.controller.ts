import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { createPromotion, getActiveDiscountForProduct } from '../services/promotion.service';
import { sendSuccess } from '../utils/resp.util';

export const handleCreatePromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    
    const promotion = await createPromotion(req.body);

    sendSuccess({
      res,
      req,
      action: "CREATE_PROMOTION_AND_BROADCAST",
      module: "MARKETING",
      statusCode: 201,
      message: 'Promoción creada de forma exitosa y campaña de WhatsApp encolada.',
      data: {
        user: { id, email },
        promotion
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};