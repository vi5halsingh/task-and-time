import { useState, type FormEvent } from 'react';
import { Sparkles, Plus, ArrowRight, X } from 'lucide-react';
import { generateAiTask } from '../services/task.service.js';
import { getErrorMessage } from '../services/api.js';
import type { TaskStatus } from '../types/task.types.js';

interface TaskCreateBarProps {
  onCreateTask: (data: {
    title: string;
    description?: string;
    status: TaskStatus;
  }) => Promise<void>;
  isCreating: boolean;
}

export function TaskCreateBar({ onCreateTask, isCreating }: TaskCreateBarProps) {
  const [prompt, setPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields when expanded
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('PENDING');

  const handleAiEnhance = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError('Please enter a brief task prompt first (e.g. "follow up with designer")');
      return;
    }

    setError(null);
    setIsEnhancing(true);
    try {
      const suggestion = await generateAiTask(trimmed);
      setTitle(suggestion.title);
      setDescription(suggestion.description);
      setIsExpanded(true);
    } catch (err) {
      // Graceful fallback: populate prompt as title and open form
      setTitle(trimmed.charAt(0).toUpperCase() + trimmed.slice(1));
      setDescription('');
      setIsExpanded(true);
      setError('AI suggestion was unavailable. You can edit and save directly.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleQuickAdd = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setError(null);
    try {
      await onCreateTask({
        title: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
        status: 'PENDING',
      });
      setPrompt('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSaveExpanded = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title cannot be empty');
      return;
    }

    setError(null);
    try {
      await onCreateTask({
        title: trimmedTitle,
        description: description.trim() || undefined,
        status,
      });
      // Reset
      setTitle('');
      setDescription('');
      setStatus('PENDING');
      setPrompt('');
      setIsExpanded(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCancelExpanded = () => {
    setIsExpanded(false);
    setError(null);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-md p-4 sm:p-5">
      {error && (
        <div className="mb-3 px-3 py-2 text-xs rounded bg-red-50 border border-red-200 text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!isExpanded ? (
        <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Add a task or prompt (e.g. 'follow up with designer')..."
              className="w-full text-sm px-3.5 py-2 bg-zinc-50 border border-zinc-300 rounded-md text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={handleAiEnhance}
              disabled={isEnhancing || !prompt.trim()}
              title="Enhance natural language prompt using Gemini AI"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isEnhancing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin" />
                  <span>Enhancing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
                  <span>AI Enhance</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setTitle(prompt.trim() ? prompt.trim().charAt(0).toUpperCase() + prompt.trim().slice(1) : '');
                setIsExpanded(true);
              }}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-300 hover:border-zinc-400 rounded-md transition-colors cursor-pointer"
            >
              <span>Details</span>
            </button>

            <button
              type="submit"
              disabled={isCreating || !prompt.trim()}
              className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveExpanded} className="space-y-3.5 pt-1">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-800">
                {title ? 'Review and Save Task' : 'New Task'}
              </span>
              {description && (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  AI Suggestion Ready
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleCancelExpanded}
              className="text-zinc-400 hover:text-zinc-600 text-xs inline-flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full text-sm px-3 py-2 bg-white border border-zinc-300 rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Description (optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Actionable steps or details..."
              className="w-full text-sm px-3 py-2 bg-white border border-zinc-300 rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-zinc-700">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="text-xs px-2.5 py-1.5 bg-white border border-zinc-300 rounded-md text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancelExpanded}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-300 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !title.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isCreating ? 'Saving...' : 'Save Task'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
