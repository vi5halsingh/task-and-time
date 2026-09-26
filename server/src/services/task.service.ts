import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  GetTasksQuery,
} from '../schemas/task.schema.js';
import type { TaskDto } from '../types/task.types.js';

function computeTaskDto(task: {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: import('@prisma/client').TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  timeLogs?: { durationSeconds: number | null }[];
}): TaskDto {
  const totalDurationSeconds = (task.timeLogs || []).reduce(
    (acc, log) => acc + (log.durationSeconds || 0),
    0
  );

  return {
    id: task.id,
    userId: task.userId,
    title: task.title,
    description: task.description,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    totalDurationSeconds,
  };
}

export async function getUserTasks(
  userId: string,
  query: GetTasksQuery
): Promise<TaskDto[]> {
  const where: Prisma.TaskWhereInput = {
    userId,
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.search && query.search.trim().length > 0) {
    const term = query.search.trim();
    where.OR = [
      { title: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
    ];
  }

  const orderBy: Prisma.TaskOrderByWithRelationInput = {
    [query.sortBy]: query.sortOrder,
  };

  const tasks = await prisma.task.findMany({
    where,
    orderBy,
    include: {
      timeLogs: {
        select: {
          durationSeconds: true,
        },
      },
    },
  });

  return tasks.map(computeTaskDto);
}

export async function getUserTaskById(
  userId: string,
  taskId: string
): Promise<TaskDto> {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
    include: {
      timeLogs: {
        select: {
          durationSeconds: true,
        },
      },
    },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return computeTaskDto(task);
}

export async function createTask(
  userId: string,
  input: CreateTaskInput
): Promise<TaskDto> {
  const task = await prisma.task.create({
    data: {
      userId,
      title: input.title,
      description: input.description || null,
      status: input.status || 'PENDING',
    },
  });

  return computeTaskDto({ ...task, timeLogs: [] });
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: UpdateTaskInput
): Promise<TaskDto> {
  // Check ownership
  const existing = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
  });

  if (!existing) {
    throw new AppError('Task not found', 404);
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.status !== undefined && { status: input.status }),
    },
    include: {
      timeLogs: {
        select: {
          durationSeconds: true,
        },
      },
    },
  });

  return computeTaskDto(updated);
}

export async function deleteTask(
  userId: string,
  taskId: string
): Promise<void> {
  // Check ownership
  const existing = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
  });

  if (!existing) {
    throw new AppError('Task not found', 404);
  }

  // Delete task (Prisma cascade removes associated time_logs safely)
  await prisma.task.delete({
    where: { id: taskId },
  });
}
