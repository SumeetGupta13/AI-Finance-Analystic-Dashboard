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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem('finora_token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const profile = await authService.profile();
      setUser(profile);
    } catch {
      localStorage.removeItem('finora_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(async (input: LoginInput) => {
    const payload = await authService.login(input);
    localStorage.setItem('finora_token', payload.token);
    setUser(payload.user);
    toast.success('Welcome back to FINORA');
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const payload = await authService.register(input);
    localStorage.setItem('finora_token', payload.token);
    setUser(payload.user);
    toast.success('Your FINORA account is ready');
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    localStorage.removeItem('finora_token');
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
