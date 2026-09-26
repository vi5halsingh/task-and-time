import { api } from './api.js';
import type {
  ActiveTimer,
  TimeLog,
  GetTimeLogsParams,
} from '../types/timeLog.types.js';

export async function fetchActiveTimer(): Promise<ActiveTimer | null> {
  const response = await api.get<{
    success: boolean;
    activeTimer: ActiveTimer | null;
  }>('/time-logs/active');
  return response.data.activeTimer;
}

export async function startTimer(taskId: string): Promise<ActiveTimer> {
  const response = await api.post<{
    success: boolean;
    message: string;
    activeTimer: ActiveTimer;
  }>('/time-logs/start', { taskId });
  return response.data.activeTimer;
}

export async function stopTimer(): Promise<TimeLog> {
  const response = await api.post<{
    success: boolean;
    message: string;
    timeLog: TimeLog;
  }>('/time-logs/stop');
  return response.data.timeLog;
}

export async function fetchTimeLogs(
  params?: GetTimeLogsParams
): Promise<TimeLog[]> {
  const response = await api.get<{
    success: boolean;
    timeLogs: TimeLog[];
  }>('/time-logs', { params });
  return response.data.timeLogs;
}

export async function deleteTimeLog(id: string): Promise<void> {
  await api.delete(`/time-logs/${id}`);
}
