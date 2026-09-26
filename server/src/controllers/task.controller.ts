import type { Request, Response, NextFunction } from 'express';
import {
  createTaskSchema,
  updateTaskSchema,
  getTasksQuerySchema,
  aiGenerateSchema,
} from '../schemas/task.schema.js';
import * as taskService from '../services/task.service.js';
import * as aiService from '../services/ai.service.js';
import { AppError } from '../middlewares/errorHandler.js';

function getParamId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

export async function getTasks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const query = getTasksQuerySchema.parse(req.query);
    const tasks = await taskService.getUserTasks(req.user.id, query);

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const taskId = getParamId(req);
    const task = await taskService.getUserTaskById(req.user.id, taskId);

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const validatedData = createTaskSchema.parse(req.body);
    const task = await taskService.createTask(req.user.id, validatedData);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const taskId = getParamId(req);
    const validatedData = updateTaskSchema.parse(req.body);
    const task = await taskService.updateTask(
      req.user.id,
      taskId,
      validatedData
    );

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const taskId = getParamId(req);
    await taskService.deleteTask(req.user.id, taskId);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function aiGenerate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { prompt } = aiGenerateSchema.parse(req.body);
    const suggestion = await aiService.generateTaskFromPrompt(prompt);

    res.status(200).json({
      success: true,
      suggestion,
    });
  } catch (error) {
    next(error);
  }
}
