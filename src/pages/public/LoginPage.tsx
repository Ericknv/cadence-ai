import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Lock, Mail } from 'lucide-react';
import { CadenceLogo } from '../../components/brand/CadenceLogo';
import { supabaseClient, isSupabaseConfigured } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/auth';

type AuthMethod = 'magic' | 'password';

interface FeedbackMessage {
  type: 'error' | 'success';
  text: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const GoogleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" aria-hidden="true">
    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3a7.2 7.2 0 0 1-4.06 1.16c-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78l4-3.1z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.27 6.61l4 3.1C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
);

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { enterDemo } = useAuth();
  const configured = isSupabaseConfigured();

  const [method, setMethod] = useState<AuthMethod>('magic');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [touched, setTouched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  const isEmailValid = EMAIL_PATTERN.test(email.trim());
  const showEmailError = touched && email.length > 0 && !isEmailValid;
  const canSubmit = isEmailValid && (method === 'magic' || password.length >= 6) && !isLoading;

  const missingConfigMessage: FeedbackMessage = {
    type: 'error',
    text: 'Autenticação indisponível neste ambiente (Supabase não configurado). Use o Modo Demonstração.',
  };

  const handleGoogle = async () => {
    if (!configured) {
      setMessage(missingConfigMessage);
      return;
    }
    setIsGoogleLoading(true);
    setMessage(null);
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app` },
    });
    if (error) {
      setMessage({ type: 'error', text: error.message });
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    if (!configured) {
      setMessage(missingConfigMessage);
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      if (method === 'magic') {
        const { error } = await supabaseClient.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Magic Link enviado! Verifique sua caixa de entrada para acessar.' });
      } else {
        const { error } = await supabaseClient.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        // A sessão atualiza o AuthProvider e PublicOnlyRoute redireciona para /app.
      }
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Falha na autenticação.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = () => {
    enterDemo();
    navigate('/app/today');
  };

  return (
    <div className="relative min-h-screen bg-[#090B0E] text-slate-100 flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      {/* Orbe difusa central com respiração de 8s */}
      <div
        className="absolute top-1/2 left-1/2 w-[560px] h-[560px] rounded-full pointer-events-none animate-orb-breathe blur-[110px]"
        style={{ background: 'radial-gradient(circle, rgba(136,192,168,0.35) 0%, rgba(86,157,170,0.22) 45%, rgba(9,11,14,0) 70%)' }}
        aria-hidden="true"
      />

      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors z-10"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar ao site
      </Link>

      <div className="relative z-10 flex flex-col items-center w-full">
        <Link to="/" className="mb-8" aria-label="Cadence AI">
          <CadenceLogo size={36} subtitle="Cognitive Capacity Engineering" />
        </Link>

        <div className="w-full max-w-[420px] rounded-3xl border border-white/10 bg-[rgba(18,24,32,0.75)] backdrop-blur-3xl p-7 shadow-[0_30px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)]">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#E2E8F0]">Bem-vindo de volta.</h1>
          <p className="mt-1.5 text-sm text-[#94A3B8] leading-relaxed">
            Respire fundo e retome sua cadência.
          </p>

          {message && (
            <div
              role="status"
              className={`mt-5 flex items-start gap-2 rounded-xl p-3 text-xs border ${
                message.type === 'success'
                  ? 'bg-emerald-950/40 text-emerald-200 border-emerald-500/30'
                  : 'bg-rose-950/40 text-rose-200 border-rose-500/30'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <p className="leading-relaxed">{message.text}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogle}
            disabled={isGoogleLoading}
            className="mt-6 w-full h-12 rounded-xl flex items-center justify-center gap-3 text-sm font-medium text-slate-100 bg-white/5 border border-white/10 hover:bg-white/10 hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.06)] transition-all cursor-pointer disabled:opacity-60"
          >
            {isGoogleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
            Continuar com Google
          </button>

          <div className="my-5 flex items-center gap-3 text-[11px] font-mono text-slate-500">
            <div className="h-px flex-1 bg-white/10" />
            ou
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <Mail className="w-3.5 h-3.5" />
                Seu E-mail Corporativo
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="seu.nome@empresa.com"
                aria-invalid={showEmailError}
                className={`w-full h-11 rounded-xl bg-black/30 border px-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors ${
                  showEmailError
                    ? 'border-rose-500/60 focus:border-rose-400'
                    : isEmailValid
                      ? 'border-[#88C0A8]/50 focus:border-[#88C0A8]'
                      : 'border-white/10 focus:border-[#88C0A8]/60'
                }`}
              />
              {showEmailError && (
                <p className="text-[11px] text-rose-300 font-mono">Informe um e-mail válido.</p>
              )}
            </div>

            {method === 'password' && (
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                  <Lock className="w-3.5 h-3.5" />
                  Senha
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#88C0A8]/60 transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-[#06120D] bg-[#88C0A8] hover:bg-[#9ad0b8] shadow-[0_0_25px_rgba(136,192,168,0.25)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {method === 'magic' ? 'Enviar Magic Link' : 'Entrar'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod(method === 'magic' ? 'password' : 'magic');
                setMessage(null);
              }}
              className="w-full text-center text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              {method === 'magic' ? 'Prefere usar senha?' : 'Prefere receber um Magic Link?'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleDemo}
            className="mt-5 w-full h-11 rounded-xl text-xs font-mono text-slate-300 border border-dashed border-white/15 hover:border-[#88C0A8]/40 hover:text-[#88C0A8] hover:bg-white/5 transition-colors cursor-pointer"
          >
            Acessar Modo Demonstração (Sem Conta)
          </button>
        </div>

        <p className="mt-6 max-w-[320px] text-center text-[11px] text-slate-500 leading-relaxed">
          Ao continuar, você aceita os Termos e Políticas do Cadence.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
