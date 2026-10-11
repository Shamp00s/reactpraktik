import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Пока идёт запрос к /api/auth/me (проверка сессии при F5) — не редиректим,
  // иначе залогиненного пользователя на мгновение выкинет на /login.
  if (isLoading) {
    return <div className="page-content container">Проверяем сессию…</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;