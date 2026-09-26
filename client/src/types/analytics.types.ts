import type { TaskStatus } from './task.types.js';

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
  createdAt: string;
  updatedAt: string;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  totalTrackedSeconds: number;
  tasksWorkedOn: DailyTaskWorkItem[];
  completedTasks: TaskSummaryItem[];
  inProgressTasks: TaskSummaryItem[];
  pendingTasks: TaskSummaryItem[];
}
