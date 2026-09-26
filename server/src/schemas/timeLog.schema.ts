import { z } from 'zod';

export const startTimeLogSchema = z.object({
  taskId: z.string().trim().min(1, { message: 'Task ID is required' }),
});

export const getTimeLogsQuerySchema = z.object({
  taskId: z.string().trim().optional(),
  startDate: z
    .string()
    .datetime({ message: 'Invalid startDate format (must be ISO-8601)' })
    .optional(),
  endDate: z
    .string()
    .datetime({ message: 'Invalid endDate format (must be ISO-8601)' })
    .optional(),
});

export type StartTimeLogInput = z.infer<typeof startTimeLogSchema>;
export type GetTimeLogsQuery = z.infer<typeof getTimeLogsQuerySchema>;
