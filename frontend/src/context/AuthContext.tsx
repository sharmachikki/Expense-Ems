import { createContext, ReactNode, useContext, useEffect, useState, useCallback } from 'react';
import { api, setAccessToken } from '../lib/api';
import { AuthorizableUser, MenuKey } from '../lib/rbac-constants';

interface CurrentUser extends AuthorizableUser {
  id: string;
  email: string;
  companyId: string | null;
  // Server-computed, from MenuPermissionService.getVisibleMenus() — used
  // only to build the nav; every route/API call is still re-checked
  // independently by the backend.
  visibleMenus: MenuKey[];
}

interface AuthState {
  user: CurrentUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const res = await api.get<CurrentUser>('/users/me');
    setUser(res.data);
  }, []);

  useEffect(() => {
    // On first load there's no access token in memory yet — try the
    // refresh cookie silently before deciding the user is logged out.
    (async () => {
      try {
        const res = await api.post('/auth/refresh');
        setAccessToken(res.data.accessToken);
        await loadMe();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post('/auth/login', { email, password });
      setAccessToken(res.data.accessToken);
      await loadMe();
    },
    [loadMe],
  );

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setAccessToken(null);
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
