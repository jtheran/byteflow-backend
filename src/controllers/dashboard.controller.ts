import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { getAnalyticsSummary } from '../services/dashboard.service';
import { sendSuccess } from '../utils/resp.util';

export const handleGetDashboardAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id = "unknow", email = "unknow@byteforge.com" } = req.user as { id: string, email: string };
    
    const analytics = await getAnalyticsSummary();

    sendSuccess({
      res,
      req,
      action: "GET_SYSTEM_DASHBOARD_ANALYTICS",
      module: "DASHBOARD",
      statusCode: 200,
      message: 'Métricas analíticas consolidadas de manera exitosa para la gerencia.',
      data: {
        user: { id, email },
        analytics
      }
    });
  } catch (error) {
    next(createHttpError(500, `${error}`));
  }
};