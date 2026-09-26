import { useState } from 'react';
import { Clock, Edit2, Trash2, CheckCircle2, Play, Square } from 'lucide-react';
import type { Task, TaskStatus } from '../types/task.types.js';
import { useTimer, formatHms } from '../context/TimerContext.js';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const {
    activeTimer,
    elapsedSeconds,
    start,
    stop,
    isStarting,
    isStopping,
    pendingTaskId,
  } = useTimer();

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isCurrentTaskActive = activeTimer?.taskId === task.id;
  const isThisTaskPendingStart = isStarting && pendingTaskId === task.id;

  // Total display: if this task is active, add the current running elapsedSeconds to the saved total
  const liveTotalSeconds = isCurrentTaskActive
    ? task.totalDurationSeconds + elapsedSeconds
    : task.totalDurationSeconds;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
      setIsConfirmingDelete(false);
    }
  };

  const getStatusBadge = () => {
    switch (task.status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>In Progress</span>
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
            Pending
          </span>
        );
    }
  };

  return (
    <div
      className={`group bg-white border rounded-md p-4 transition-all ${
        isCurrentTaskActive
          ? 'border-emerald-400 ring-1 ring-emerald-400/20 bg-emerald-50/10'
          : 'border-zinc-200 hover:border-zinc-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left: Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <label className="cursor-pointer" title="Click to advance status">
              <span
                onClick={() => {
                  const nextStatus: Record<TaskStatus, TaskStatus> = {
                    PENDING: 'IN_PROGRESS',
                    IN_PROGRESS: 'COMPLETED',
                    COMPLETED: 'PENDING',
                  };
                  onStatusChange(task.id, nextStatus[task.status]);
                }}
                className="cursor-pointer select-none"
              >
                {getStatusBadge()}
              </span>
            </label>

            <span
              className={`inline-flex items-center gap-1 text-[11px] font-mono tabular-nums ${
                isCurrentTaskActive
                  ? 'text-emerald-700 font-semibold'
                  : 'text-zinc-500'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{formatHms(liveTotalSeconds)}</span>
              {isCurrentTaskActive && (
                <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-sans ml-1">
                  (live)
                </span>
              )}
            </span>
          </div>

          <h3
            className={`text-sm font-medium leading-snug break-words ${
              task.status === 'COMPLETED'
                ? 'line-through text-zinc-400'
                : 'text-zinc-900'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-1 text-xs text-zinc-500 leading-relaxed whitespace-pre-wrap break-words">
              {task.description}
            </p>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 w-full sm:w-auto justify-between sm:justify-end">
          {/* Start / Stop Timer Button */}
          {isCurrentTaskActive ? (
            <button
              type="button"
              onClick={() => stop()}
              disabled={isStopping}
              title="Stop tracking this task"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>{isStopping ? 'Stopping...' : 'Stop'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => start(task.id)}
              disabled={isThisTaskPendingStart}
              title="Start timer for this task"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 rounded transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isThisTaskPendingStart ? (
                <>
                  <span className="w-3 h-3 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-zinc-700" />
                  <span>Start</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(task)}
              title="Edit task"
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {!isConfirmingDelete ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                title="Delete task"
                className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="inline-flex items-center gap-1 text-[11px] bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                <span className="text-red-700 font-medium">Delete?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-1 text-red-600 hover:text-red-800 font-semibold underline cursor-pointer"
                >
                  {isDeleting ? '...' : 'Yes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-1 text-zinc-500 hover:text-zinc-700 cursor-pointer"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
