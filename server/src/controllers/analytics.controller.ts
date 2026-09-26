import type { Request, Response, NextFunction } from 'express';
import { dailySummaryQuerySchema } from '../schemas/analytics.schema.js';
import * as analyticsService from '../services/analytics.service.js';
import { AppError } from '../middlewares/errorHandler.js';

export async function getDailySummary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { date, timezone } = dailySummaryQuerySchema.parse(req.query);
    const summary = await analyticsService.getDailySummary(
      req.user.id,
      date,
      timezone
    );

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    next(error);
  }
}
