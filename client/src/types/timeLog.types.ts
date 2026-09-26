import type { TaskStatus } from './task.types.js';

export interface ActiveTimer {
  id: string;
  taskId: string;
  taskTitle: string;
  taskStatus: TaskStatus;
  startTime: string;
  elapsedSeconds: number;
}

export interface TimeLog {
  id: string;
  userId: string;
  taskId: string;
  taskTitle?: string;
  startTime: string;
  endTime: string | null;
  durationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetTimeLogsParams {
  taskId?: string;
  startDate?: string;
  endDate?: string;
}
