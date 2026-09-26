import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, X, ListFilter, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../services/task.service.js';
import { TaskCreateBar } from '../components/TaskCreateBar.js';
import { TaskCard } from '../components/TaskCard.js';
import { TaskEditModal } from '../components/TaskEditModal.js';
import type { Task, TaskStatus, UpdateTaskPayload } from '../types/task.types.js';

export function TaskDashboard() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch tasks
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Filter & Search
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesStatus =
        selectedStatus === 'ALL' ? true : t.status === selectedStatus;
      const matchesSearch =
        searchTerm.trim() === ''
          ? true
          : t.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
            (t.description || '')
              .toLowerCase()
              .includes(searchTerm.toLowerCase().trim());
      return matchesStatus && matchesSearch;
    });
  }, [tasks, selectedStatus, searchTerm]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      ALL: tasks.length,
      PENDING: tasks.filter((t) => t.status === 'PENDING').length,
      IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      COMPLETED: tasks.filter((t) => t.status === 'COMPLETED').length,
    };
  }, [tasks]);

  const handleStatusChange = async (id: string, nextStatus: TaskStatus) => {
    await updateMutation.mutateAsync({
      id,
      payload: { status: nextStatus },
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center text-white text-xs font-semibold tracking-wider">
              ST
            </div>
            <span className="text-sm font-semibold text-zinc-900 tracking-tight">
              Suntek Tracker
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-zinc-900">{user?.name}</div>
              <div className="text-[11px] text-zinc-500">{user?.email}</div>
            </div>

            <button
              onClick={() => logout()}
              type="button"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 hover:border-zinc-300 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Section 1: Task Creation Bar */}
        <div>
          <h1 className="text-base font-semibold text-zinc-900 mb-2">Create Task</h1>
          <TaskCreateBar
            onCreateTask={async (data) => {
              await createMutation.mutateAsync(data);
            }}
            isCreating={createMutation.isPending}
          />
        </div>

        {/* Section 2: Controls & Filters */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-zinc-200/60 p-1 rounded-md text-xs font-medium text-zinc-600 overflow-x-auto">
              {(
                [
                  { id: 'ALL', label: 'All' },
                  { id: 'PENDING', label: 'Pending' },
                  { id: 'IN_PROGRESS', label: 'In Progress' },
                  { id: 'COMPLETED', label: 'Completed' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${
                    selectedStatus === tab.id
                      ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                      : 'hover:text-zinc-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="ml-1.5 text-[11px] text-zinc-400 font-normal">
                    {counts[tab.id]}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="w-full text-xs pl-8 pr-7 py-2 bg-white border border-zinc-200 rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Task List */}
        <div>
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin mx-auto mb-2" />
              <span className="text-xs text-zinc-500 font-medium">Loading tasks...</span>
            </div>
          ) : isError ? (
            <div className="p-6 text-center bg-white border border-red-200 rounded-md">
              <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-xs text-red-700 font-medium">
                {error instanceof Error ? error.message : 'Failed to load tasks'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 text-xs px-3 py-1.5 bg-zinc-900 text-white rounded hover:bg-zinc-800"
              >
                Retry
              </button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 px-4 text-center bg-white border border-zinc-200 border-dashed rounded-md">
              {tasks.length === 0 ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-3">
                    <ListFilter className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-medium text-zinc-900">No tasks yet</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                    Create your first task above. You can type natural language notes and click &ldquo;AI Enhance&rdquo; to auto-structure them.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-zinc-900">No matching tasks</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    No tasks match the filter criteria or search keyword &ldquo;{searchTerm}&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus('ALL');
                      setSearchTerm('');
                    }}
                    className="mt-3 text-xs text-zinc-700 hover:text-zinc-900 font-medium underline"
                  >
                    Reset filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(t) => setEditingTask(t)}
                  onDelete={async (id) => {
                    await deleteMutation.mutateAsync(id);
                  }}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onUpdate={async (id, payload) => {
          await updateMutation.mutateAsync({ id, payload });
        }}
        isUpdating={updateMutation.isPending}
      />
    </div>
  );
}
