import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Play, SlidersHorizontal, Plus } from 'lucide-react';

const formatClock = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/** Badge Deep Work com contador regressivo em tempo real. */
const DeepWorkBadge: React.FC = () => {
  const [remaining, setRemaining] = useState<number>(45 * 60);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 45 * 60));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-[#88C0A8]/30 bg-[#0E1319]/80 backdrop-blur-xl px-3.5 py-2.5 shadow-[0_0_25px_rgba(136,192,168,0.18)]">
      <span className="w-6 h-6 rounded-full bg-[#88C0A8]/15 border border-[#88C0A8]/40 flex items-center justify-center">
        <Plus className="w-3 h-3 text-[#88C0A8]" />
      </span>
      <div className="leading-tight">
        <div className="text-xs font-semibold text-slate-100">Deep Work // 45 min</div>
        <div className="font-mono text-[10px] text-[#88C0A8]">
          Alocação Otimizada · {formatClock(remaining)}
        </div>
      </div>
    </div>
  );
};

const CockpitMockup: React.FC = () => (
  <div
    className="relative mx-auto w-full max-w-3xl"
    style={{ perspective: '1600px' }}
  >
    <div
      className="rounded-2xl border border-white/10 bg-[#121820]/60 backdrop-blur-2xl p-4 sm:p-6 shadow-[0_40px_100px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)]"
      style={{ transform: 'rotateX(12deg) rotateY(-5deg)', transformStyle: 'preserve-3d' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
          Cadence Cockpit
        </span>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-4 sm:p-5">
        <div className="flex items-center justify-between font-mono text-[11px] sm:text-xs text-slate-300">
          <span>Capacidade Diária: 4h 30m / 5h 00m</span>
          <span className="text-[#88C0A8] font-bold">90%</span>
        </div>
        <div className="mt-2.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-[#88C0A8] to-[#569DAA]" />
        </div>

        {/* Onda senoidal de fluxo cognitivo */}
        <svg viewBox="0 0 400 90" className="mt-4 w-full h-16 sm:h-20" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="hero-wave" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#88C0A8" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#88C0A8" />
              <stop offset="100%" stopColor="#569DAA" />
            </linearGradient>
          </defs>
          <path
            d="M0 45 C 40 5, 80 5, 120 45 S 200 85, 240 45 S 320 5, 360 45 S 390 60, 400 45"
            stroke="url(#hero-wave)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="60" cy="14" r="3.5" fill="#569DAA" />
        </svg>

        <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono">
          {['Manhã · 2h', 'Tarde · 1h 30m', 'Noite · 1h'].map((label, idx) => (
            <div
              key={label}
              className={`rounded-lg border px-2.5 py-2 ${
                idx === 0
                  ? 'border-[#FB7185]/30 bg-[#FB7185]/5 text-slate-200'
                  : 'border-white/10 bg-white/[0.02] text-slate-500'
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const HeroSection: React.FC = () => (
  <section className="relative pt-32 sm:pt-40 pb-20 px-4 sm:px-6 overflow-hidden">
    {/* Iluminação volumétrica de fundo */}
    <div
      className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[1100px] h-[700px] pointer-events-none"
      style={{ background: 'radial-gradient(circle, rgba(86,157,170,0.15) 0%, rgba(9,11,14,0) 70%)' }}
      aria-hidden="true"
    />

    <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#2A3644] bg-[#121820] px-3.5 py-1.5 font-mono text-[11px] text-[#88C0A8] animate-fade-up">
        <span className="w-1.5 h-1.5 rounded-full bg-[#88C0A8] animate-pulse-dot" />
        [ RCCP ENGINE // O FIM DAS LISTAS INFINITAS ]
      </div>

      <h1 className="mt-7 font-display font-bold text-[32px] sm:text-[44px] lg:text-[52px] leading-[1.05] tracking-tight text-[#E2E8F0] max-w-3xl animate-fade-up">
        A mente humana não foi feita para <span className="text-[#4A5568]">listas infinitas</span>. Foi projetada para ter{' '}
        <span className="bg-gradient-to-r from-[#88C0A8] to-[#4FD1E8] bg-clip-text text-transparent">
          cadência
        </span>
        .
      </h1>

      <p className="mt-6 max-w-[680px] text-base leading-[1.6] text-[#94A3B8] animate-fade-up">
        Aplicamos o Rough-Cut Capacity Planning (PCP) — a mesma engenharia de capacidade usada na indústria de alta
        precisão — para proteger a sua rotina cognitiva contra a sobrecarga e o burnout.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 animate-fade-up">
        <Link
          to="/login"
          className="group inline-flex items-center gap-2 rounded-full bg-[#0E1319] border border-[#88C0A8] px-6 py-3 text-sm font-semibold text-[#E2E8F0] shadow-[0_0_25px_rgba(136,192,168,0.2)] hover:shadow-[0_0_45px_rgba(136,192,168,0.4)] transition-shadow"
        >
          Experimentar Gratuitamente
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <a
          href="#metodologia"
          className="inline-flex items-center gap-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
        >
          <span className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center">
            <Play className="w-2.5 h-2.5 fill-current" />
          </span>
          Como Funciona o PCP
        </a>
      </div>
    </div>

    {/* Mockup 3D + badges satélites */}
    <div className="relative max-w-4xl mx-auto mt-16 sm:mt-20">
      <div className="absolute -top-8 left-0 sm:-left-4 z-10 animate-float-slow">
        <DeepWorkBadge />
      </div>
      <div className="absolute -top-4 right-0 sm:-right-4 z-10 animate-float-slower hidden sm:block">
        <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#0E1319]/80 backdrop-blur-xl px-3.5 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#88C0A8]" />
          <div className="leading-tight">
            <div className="text-xs font-semibold text-slate-100">Capacidade Segura // 92%</div>
            <div className="font-mono text-[10px] text-slate-400">Saúde da rotina</div>
          </div>
        </div>
      </div>

      <CockpitMockup />

      <div className="absolute -bottom-6 left-0 sm:left-6 z-10 animate-float-slower">
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#569DAA]/30 bg-[#0E1319]/80 backdrop-blur-xl px-3.5 py-2.5 shadow-[0_0_25px_rgba(86,157,170,0.18)]">
          <SlidersHorizontal className="w-4 h-4 text-[#569DAA]" />
          <div className="text-xs font-semibold text-slate-100">Rebalanceamento Ativo</div>
        </div>
      </div>
    </div>
  </section>
);
