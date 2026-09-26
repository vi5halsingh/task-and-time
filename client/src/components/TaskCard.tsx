import { useState } from 'react';
import { Clock, Edit2, Trash2, CheckCircle2, Play } from 'lucide-react';
import type { Task, TaskStatus } from '../types/task.types.js';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
}

function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    <div className="group bg-white border border-zinc-200 hover:border-zinc-300 rounded-md p-4 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left: Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <label className="cursor-pointer" title="Click to change status">
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                className="sr-only"
                id={`status-select-${task.id}`}
              />
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
                title="Click to advance status"
              >
                {getStatusBadge()}
              </span>
            </label>

            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>{formatDuration(task.totalDurationSeconds)}</span>
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
        <div className="flex items-center gap-1 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 w-full sm:w-auto justify-between sm:justify-end">
          {/* Phase 4 Timer Placeholder (disabled / visual only) */}
          <button
            type="button"
            disabled
            title="Time tracking will be available in Phase 4"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-zinc-400 bg-zinc-50 border border-zinc-200 rounded cursor-not-allowed opacity-75"
          >
            <Play className="w-3 h-3" />
            <span>Timer</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(task)}
              title="Edit task"
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {!isConfirmingDelete ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                title="Delete task"
                className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
