import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  aiGenerate,
} from '../controllers/task.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const taskRouter = Router();

// Protect all task endpoints
taskRouter.use(requireAuth);

taskRouter.get('/', getTasks);
taskRouter.post('/', createTask);
taskRouter.post('/ai-generate', aiGenerate);
taskRouter.get('/:id', getTaskById);
taskRouter.patch('/:id', updateTask);
taskRouter.delete('/:id', deleteTask);
