import type { TaskStatus } from '@prisma/client';

export interface TaskDto {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  totalDurationSeconds: number;
}

export interface AiTaskSuggestion {
  title: string;
  description: string;
}
