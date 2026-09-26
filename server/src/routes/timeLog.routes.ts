import { Router } from 'express';
import {
  getActiveTimer,
  startTimeTracking,
  stopTimeTracking,
  getTimeLogs,
  deleteTimeLog,
} from '../controllers/timeLog.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const timeLogRouter = Router();

timeLogRouter.use(requireAuth);

timeLogRouter.get('/active', getActiveTimer);
timeLogRouter.post('/start', startTimeTracking);
timeLogRouter.post('/stop', stopTimeTracking);
timeLogRouter.get('/', getTimeLogs);
timeLogRouter.delete('/:id', deleteTimeLog);
