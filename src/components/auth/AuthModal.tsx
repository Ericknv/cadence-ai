import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  X,
  Lock,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { supabaseClient, isSupabaseConfigured } from '../../lib/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null
  );

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Preencha o e-mail e a senha.' });
      return;
    }

    if (!isConfigured) {
      setMessage({
        type: 'error',
        text: 'Supabase ainda não configurado no ambiente. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas configurações ou use o Modo Demonstração.',
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          setMessage({ type: 'success', text: 'Conta criada e autenticada com sucesso!' });
          onAuthSuccess(data.user);
          setTimeout(() => onClose(), 1000);
        } else {
          setMessage({
            type: 'success',
            text: 'Conta criada! Verifique seu e-mail para confirmação se exigido pelo Supabase.',
          });
        }
      } else {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage({ type: 'success', text: 'Login realizado com sucesso!' });
        onAuthSuccess(data.user);
        setTimeout(() => onClose(), 800);
      }
    } catch (err: unknown) {
      console.error('[Supabase Auth Error]:', err);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Falha na autenticação do Supabase',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-750 rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              Autenticação Supabase
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                PostgreSQL RLS
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Conecte sua conta para persistência isolada com Row Level Security
            </p>
          </div>
        </div>

        {!isConfigured && (
          <div className="mb-4 p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-amber-300">
              <AlertCircle className="w-3.5 h-3.5" />
              Credenciais do Supabase ausentes no momento
            </div>
            <p className="leading-relaxed text-[11px] text-amber-200/90 font-sans">
              Para sincronizar com seu banco remoto, adicione <code className="bg-amber-950 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_URL</code> e <code className="bg-amber-950 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_ANON_KEY</code> nas variáveis de ambiente.
            </p>
          </div>
        )}

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-xs flex items-start gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60'
                : 'bg-rose-950/50 text-rose-300 border border-rose-800/60'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            )}
            <p className="leading-relaxed">{message.text}</p>
          </div>
        )}

        {/* Abas Entrar / Cadastrar */}
        <div className="flex border-b border-zinc-800 mb-4 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setMessage(null);
            }}
            className={`flex-1 py-2 text-center border-b-2 font-medium transition-colors cursor-pointer ${
              mode === 'signin'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setMessage(null);
            }}
            className={`flex-1 py-2 text-center border-b-2 font-medium transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              <span>E-mail</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@engenharia.com"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Senha</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              minLength={6}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/50 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Acessar com Supabase' : 'Criar Nova Conta'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-colors cursor-pointer"
            >
              Continuar no Modo Demonstração (Mocks / Local)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
