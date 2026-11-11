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

export const getAuthRedirectTarget = (): string => {
  return typeof window !== 'undefined'
    ? `${window.location.origin}/app/today`
    : 'https://cadence-ai-yvph.onrender.com/app/today';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(readDemoFlag);
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured());

  // Tratamento automático e suave de tokens retornados na URL (#access_token=... ou ?code=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    const search = window.location.search;

    const hasAccessToken = hash.includes('access_token=') || hash.includes('type=recovery');
    const hasAuthCode = search.includes('code=');
    const hasError =
      search.includes('error=') ||
      search.includes('error_code=') ||
      hash.includes('error=') ||
      hash.includes('error_code=');

    if (hasError) {
      setIsLoading(false);
      return;
    }

    if (hasAccessToken || hasAuthCode) {
      // Se detectado token de Magic Link / OAuth na URL, redireciona suavemente para /app/today
      if (isSupabaseConfigured()) {
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            setUserState(session.user);
            setIsLoading(false);
            if (window.location.pathname !== '/app/today') {
              window.history.replaceState(null, '', '/app/today');
            }
          }
        });
      }
    }
  }, []);

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
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      setUserState(session?.user ?? null);
      setIsLoading(false);

      // Redirecionamento suave em login via link ou OAuth externo
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        if (window.location.hash.includes('access_token=')) {
          window.history.replaceState(null, '', '/app/today');
        }
      }
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
