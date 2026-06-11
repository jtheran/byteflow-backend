import { Request, Response } from 'express';
import { getAuditLogsService } from '../services/audit.service';

export const handleGetAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, module, action, userEmail } = req.query;

    const data = await getAuditLogsService({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      module: module as string,
      action: action as string,
      userEmail: userEmail as string
    });

    res.status(200).json({
      status: 'success',
      message: 'Logs de auditoría recuperados correctamente.',
      data
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al recuperar los logs.'
    });
  }
};