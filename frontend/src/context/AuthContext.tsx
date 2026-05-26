import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { authService, type LoginInput, type RegisterInput } from '../services/authService';
import type { User } from '../types/domain';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const authTokenKey = 'stockiq_token';

const getStoredToken = () => localStorage.getItem(authTokenKey);

const setStoredToken = (token: string) => {
  localStorage.setItem(authTokenKey, token);
};

const clearStoredToken = () => {
  localStorage.removeItem(authTokenKey);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!getStoredToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await authService.profile();
      setUser(profile);
    } catch {
      clearStoredToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    const handleExpiredSession = () => {
      clearStoredToken();
      setUser(null);
      setLoading(false);
    };

    window.addEventListener('stockiq:auth-expired', handleExpiredSession);
    return () => window.removeEventListener('stockiq:auth-expired', handleExpiredSession);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const payload = await authService.login(input);
    setStoredToken(payload.token);
    setUser(payload.user);
    toast.success('Welcome back to StockIQ');
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const payload = await authService.register(input);
    setStoredToken(payload.token);
    setUser(payload.user);
    toast.success('Your StockIQ account is ready');
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    clearStoredToken();
    setUser(null);
    toast.success('Signed out securely');
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, loading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return value;
}
