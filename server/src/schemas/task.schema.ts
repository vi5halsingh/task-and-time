import { z } from 'zod';
import { TaskStatus } from '@prisma/client';

export const taskStatusEnum = z.nativeEnum(TaskStatus);

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Task title is required' })
    .max(255, { message: 'Task title must not exceed 255 characters' }),
  description: z
    .string()
    .trim()
    .max(2000, { message: 'Description must not exceed 2000 characters' })
    .optional()
    .nullable(),
  status: taskStatusEnum.default(TaskStatus.PENDING).optional(),
});

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, { message: 'Task title cannot be empty' })
      .max(255, { message: 'Task title must not exceed 255 characters' })
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, { message: 'Description must not exceed 2000 characters' })
      .optional()
      .nullable(),
    status: taskStatusEnum.optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.status !== undefined,
    {
      message: 'At least one field (title, description, or status) must be provided for update',
    }
  );

export const getTasksQuerySchema = z.object({
  status: taskStatusEnum.optional(),
  search: z.string().trim().max(100).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const aiGenerateSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, { message: 'Prompt cannot be empty' })
    .max(500, { message: 'Prompt must not exceed 500 characters' }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>;
export type AiGenerateInput = z.infer<typeof aiGenerateSchema>;
