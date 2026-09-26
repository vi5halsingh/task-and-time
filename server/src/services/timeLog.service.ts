import { prisma } from '../lib/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';
import type { ActiveTimerDto, TimeLogDto } from '../types/timeLog.types.js';
import type { GetTimeLogsQuery } from '../schemas/timeLog.schema.js';

export async function getActiveTimer(
  userId: string
): Promise<ActiveTimerDto | null> {
  const activeLog = await prisma.timeLog.findFirst({
    where: {
      userId,
      endTime: null,
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });

  if (!activeLog) {
    return null;
  }

  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - activeLog.startTime.getTime()) / 1000)
  );

  return {
    id: activeLog.id,
    taskId: activeLog.taskId,
    taskTitle: activeLog.task.title,
    taskStatus: activeLog.task.status,
    startTime: activeLog.startTime,
    elapsedSeconds,
  };
}

export async function startTimeTracking(
  userId: string,
  taskId: string
): Promise<ActiveTimerDto> {
  // Check task exists and belongs to the user
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
  });

  if (!task) {
    throw new AppError('Task not found or access denied', 404);
  }

  const now = new Date();

  // Execute in a transaction to guarantee only ONE active timer per user
  const newActiveLog = await prisma.$transaction(async (tx) => {
    // 1. Find any currently running timer for this user
    const existingActive = await tx.timeLog.findFirst({
      where: {
        userId,
        endTime: null,
      },
    });

    // 2. Safely stop the existing active timer
    if (existingActive) {
      const dur = Math.max(
        0,
        Math.floor((now.getTime() - existingActive.startTime.getTime()) / 1000)
      );
      await tx.timeLog.update({
        where: { id: existingActive.id },
        data: {
          endTime: now,
          durationSeconds: dur,
        },
      });
    }

    // 3. If target task is PENDING, transition it to IN_PROGRESS
    if (task.status === 'PENDING') {
      await tx.task.update({
        where: { id: taskId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    // 4. Create the new active TimeLog
    const created = await tx.timeLog.create({
      data: {
        userId,
        taskId,
        startTime: now,
        endTime: null,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return created;
  });

  return {
    id: newActiveLog.id,
    taskId: newActiveLog.taskId,
    taskTitle: newActiveLog.task.title,
    taskStatus: newActiveLog.task.status,
    startTime: newActiveLog.startTime,
    elapsedSeconds: 0,
  };
}

export async function stopTimeTracking(
  userId: string
): Promise<TimeLogDto> {
  const now = new Date();

  const activeLog = await prisma.timeLog.findFirst({
    where: {
      userId,
      endTime: null,
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!activeLog) {
    throw new AppError('No active timer running', 400);
  }

  const durationSeconds = Math.max(
    0,
    Math.floor((now.getTime() - activeLog.startTime.getTime()) / 1000)
  );

  const stopped = await prisma.timeLog.update({
    where: { id: activeLog.id },
    data: {
      endTime: now,
      durationSeconds,
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return {
    id: stopped.id,
    userId: stopped.userId,
    taskId: stopped.taskId,
    taskTitle: stopped.task.title,
    startTime: stopped.startTime,
    endTime: stopped.endTime,
    durationSeconds: stopped.durationSeconds,
    createdAt: stopped.createdAt,
    updatedAt: stopped.updatedAt,
  };
}

export async function getTimeLogs(
  userId: string,
  query: GetTimeLogsQuery
): Promise<TimeLogDto[]> {
  const whereClause: import('@prisma/client').Prisma.TimeLogWhereInput = {
    userId,
  };

  if (query.taskId) {
    whereClause.taskId = query.taskId;
  }

  if (query.startDate || query.endDate) {
    whereClause.startTime = {
      ...(query.startDate && { gte: new Date(query.startDate) }),
      ...(query.endDate && { lte: new Date(query.endDate) }),
    };
  }

  const logs = await prisma.timeLog.findMany({
    where: whereClause,
    orderBy: {
      startTime: 'desc',
    },
    include: {
      task: {
        select: {
          title: true,
        },
      },
    },
  });

  return logs.map((log) => ({
    id: log.id,
    userId: log.userId,
    taskId: log.taskId,
    taskTitle: log.task.title,
    startTime: log.startTime,
    endTime: log.endTime,
    durationSeconds: log.durationSeconds,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  }));
}

export async function deleteTimeLog(
  userId: string,
  logId: string
): Promise<void> {
  const existing = await prisma.timeLog.findFirst({
    where: {
      id: logId,
      userId,
    },
  });

  if (!existing) {
    throw new AppError('Time log not found or access denied', 404);
  }

  await prisma.timeLog.delete({
    where: { id: logId },
  });
}
