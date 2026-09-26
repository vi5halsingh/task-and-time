import { prisma } from '../lib/prisma.js';
import type {
  DailySummaryDto,
  DailyTaskWorkItem,
  TaskSummaryItem,
} from '../types/analytics.types.js';

export function getDayBoundaries(
  dateStr: string,
  timeZone = 'UTC'
): { dayStart: Date; dayEnd: Date } {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    const [year, month, day] = dateStr.split('-').map(Number);
    const utcEstimate = Date.UTC(year, month - 1, day, 0, 0, 0, 0);

    const tzFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
      hour12: false,
    });

    const getLocalMs = (d: Date) => {
      const parts = tzFormatter.formatToParts(d);
      const getVal = (type: string) =>
        Number(parts.find((p) => p.type === type)?.value || 0);
      const y = getVal('year');
      const m = getVal('month') - 1;
      const d_ = getVal('day');
      let h = getVal('hour');
      if (h === 24) h = 0;
      const min = getVal('minute');
      const s = getVal('second');
      const ms = getVal('fractionalSecond');
      return Date.UTC(y, m, d_, h, min, s, ms);
    };

    const offsetMs = getLocalMs(new Date(utcEstimate)) - utcEstimate;
    const targetLocalMidnight = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
    const dayStart = new Date(targetLocalMidnight - offsetMs);
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    return { dayStart, dayEnd };
  } catch {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));
    return { dayStart, dayEnd };
  }
}

export async function getDailySummary(
  userId: string,
  targetDateStr?: string,
  timeZone = 'UTC'
): Promise<DailySummaryDto> {
  const effectiveDateStr =
    targetDateStr || new Date().toISOString().split('T')[0];

  const { dayStart, dayEnd } = getDayBoundaries(effectiveDateStr, timeZone);
  const now = new Date();

  // 1. Fetch all time logs intersecting the calendar day boundary for this user
  const intersectingLogs = await prisma.timeLog.findMany({
    where: {
      userId,
      startTime: { lte: dayEnd },
      OR: [{ endTime: null }, { endTime: { gte: dayStart } }],
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

  // 2. Compute date-clamped duration for each task on this specific day
  const taskDurationMap = new Map<
    string,
    {
      taskId: string;
      taskTitle: string;
      status: import('@prisma/client').TaskStatus;
      seconds: number;
    }
  >();

  let totalTrackedSeconds = 0;

  for (const log of intersectingLogs) {
    const logStartMs = log.startTime.getTime();
    const logEndMs = (log.endTime || now).getTime();

    // Clamp to day boundaries
    const clampedStart = Math.max(logStartMs, dayStart.getTime());
    const clampedEnd = Math.min(logEndMs, dayEnd.getTime());

    if (clampedEnd > clampedStart) {
      const durationOnDay = Math.floor((clampedEnd - clampedStart) / 1000);
      totalTrackedSeconds += durationOnDay;

      const existing = taskDurationMap.get(log.taskId);
      if (existing) {
        existing.seconds += durationOnDay;
      } else {
        taskDurationMap.set(log.taskId, {
          taskId: log.taskId,
          taskTitle: log.task?.title || 'Unknown Task',
          status: log.task?.status || 'PENDING',
          seconds: durationOnDay,
        });
      }
    }
  }

  // 3. Format tasksWorkedOn with percentage and sorted by duration descending
  const tasksWorkedOn: DailyTaskWorkItem[] = Array.from(
    taskDurationMap.values()
  )
    .filter((item) => item.seconds > 0)
    .map((item) => ({
      taskId: item.taskId,
      taskTitle: item.taskTitle,
      status: item.status,
      durationSeconds: item.seconds,
      percentage:
        totalTrackedSeconds > 0
          ? Math.round((item.seconds / totalTrackedSeconds) * 100)
          : 0,
    }))
    .sort((a, b) => b.durationSeconds - a.durationSeconds);

  // 4. Fetch all user tasks to categorize current statuses
  const allUserTasks = await prisma.task.findMany({
    where: { userId },
    include: {
      timeLogs: {
        select: {
          durationSeconds: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const mapToTaskSummary = (
    t: (typeof allUserTasks)[number]
  ): TaskSummaryItem => ({
    id: t.id,
    title: t.title,
    status: t.status,
    totalDurationSeconds: (t.timeLogs || []).reduce(
      (sum, l) => sum + (l.durationSeconds || 0),
      0
    ),
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  });

  const completedTasks = allUserTasks
    .filter((t) => t.status === 'COMPLETED')
    .map(mapToTaskSummary);

  const inProgressTasks = allUserTasks
    .filter((t) => t.status === 'IN_PROGRESS')
    .map(mapToTaskSummary);

  const pendingTasks = allUserTasks
    .filter((t) => t.status === 'PENDING')
    .map(mapToTaskSummary);

  return {
    date: effectiveDateStr,
    totalTrackedSeconds,
    tasksWorkedOn,
    completedTasks,
    inProgressTasks,
    pendingTasks,
  };
}
