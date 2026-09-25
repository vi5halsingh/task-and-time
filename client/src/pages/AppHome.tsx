import { useAuth } from '../context/AuthContext.js';

export function AppHome() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center text-white text-xs font-semibold tracking-wider">
              ST
            </div>
            <span className="text-sm font-semibold text-zinc-900 tracking-tight">
              Suntek Tracker
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-zinc-900">{user?.name}</div>
              <div className="text-[11px] text-zinc-500">{user?.email}</div>
            </div>

            <button
              onClick={handleLogout}
              type="button"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 hover:border-zinc-300 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white border border-zinc-200 rounded-md p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-zinc-100 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Authenticated Session Active
              </div>
              <h1 className="text-lg font-semibold text-zinc-900">
                Welcome back, {user?.name}
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Your account is authenticated via secure HTTP-only cookies.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Member since {formattedDate}</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-zinc-200 rounded-md p-4 bg-zinc-50/50">
              <div className="text-xs font-medium text-zinc-500 mb-1">
                Account Details
              </div>
              <dl className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Name:</dt>
                  <dd className="font-medium text-zinc-900">{user?.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Email:</dt>
                  <dd className="font-medium text-zinc-900">{user?.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">User ID:</dt>
                  <dd className="font-mono text-[11px] text-zinc-600">{user?.id}</dd>
                </div>
              </dl>
            </div>

            <div className="border border-zinc-200 rounded-md p-4 bg-zinc-50/50">
              <div className="text-xs font-medium text-zinc-500 mb-1">
                Authentication Security
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-600">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>HTTP-only cookie protection</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>JWT verification middleware active</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Protected route authorization verified</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
            <span>Phase 2 (Authentication) ready for review</span>
            <span>Task & Timer engine will be connected in Phase 3 & 4</span>
          </div>
        </div>
      </main>
    </div>
  );
}
