import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { calcularDiagnosticoCognitivo, type Complexity } from './simulatorLogic';

const COMPLEXITIES: Complexity[] = ['Baixo', 'Médio', 'Alto'];

type Step = 'inputs' | 'diagnosis';

const formatHours = (h: number): string => h.toFixed(1).replace('.', ',');

/** Gráfico comparativo: caos (sem Cadence) vs. onda balanceada (com Cadence). */
const LoadWave: React.FC<{ load: number }> = ({ load }) => {
  const amp = Math.min(34, 8 + (load / 100) * 14);
  const chaos = `M0 45 L30 ${45 - amp} L55 ${45 + amp * 0.8} L85 ${45 - amp * 1.1} L110 ${45 + amp} L140 ${45 - amp * 0.7} L170 ${45 + amp * 1.1} L200 ${45 - amp} L230 ${45 + amp * 0.9} L260 ${45 - amp * 1.2} L290 ${45 + amp * 0.6} L320 ${45 - amp} L350 ${45 + amp} L400 45`;
  return (
    <svg viewBox="0 0 400 90" className="w-full h-20" fill="none" aria-hidden="true">
      <path d={chaos} stroke="#FB7185" strokeOpacity="0.45" strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d="M0 45 C 40 15, 80 15, 120 45 S 200 75, 240 45 S 320 15, 360 45 S 390 55, 400 45"
        stroke="#88C0A8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const SimulatorSection: React.FC = () => {
  const [horas, setHoras] = useState<number>(4);
  const [tarefas, setTarefas] = useState<number>(9);
  const [complexidade, setComplexidade] = useState<Complexity>('Médio');
  const [step, setStep] = useState<Step>('inputs');

  const diag = useMemo(
    () => calcularDiagnosticoCognitivo(horas, tarefas, complexidade),
    [horas, tarefas, complexidade]
  );

  const status: 'danger' | 'warn' | 'safe' = diag.burnoutRisk
    ? 'danger'
    : diag.percentualCarga >= 80
      ? 'warn'
      : 'safe';

  const statusStyles = {
    danger: { box: 'border-rose-500/30 bg-rose-950/30 text-rose-200', icon: 'text-rose-400' },
    warn: { box: 'border-amber-500/30 bg-amber-950/30 text-amber-200', icon: 'text-amber-400' },
    safe: { box: 'border-[#88C0A8]/30 bg-[#88C0A8]/10 text-[#B7DCC9]', icon: 'text-[#88C0A8]' },
  }[status];

  const statusText =
    status === 'danger'
      ? `ALERTA DE ESTRESSE: SOBRECARGA DE ${diag.percentualCarga}%`
      : status === 'warn'
        ? `ATENÇÃO: ${diag.percentualCarga}% DA CAPACIDADE — BANDEIRA AMARELA`
        : `CAPACIDADE SEGURA: ${diag.percentualCarga}% DO LIMITE`;

  return (
    <section id="simulador" className="relative scroll-mt-28 px-4 sm:px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">// Teste interativo</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#E2E8F0] max-w-2xl">
          Quanto do seu dia cabe, de verdade?
        </h2>

        <div className="mt-10 rounded-3xl border border-white/10 bg-[#0E1319]/80 backdrop-blur-xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div className="px-6 py-3.5 border-b border-white/10 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-slate-400">
            Simulador de capacidade cognitiva // rítmica em tempo real
          </div>

          {/* Mobile: fluxo em dois passos (Entradas → Diagnóstico) */}
          <div className="md:hidden flex border-b border-white/10 font-mono text-[11px]" role="tablist">
            {(['inputs', 'diagnosis'] as const).map((s, i) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={step === s}
                onClick={() => setStep(s)}
                className={`flex-1 py-2.5 transition-colors cursor-pointer ${
                  step === s ? 'text-[#88C0A8] border-b-2 border-[#88C0A8]' : 'text-slate-500'
                }`}
              >
                {i + 1}. {s === 'inputs' ? 'Entradas' : 'Diagnóstico'}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 md:divide-x divide-white/10">
            {/* Entradas */}
            <div className={`${step === 'inputs' ? 'block' : 'hidden'} md:block p-6 sm:p-8 space-y-7`}>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                Entropia atual (entradas do visitante)
              </p>

              <div>
                <label htmlFor="sim-horas" className="flex items-center justify-between text-sm text-slate-300">
                  <span>Horas Foco Disponíveis Hoje</span>
                  <span className="font-mono font-bold text-[#88C0A8]">{formatHours(horas)} h</span>
                </label>
                <input
                  id="sim-horas"
                  type="range"
                  min={1}
                  max={8}
                  step={0.5}
                  value={horas}
                  onChange={(e) => setHoras(Number(e.target.value))}
                  className="mt-3 w-full accent-[#88C0A8] cursor-pointer"
                />
              </div>

              <div>
                <label htmlFor="sim-tarefas" className="flex items-center justify-between text-sm text-slate-300">
                  <span>Quantidade de Tarefas Planejadas</span>
                  <span className="font-mono font-bold text-[#88C0A8]">{tarefas}</span>
                </label>
                <input
                  id="sim-tarefas"
                  type="range"
                  min={1}
                  max={12}
                  step={1}
                  value={tarefas}
                  onChange={(e) => setTarefas(Number(e.target.value))}
                  className="mt-3 w-full accent-[#88C0A8] cursor-pointer"
                />
              </div>

              <fieldset>
                <legend className="text-sm text-slate-300">Nível Médio de Complexidade</legend>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {COMPLEXITIES.map((c) => (
                    <label
                      key={c}
                      className={`cursor-pointer rounded-xl border px-3 py-2 text-center text-xs font-medium transition-colors ${
                        complexidade === c
                          ? 'border-[#88C0A8] bg-[#88C0A8]/10 text-[#88C0A8]'
                          : 'border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="complexidade"
                        value={c}
                        checked={complexidade === c}
                        onChange={() => setComplexidade(c)}
                        className="sr-only"
                      />
                      {c}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                type="button"
                onClick={() => setStep('diagnosis')}
                className="md:hidden w-full rounded-xl border border-[#88C0A8]/50 py-3 text-sm font-semibold text-[#88C0A8] cursor-pointer"
              >
                Ver diagnóstico →
              </button>
            </div>

            {/* Diagnóstico */}
            <div className={`${step === 'diagnosis' ? 'flex' : 'hidden'} md:flex flex-col p-6 sm:p-8`}>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                Diagnóstico do motor Cadence AI
              </p>

              <div className="mt-5 font-mono text-sm text-slate-300">
                Capacidade Alocada:{' '}
                <span className="font-bold text-slate-100">
                  [ {formatHours(diag.horasNecessarias)}h de {formatHours(horas)}h Real ]
                </span>
              </div>

              <div
                role="status"
                aria-live="polite"
                className={`mt-3 flex items-start gap-2.5 rounded-xl border p-3 font-mono text-xs font-semibold ${statusStyles.box}`}
              >
                {status === 'safe' ? (
                  <ShieldCheck className={`w-4 h-4 shrink-0 ${statusStyles.icon}`} />
                ) : (
                  <AlertTriangle className={`w-4 h-4 shrink-0 ${statusStyles.icon}`} />
                )}
                {statusText}
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Resultado com Cadence AI</p>
                <p className="flex items-start gap-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#88C0A8]" />
                  <span>
                    <strong className="font-mono">{diag.tarefasHojePossiveis}</strong> tarefas prioritárias alocadas hoje (
                    {formatHours(diag.horasAlocadas)}h)
                  </span>
                </p>
                <p className="flex items-start gap-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#569DAA]" />
                  <span>
                    <strong className="font-mono">{diag.tarefasDiferidas}</strong> tarefas diferidas sem culpa na semana
                  </span>
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 px-3 pt-2">
                <LoadWave load={diag.percentualCarga} />
                <div className="flex justify-between pb-2 font-mono text-[10px] text-slate-500">
                  <span className="text-rose-300/70">— sem Cadence</span>
                  <span className="text-[#88C0A8]">— com Cadence</span>
                </div>
              </div>

              <Link
                to="/login"
                className="mt-6 md:mt-auto md:pt-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#88C0A8] hover:bg-[#9ad0b8] px-5 py-3.5 text-sm font-semibold text-[#06120D] shadow-[0_0_25px_rgba(136,192,168,0.25)] transition-colors"
              >
                Automatizar com Cadence AI
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
