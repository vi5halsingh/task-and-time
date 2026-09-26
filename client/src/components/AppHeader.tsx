import { Link, useLocation } from 'react-router-dom';
import { Clock, CheckSquare, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { ActiveTimerBar } from './ActiveTimerBar.js';

interface AppHeaderProps {
  onOpenHistory?: () => void;
}

export function AppHeader({ onOpenHistory }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isTasksActive = location.pathname === '/';
  const isSummaryActive = location.pathname === '/summary';

  return (
    <>
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Left: Brand & Nav Links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center text-white text-xs font-semibold tracking-wider">
                ST
              </div>
              <span className="text-sm font-semibold text-zinc-900 tracking-tight">
                Suntek Tracker
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  isTasksActive
                    ? 'bg-zinc-100 text-zinc-900 font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Tasks</span>
              </Link>

              <Link
                to="/summary"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  isSummaryActive
                    ? 'bg-zinc-100 text-zinc-900 font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Daily Summary</span>
              </Link>
            </nav>
          </div>

          {/* Right: History & User Info & Logout */}
          <div className="flex items-center gap-3">
            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded transition-colors cursor-pointer"
                title="View time tracking history"
              >
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Time Logs</span>
              </button>
            )}

            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-zinc-900">{user?.name}</div>
              <div className="text-[11px] text-zinc-500">{user?.email}</div>
            </div>

            <button
              onClick={() => logout()}
              type="button"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 hover:border-zinc-300 px-3 py-1.5 rounded transition-colors cursor-pointer"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Persistent Active Timer Bar */}
      <ActiveTimerBar />
    </>
  );
}
