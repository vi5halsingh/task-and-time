import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { TimerProvider } from './context/TimerContext.js';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { TaskDashboard } from './pages/TaskDashboard.js';
import { DailySummaryPage } from './pages/DailySummaryPage.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TimerProvider>
            <Routes>
              {/* Public only routes: redirected to / if already logged in */}
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Protected routes: redirected to /login if unauthenticated */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<TaskDashboard />} />
                <Route path="/summary" element={<DailySummaryPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </TimerProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
