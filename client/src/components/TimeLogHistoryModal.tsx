import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Trash2, Clock, Calendar } from 'lucide-react';
import { fetchTimeLogs, deleteTimeLog } from '../services/timeLog.service.js';
import { formatHms } from '../context/TimerContext.js';

interface TimeLogHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TimeLogHistoryModal({ isOpen, onClose }: TimeLogHistoryModalProps) {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['timeLogs'],
    queryFn: () => fetchTimeLogs(),
    enabled: isOpen,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTimeLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeLogs'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  if (!isOpen) return null;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-[1px]"
    >
      <div className="bg-white border border-zinc-200 rounded-md w-full max-w-xl shadow-sm overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-100">
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-700" />
            <h2 className="text-sm font-semibold text-zinc-900">Time Tracking History</h2>
            <span className="text-xs text-zinc-400">({logs.length})</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 divide-y divide-zinc-100">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-zinc-500 font-medium">
              Loading logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No time tracking sessions recorded yet.
            </div>
          ) : (
            logs.map((log) => {
              const startDate = new Date(log.startTime);
              const dateStr = startDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const startTimeStr = startDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const endTimeStr = log.endTime
                ? new Date(log.endTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'In Progress';

              return (
                <div
                  key={log.id}
                  className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-zinc-900 truncate">
                      {log.taskTitle || 'Untitled Task'}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        {dateStr}
                      </span>
                      <span>
                        {startTimeStr} – {endTimeStr}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs font-medium text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded">
                      {log.durationSeconds !== null
                        ? formatHms(log.durationSeconds)
                        : 'Active'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDelete(log.id)}
                      disabled={deletingId === log.id}
                      title="Delete log"
                      className="p-1 text-zinc-400 hover:text-red-600 rounded transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-white border border-zinc-300 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
