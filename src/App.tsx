import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';

// Code-splitting: a landing pública não baixa o cockpit transacional.
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const CockpitApp = lazy(() => import('./pages/app/CockpitApp'));

const SplashScreen: React.FC = () => (
  <div className="min-h-screen bg-[#090B0E] flex items-center justify-center">
    <div className="w-2 h-2 rounded-full bg-[#88C0A8] animate-pulse-dot" />
  </div>
);

/** Rotas privadas: exigem sessão autenticada ou modo demonstração. */
const ProtectedRoute: React.FC = () => {
  const { hasAccess, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <SplashScreen />;
  if (!hasAccess) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

/** Rotas exclusivas para visitantes: usuário autenticado é enviado ao cockpit. */
const PublicOnlyRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <SplashScreen />;
  if (user) return <Navigate to="/app" replace />;
  return <Outlet />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<SplashScreen />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<Navigate to="/app/today" replace />} />
            <Route path="/app/:tab" element={<CockpitApp />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
