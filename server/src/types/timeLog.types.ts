import type { TaskStatus } from '@prisma/client';

export interface ActiveTimerDto {
  id: string;
  taskId: string;
  taskTitle: string;
  taskStatus: TaskStatus;
  startTime: Date;
  elapsedSeconds: number;
}

export interface TimeLogDto {
  id: string;
  userId: string;
  taskId: string;
  taskTitle?: string;
  startTime: Date;
  endTime: Date | null;
  durationSeconds: number | null;
  createdAt: Date;
  updatedAt: Date;
}
