import { Router } from 'express';
import { getDailySummary } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

analyticsRouter.get('/daily-summary', getDailySummary);
