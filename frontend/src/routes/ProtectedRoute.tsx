import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { canAccessMenu } from '../lib/canAccessMenu';
import { MenuKey } from '../lib/rbac-constants';

/**
 * Guards a route two ways:
 *  1. No session → redirect to /login.
 *  2. Session exists but canAccessMenu() says no → redirect to /unauthorized,
 *     even if the user typed or bookmarked the URL directly (AC-07).
 *
 * This is still just the UI half of enforcement — the API calls the page
 * itself makes are re-checked by the backend's MenuGuard regardless of
 * whether this component let the route render (AC-08).
 */
export function ProtectedRoute({ menu, children }: { menu?: MenuKey; children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-center text-slate">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (menu && !canAccessMenu(user, menu)) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}
