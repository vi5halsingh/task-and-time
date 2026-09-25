import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { CheckCircle2, Clock, ListTodo } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function HomePlaceholder() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-4">
          <Clock className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
          Task & Time Tracking App
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto text-base mb-8">
          Manage tasks, track your focused sessions with real-time timers, and view your daily productivity insights.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mt-8">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-2 text-indigo-600 font-semibold mb-1">
              <ListTodo className="w-4 h-4" />
              <span>Smart Tasks</span>
            </div>
            <p className="text-sm text-slate-500">
              Natural language creation enhanced with Gemini AI assistance.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-2 text-emerald-600 font-semibold mb-1">
              <Clock className="w-4 h-4" />
              <span>Real-Time Timer</span>
            </div>
            <p className="text-sm text-slate-500">
              Live tracking per task with session history and timestamps.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-2 text-amber-600 font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Daily Insights</span>
            </div>
            <p className="text-sm text-slate-500">
              Daily productivity metrics, completed counts, and time summaries.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Phase 1 Scaffolding Complete</span>
          <span>Backend Health Check: <code className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">/api/health</code></span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <header className="bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2.5 font-bold text-slate-900 text-lg">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Clock className="w-5 h-5" />
                </div>
                <span>Suntek Tracker</span>
              </Link>
              <div className="flex items-center space-x-3 text-sm text-slate-500">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Ready
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePlaceholder />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
