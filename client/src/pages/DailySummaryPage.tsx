import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  BarChart2,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { fetchDailySummary } from '../services/analytics.service.js';
import { formatHms } from '../context/TimerContext.js';
import { AppHeader } from '../components/AppHeader.js';
import { TimeLogHistoryModal } from '../components/TimeLogHistoryModal.js';
import type { TaskStatus } from '../types/task.types.js';

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusBadge(status: TaskStatus) {
  switch (status) {
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
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
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
}

export function DailySummaryPage() {
  const todayStr = useMemo(() => getTodayString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const isToday = selectedDate === todayStr;

  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dailySummary', selectedDate],
    queryFn: () => fetchDailySummary(selectedDate),
  });

  const chartData = useMemo(() => {
    if (!summary?.tasksWorkedOn || summary.tasksWorkedOn.length === 0) {
      return [];
    }
    return summary.tasksWorkedOn.map((t) => ({
      name: t.taskTitle.length > 22 ? t.taskTitle.slice(0, 20) + '...' : t.taskTitle,
      fullName: t.taskTitle,
      seconds: t.durationSeconds,
      formattedTime: formatHms(t.durationSeconds),
      percentage: t.percentage,
    }));
  }, [summary]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      <AppHeader onOpenHistory={() => setIsHistoryOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Date Selector Banner */}
        <div className="bg-white border border-zinc-200 rounded-md p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-0.5">
              Daily Productivity Review
            </div>
            <h1 className="text-base sm:text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span>{formatDisplayDate(selectedDate)}</span>
              {isToday && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium">
                  Today
                </span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedDate((prev) => shiftDate(prev, -1))}
              className="p-1.5 text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 rounded transition-colors"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                }
              }}
              max={todayStr}
              className="text-xs px-2.5 py-1.5 bg-white border border-zinc-300 rounded text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />

            <button
              type="button"
              onClick={() => setSelectedDate((prev) => shiftDate(prev, 1))}
              disabled={isToday}
              className="p-1.5 text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isToday && (
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className="text-xs px-2.5 py-1.5 font-medium text-zinc-700 hover:text-zinc-900 bg-white border border-zinc-300 rounded hover:bg-zinc-50 transition-colors"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Loading and Error States */}
        {isLoading ? (
          <div className="py-20 text-center bg-white border border-zinc-200 rounded-md">
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-zinc-500 font-medium">Loading summary...</span>
          </div>
        ) : isError ? (
          <div className="p-6 text-center bg-white border border-red-200 rounded-md">
            <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-xs text-red-700 font-medium">
              {error instanceof Error ? error.message : 'Failed to load daily summary'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 text-xs px-3 py-1.5 bg-zinc-900 text-white rounded hover:bg-zinc-800"
            >
              Retry
            </button>
          </div>
        ) : !summary ? null : (
          <>
            {/* High-Level Metrics (Restrained Product Design) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-zinc-200 rounded-md p-4">
                <div className="text-[11px] font-medium text-zinc-500 mb-1">
                  Total Tracked Time
                </div>
                <div className="font-mono text-lg sm:text-xl font-bold text-zinc-900 tracking-tight tabular-nums">
                  {formatHms(summary.totalTrackedSeconds)}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {summary.tasksWorkedOn.length} {summary.tasksWorkedOn.length === 1 ? 'task' : 'tasks'} timed
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-md p-4">
                <div className="text-[11px] font-medium text-zinc-500 mb-1">
                  Tasks Worked On
                </div>
                <div className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
                  {summary.tasksWorkedOn.length}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Active during this day
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-md p-4">
                <div className="text-[11px] font-medium text-zinc-500 mb-1">
                  Completed Tasks
                </div>
                <div className="text-lg sm:text-xl font-bold text-emerald-700 tracking-tight">
                  {summary.completedTasks.length}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Marked completed
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-md p-4">
                <div className="text-[11px] font-medium text-zinc-500 mb-1">
                  In Progress / Pending
                </div>
                <div className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
                  {summary.inProgressTasks.length + summary.pendingTasks.length}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {summary.inProgressTasks.length} in progress, {summary.pendingTasks.length} pending
                </div>
              </div>
            </div>

            {/* Empty State vs. Time Breakdown & Chart */}
            {summary.totalTrackedSeconds === 0 ? (
              <div className="bg-white border border-zinc-200 border-dashed rounded-md p-8 sm:p-12 text-center">
                <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  No time recorded on {formatDisplayDate(selectedDate)}
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
                  {isToday
                    ? 'Start tracking a task on the dashboard to record your focused time today.'
                    : 'No timer sessions were active or completed on this calendar date.'}
                </p>
                {isToday && (
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded transition-colors"
                  >
                    <span>Go to Tasks</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Time Distribution Chart (Recharts) */}
                <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-md p-4 sm:p-5">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-zinc-600" />
                      <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                        Time Distribution by Task
                      </h2>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      {formatHms(summary.totalTrackedSeconds)} total
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      >
                        <XAxis
                          type="number"
                          tickFormatter={(val: number) => {
                            const mins = Math.floor(val / 60);
                            return mins >= 60 ? `${Math.floor(mins / 60)}h` : `${mins}m`;
                          }}
                          tick={{ fontSize: 10, fill: '#71717a' }}
                          axisLine={{ stroke: '#e4e4e7' }}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={110}
                          tick={{ fontSize: 11, fill: '#27272a' }}
                          axisLine={{ stroke: '#e4e4e7' }}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: '#f4f4f5' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0].payload as (typeof chartData)[0];
                              return (
                                <div className="bg-zinc-900 text-white text-xs rounded px-2.5 py-1.5 shadow-md">
                                  <div className="font-semibold mb-0.5">{item.fullName}</div>
                                  <div className="text-emerald-400 font-mono">
                                    {item.formattedTime} ({item.percentage}%)
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="seconds" radius={[0, 4, 4, 0]}>
                          {chartData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index === 0 ? '#18181b' : '#3f3f46'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Daily Task Breakdown List */}
                <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-md p-4 sm:p-5 flex flex-col">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
                    <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                      Tasks Worked On
                    </h2>
                    <span className="text-xs text-zinc-500">
                      {summary.tasksWorkedOn.length} items
                    </span>
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-72 flex-1 pr-1 divide-y divide-zinc-50">
                    {summary.tasksWorkedOn.map((task) => (
                      <div key={task.taskId} className="pt-2.5 first:pt-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="text-xs font-medium text-zinc-900 truncate">
                            {task.taskTitle}
                          </div>
                          <span className="font-mono text-xs font-semibold text-zinc-900 shrink-0">
                            {formatHms(task.durationSeconds)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1.5">
                          <div>{getStatusBadge(task.status)}</div>
                          <span>{task.percentage}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-zinc-100 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-zinc-800 h-1 rounded-full transition-all"
                            style={{ width: `${Math.min(100, task.percentage)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Task Status Overview */}
            <div className="bg-white border border-zinc-200 rounded-md p-4 sm:p-5">
              <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">
                Task Status Breakdown
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Completed */}
                <div className="border border-zinc-200 rounded p-3 bg-zinc-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Completed
                    </span>
                    <span className="text-xs font-mono font-semibold text-zinc-700">
                      {summary.completedTasks.length}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-zinc-600 max-h-36 overflow-y-auto">
                    {summary.completedTasks.length === 0 ? (
                      <span className="text-[11px] text-zinc-400">None</span>
                    ) : (
                      summary.completedTasks.map((t) => (
                        <div key={t.id} className="truncate" title={t.title}>
                          • {t.title}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* In Progress */}
                <div className="border border-zinc-200 rounded p-3 bg-zinc-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      In Progress
                    </span>
                    <span className="text-xs font-mono font-semibold text-zinc-700">
                      {summary.inProgressTasks.length}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-zinc-600 max-h-36 overflow-y-auto">
                    {summary.inProgressTasks.length === 0 ? (
                      <span className="text-[11px] text-zinc-400">None</span>
                    ) : (
                      summary.inProgressTasks.map((t) => (
                        <div key={t.id} className="truncate" title={t.title}>
                          • {t.title}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Pending */}
                <div className="border border-zinc-200 rounded p-3 bg-zinc-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      Pending
                    </span>
                    <span className="text-xs font-mono font-semibold text-zinc-700">
                      {summary.pendingTasks.length}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-zinc-600 max-h-36 overflow-y-auto">
                    {summary.pendingTasks.length === 0 ? (
                      <span className="text-[11px] text-zinc-400">None</span>
                    ) : (
                      summary.pendingTasks.map((t) => (
                        <div key={t.id} className="truncate" title={t.title}>
                          • {t.title}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Time Log History Modal */}
      <TimeLogHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
