import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  UserPlus,
  LogIn,
  Check,
  X as XIcon,
  ShieldCheck,
} from 'lucide-react';
import { CadenceLogo } from '../../components/brand/CadenceLogo';
import { supabaseClient, isSupabaseConfigured } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/auth';

type AuthMethod = 'magic' | 'password';
type AuthMode = 'signin' | 'signup';

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

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { enterDemo } = useAuth();
  const configured = isSupabaseConfigured();

  const initialMode: AuthMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [method, setMethod] = useState<AuthMethod>('magic');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [touched, setTouched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  // Redirecionamento suave caso haja token na URL (#access_token=...)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      if (configured) {
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            navigate('/app/today', { replace: true });
          }
        });
      }
    }
  }, [configured, navigate]);

  // Checagens de Força de Senha
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const strengthScore = [hasMinLength, hasNumber, hasUppercase, hasSymbol].filter(Boolean).length;
  const isPasswordStrong = strengthScore === 4;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const isEmailValid = EMAIL_PATTERN.test(email.trim());
  const showEmailError = touched && email.length > 0 && !isEmailValid;

  // Validação estrita do botão de submissão
  const canSubmit =
    isEmailValid &&
    !isLoading &&
    (method === 'magic'
      ? true
      : mode === 'signin'
      ? password.length >= 6
      : isPasswordStrong && passwordsMatch);

  const missingConfigMessage: FeedbackMessage = {
    type: 'error',
    text: 'Autenticação remota indisponível (Supabase não configurado). Use o Modo Demonstração.',
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setMessage(null);
    setConfirmPassword('');
    setSearchParams(newMode === 'signup' ? { mode: 'signup' } : {});
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
      options: {
        redirectTo: `${window.location.origin}/app/today`,
      },
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
          options: {
            emailRedirectTo: `${window.location.origin}/app/today`,
          },
        });
        if (error) throw error;
        setMessage({
          type: 'success',
          text:
            mode === 'signup'
              ? 'Link de ativação enviado! Acesse seu e-mail para validar a conta e entrar.'
              : 'Magic Link enviado! Verifique sua caixa de entrada para acessar o cockpit.',
        });
      } else {
        if (mode === 'signup') {
          if (!isPasswordStrong || !passwordsMatch) {
            setMessage({
              type: 'error',
              text: 'A senha precisa cumprir todos os requisitos de segurança e coincidir na confirmação.',
            });
            setIsLoading(false);
            return;
          }

          const { data, error } = await supabaseClient.auth.signUp({
            email: email.trim(),
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/app/today`,
            },
          });
          if (error) throw error;
          if (data.session) {
            setMessage({ type: 'success', text: 'Conta criada e autenticada com sucesso!' });
            navigate('/app/today', { replace: true });
          } else {
            setMessage({
              type: 'success',
              text: 'Conta criada com sucesso! Verifique o link de confirmação enviado ao seu e-mail.',
            });
          }
        } else {
          const { error } = await supabaseClient.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (error) throw error;
          navigate('/app/today', { replace: true });
        }
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

  const getStrengthLabel = () => {
    if (strengthScore <= 1) return { text: 'Fraca', color: 'text-rose-400', bg: 'bg-rose-500' };
    if (strengthScore === 2) return { text: 'Razoável', color: 'text-amber-400', bg: 'bg-amber-500' };
    if (strengthScore === 3) return { text: 'Boa', color: 'text-sky-400', bg: 'bg-sky-500' };
    return { text: 'Forte (Pronta)', color: 'text-[#88C0A8]', bg: 'bg-[#88C0A8]' };
  };

  const strength = getStrengthLabel();

  return (
    <div className="relative min-h-screen bg-[#090B0E] text-slate-100 flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      {/* Orbe difusa central com respiração de 8s */}
      <div
        className="absolute top-1/2 left-1/2 w-[560px] h-[560px] rounded-full pointer-events-none animate-orb-breathe blur-[110px]"
        style={{
          background:
            'radial-gradient(circle, rgba(136,192,168,0.35) 0%, rgba(86,157,170,0.22) 45%, rgba(9,11,14,0) 70%)',
        }}
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
        <Link to="/" className="mb-6" aria-label="Cadence AI">
          <CadenceLogo size={36} subtitle="Cognitive Capacity Engineering" />
        </Link>

        <div className="w-full max-w-[440px] rounded-3xl border border-white/10 bg-[rgba(18,24,32,0.75)] backdrop-blur-3xl p-7 shadow-[0_30px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)]">
          {/* Toggle Dual: Acessar Conta vs Criar Nova Conta */}
          <div className="grid grid-cols-2 p-1 mb-5 rounded-2xl bg-black/40 border border-white/10 font-mono text-xs">
            <button
              type="button"
              onClick={() => handleModeChange('signin')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all cursor-pointer font-medium ${
                mode === 'signin'
                  ? 'bg-white/15 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Acessar Conta</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('signup')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all cursor-pointer font-medium ${
                mode === 'signup'
                  ? 'bg-[#88C0A8]/20 text-[#88C0A8] border border-[#88C0A8]/30 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Criar Nova Conta</span>
            </button>
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight text-[#E2E8F0]">
            {mode === 'signup' ? 'Inicie sua cadência.' : 'Bem-vindo de volta.'}
          </h1>
          <p className="mt-1.5 text-sm text-[#94A3B8] leading-relaxed">
            {mode === 'signup'
              ? 'Crie sua conta para proteger sua rotina contra a sobrecarga.'
              : 'Respire fundo e retome sua cadência.'}
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
            {mode === 'signup' ? 'Cadastrar com Google' : 'Continuar com Google'}
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
                Seu melhor e-mail
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="seu.email@exemplo.com"
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
              <>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                      <Lock className="w-3.5 h-3.5" />
                      {mode === 'signup' ? 'Senha' : 'Senha'}
                    </label>
                    {mode === 'signup' && password.length > 0 && (
                      <span className={`text-[10px] font-mono ${strength.color}`}>
                        Força: {strength.text}
                      </span>
                    )}
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 rounded-xl bg-black/30 border border-white/10 px-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#88C0A8]/60 transition-colors font-mono"
                  />

                  {/* Indicador de Força de Senha no Cadastro */}
                  {mode === 'signup' && password.length > 0 && (
                    <div className="pt-1 space-y-2">
                      <div className="flex gap-1.5 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              strengthScore >= step ? strength.bg : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono pt-1 text-slate-400">
                        <span className={`flex items-center gap-1 ${hasMinLength ? 'text-[#88C0A8]' : 'text-slate-500'}`}>
                          {hasMinLength ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
                          8+ caracteres
                        </span>
                        <span className={`flex items-center gap-1 ${hasUppercase ? 'text-[#88C0A8]' : 'text-slate-500'}`}>
                          {hasUppercase ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
                          1 maiúscula
                        </span>
                        <span className={`flex items-center gap-1 ${hasNumber ? 'text-[#88C0A8]' : 'text-slate-500'}`}>
                          {hasNumber ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
                          1 número
                        </span>
                        <span className={`flex items-center gap-1 ${hasSymbol ? 'text-[#88C0A8]' : 'text-slate-500'}`}>
                          {hasSymbol ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
                          1 símbolo (!@#$)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Campo Confirmar Senha */}
                {mode === 'signup' && (
                  <div className="space-y-1.5 pt-1">
                    <label htmlFor="confirm-password" className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Confirmar Senha
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita sua senha exatamente"
                      className={`w-full h-11 rounded-xl bg-black/30 border px-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors font-mono ${
                        confirmPassword.length > 0
                          ? passwordsMatch
                            ? 'border-[#88C0A8]/60 focus:border-[#88C0A8]'
                            : 'border-rose-500/60 focus:border-rose-400'
                          : 'border-white/10 focus:border-[#88C0A8]/60'
                      }`}
                    />
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="text-[11px] text-rose-400 font-mono">As senhas não coincidem.</p>
                    )}
                  </div>
                )}
              </>
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
                  {method === 'magic'
                    ? mode === 'signup'
                      ? 'Criar Conta com Magic Link'
                      : 'Enviar Magic Link'
                    : mode === 'signup'
                    ? 'Criar Conta'
                    : 'Entrar'}
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
              {method === 'magic'
                ? 'Prefere autenticar com senha?'
                : 'Prefere receber um Magic Link por e-mail?'}
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
          Ao continuar, você aceita os Termos e Políticas de Privacidade do Cadence AI.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
