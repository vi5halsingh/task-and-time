import type { TaskStatus } from '@prisma/client';

export interface DailyTaskWorkItem {
  taskId: string;
  taskTitle: string;
  status: TaskStatus;
  durationSeconds: number;
  percentage: number;
}

export interface TaskSummaryItem {
  id: string;
  title: string;
  status: TaskStatus;
  totalDurationSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailySummaryDto {
  date: string; // YYYY-MM-DD
  totalTrackedSeconds: number;
  tasksWorkedOn: DailyTaskWorkItem[];
  completedTasks: TaskSummaryItem[];
  inProgressTasks: TaskSummaryItem[];
  pendingTasks: TaskSummaryItem[];
}
