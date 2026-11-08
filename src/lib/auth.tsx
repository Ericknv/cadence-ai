import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabaseClient, isSupabaseConfigured } from './supabaseClient';

const DEMO_STORAGE_KEY = 'cadence:demo-mode';

interface AuthContextValue {
  user: User | null;
  isDemo: boolean;
  /** Verdadeiro enquanto a sessão do Supabase ainda está sendo resolvida. */
  isLoading: boolean;
  /** Usuário autenticado OU em modo demonstração. */
  hasAccess: boolean;
  setUser: (user: User | null) => void;
  enterDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const readDemoFlag = (): boolean => {
  try {
    return window.localStorage.getItem(DEMO_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(readDemoFlag);
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setUserState(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUserState(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const setUser = useCallback((next: User | null) => setUserState(next), []);

  const enterDemo = useCallback(() => {
    try {
      window.localStorage.setItem(DEMO_STORAGE_KEY, '1');
    } catch {
      /* armazenamento indisponível: o modo demo vale apenas para esta sessão */
    }
    setIsDemo(true);
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await supabaseClient.auth.signOut();
    }
    try {
      window.localStorage.removeItem(DEMO_STORAGE_KEY);
    } catch {
      /* noop */
    }
    setUserState(null);
    setIsDemo(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isDemo,
      isLoading,
      hasAccess: user !== null || isDemo,
      setUser,
      enterDemo,
      signOut,
    }),
    [user, isDemo, isLoading, setUser, enterDemo, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  }
  return ctx;
};
