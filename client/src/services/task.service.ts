import { api } from './api.js';
import type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  AiTaskSuggestion,
  TaskFilterParams,
} from '../types/task.types.js';

export async function fetchTasks(params?: TaskFilterParams): Promise<Task[]> {
  const response = await api.get<{ success: boolean; tasks: Task[] }>('/tasks', {
    params,
  });
  return response.data.tasks;
}

export async function fetchTaskById(id: string): Promise<Task> {
  const response = await api.get<{ success: boolean; task: Task }>(`/tasks/${id}`);
  return response.data.task;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const response = await api.post<{ success: boolean; task: Task }>(
    '/tasks',
    payload
  );
  return response.data.task;
}

export async function updateTask(
  id: string,
  payload: UpdateTaskPayload
): Promise<Task> {
  const response = await api.patch<{ success: boolean; task: Task }>(
    `/tasks/${id}`,
    payload
  );
  return response.data.task;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function generateAiTask(prompt: string): Promise<AiTaskSuggestion> {
  const response = await api.post<{
    success: boolean;
    suggestion: AiTaskSuggestion;
  }>('/tasks/ai-generate', { prompt });
  return response.data.suggestion;
}
