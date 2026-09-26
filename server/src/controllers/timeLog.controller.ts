import type { Request, Response, NextFunction } from 'express';
import {
  startTimeLogSchema,
  getTimeLogsQuerySchema,
} from '../schemas/timeLog.schema.js';
import * as timeLogService from '../services/timeLog.service.js';
import { AppError } from '../middlewares/errorHandler.js';

function getParamId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

export async function getActiveTimer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const activeTimer = await timeLogService.getActiveTimer(req.user.id);

    res.status(200).json({
      success: true,
      activeTimer,
    });
  } catch (error) {
    next(error);
  }
}

export async function startTimeTracking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { taskId } = startTimeLogSchema.parse(req.body);
    const activeTimer = await timeLogService.startTimeTracking(
      req.user.id,
      taskId
    );

    res.status(201).json({
      success: true,
      message: 'Timer started successfully',
      activeTimer,
    });
  } catch (error) {
    next(error);
  }
}

export async function stopTimeTracking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const timeLog = await timeLogService.stopTimeTracking(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Timer stopped successfully',
      timeLog,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTimeLogs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const query = getTimeLogsQuerySchema.parse(req.query);
    const timeLogs = await timeLogService.getTimeLogs(req.user.id, query);

    res.status(200).json({
      success: true,
      timeLogs,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTimeLog(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const logId = getParamId(req);
    await timeLogService.deleteTimeLog(req.user.id, logId);

    res.status(200).json({
      success: true,
      message: 'Time log deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
