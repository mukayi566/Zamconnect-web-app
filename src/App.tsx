import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Citizens } from './pages/Citizens';
import { CitizenDetail } from './pages/CitizenDetail';
import { VerificationLogs } from './pages/VerificationLogs';
import { AuditLogs } from './pages/AuditLogs';
import { VerifyTool } from './pages/VerifyTool';
import { Settings } from './pages/Settings';
import { ApiControl } from './pages/ApiControl';
import { RegistrarDashboard } from './pages/registrar/RegistrarDashboard';
import { NotFound } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';

const DashboardSwitch = () => {
  const { user } = useAuthStore();
  if (user?.role === 'registrar') return <RegistrarDashboard />;
  return <Dashboard />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardSwitch />} />
              <Route path="/citizens" element={<Citizens />} />
              <Route path="/citizens/:id" element={<CitizenDetail />} />
              <Route path="/verification-logs" element={<VerificationLogs />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/verify" element={<VerifyTool />} />
              <Route path="/api-control" element={<ApiControl />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
