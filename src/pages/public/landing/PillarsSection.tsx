import React, { useRef, useState } from 'react';
import { X, Sparkles, Brain, Clock, CheckCircle2, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Pillar {
  index: string;
  title: string;
  accent: string;
  concept: string;
  steps: string[];
  cta: string;
  preview: React.ReactNode;
}

const PillarPreview: React.FC<{ accent: string; bars: number[] }> = ({ accent, bars }) => (
  <div className="flex items-end gap-1.5 h-14">
    {bars.map((h, i) => (
      <div
        key={i}
        className="flex-1 rounded-sm transition-all duration-300"
        style={{ height: `${h}%`, background: accent, opacity: 0.25 + (h / 100) * 0.6 }}
      />
    ))}
  </div>
);

const PILLARS: Pillar[] = [
  {
    index: '01',
    title: 'Harmonia de Capacidade Real',
    accent: '#7BDCB5',
    concept:
      'A barreira acolhedora contra a sobrecarga: calculamos o limite biológico de foco real diário, protegendo sua mente contra a exaustão.',
    steps: [
      'Leitura de compromissos e rotina biológica.',
      'Garantia de transições suaves e descanso prioritário.',
      'Ajuste acolhedor aos 80% do limite, sem alarmes vermelhos de pânico.',
    ],
    cta: 'Ver Gráfico de Carga',
    preview: <PillarPreview accent="#7BDCB5" bars={[40, 55, 70, 80, 100, 60]} />,
  },
  {
    index: '02',
    title: 'Decomposição Atômica por IA',
    accent: '#569DAA',
    concept:
      'Fatiamento automático de ementas densas em blocos executáveis, sem fadiga decisória e com classificação de esforço mental.',
    steps: [
      'Você informa um tema, arquivo ou link.',
      'A IA divide o conteúdo em módulos de no máximo 60 minutos.',
      'Cada bloco recebe carga cognitiva: Baixa, Média ou Alta.',
    ],
    cta: 'Simular Fatiamento de Ementa',
    preview: <PillarPreview accent="#569DAA" bars={[30, 30, 60, 30, 90, 60]} />,
  },
  {
    index: '03',
    title: 'Rebalanceamento Neurofisiológico',
    accent: '#A0AEC0',
    concept:
      'Redistribuição sem culpa e sem atrito quando imprevistos acontecem: nenhuma notificação punitiva, nenhum acúmulo em atraso.',
    steps: [
      'Tarefa interrompida ou estourada aciona o reagendamento passivo.',
      'Ela desliza para a próxima janela de capacidade livre da semana.',
      'Sem alertas vermelhos, sem lista de atrasados.',
    ],
    cta: 'Ver Curva de Reajuste',
    preview: <PillarPreview accent="#A0AEC0" bars={[90, 70, 55, 50, 50, 45]} />,
  },
];

export const PillarsSection: React.FC = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isUFAMModalOpen, setIsUFAMModalOpen] = useState<boolean>(false);
  const [isCurveModalOpen, setIsCurveModalOpen] = useState<boolean>(false);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / PILLARS.length;
    setActiveIndex(Math.min(PILLARS.length - 1, Math.round(el.scrollLeft / cardWidth)));
  };

  const goTo = (idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: (el.scrollWidth / PILLARS.length) * idx, behavior: 'smooth' });
  };

  const handlePillarAction = (index: string) => {
    if (index === '01') {
      // Rola suavemente até o simulador e dispara preset de sobrecarga
      const simElement = document.getElementById('simulador');
      if (simElement) {
        simElement.scrollIntoView({ behavior: 'smooth' });
        window.dispatchEvent(new CustomEvent('cadence:apply-preset-overload'));
      }
    } else if (index === '02') {
      setIsUFAMModalOpen(true);
    } else if (index === '03') {
      setIsCurveModalOpen(true);
    }
  };

  return (
    <section id="metodologia" className="relative scroll-mt-28 px-4 sm:px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">// Metodologia</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#E2E8F0] max-w-2xl">
          Três pilares para uma rotina que respira.
        </h2>

        {/* Mobile: carrossel com swipe. Desktop: grid de 3 colunas. */}
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="mt-12 flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible"
        >
          {PILLARS.map((pillar) => (
            <article
              key={pillar.index}
              className="group relative snap-center shrink-0 w-[86%] sm:w-[60%] lg:w-auto min-h-[460px] flex flex-col rounded-3xl border bg-[#0E1319]/80 backdrop-blur-xl p-7 overflow-hidden transition-all duration-300 lg:hover:-translate-y-1.5"
              style={{ borderColor: `${pillar.accent}40` }}
            >
              <span
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ boxShadow: `inset 0 0 0 1px ${pillar.accent}99, 0 0 40px ${pillar.accent}22` }}
                aria-hidden="true"
              />
              <span
                className="absolute -top-4 right-3 font-display font-bold leading-none text-[140px] text-outline select-none pointer-events-none"
                aria-hidden="true"
              >
                {pillar.index}
              </span>

              <div className="relative mt-24">
                <h3 className="font-display text-sm font-semibold uppercase tracking-wider" style={{ color: pillar.accent }}>
                  {pillar.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-200">{pillar.concept}</p>
                <ol className="mt-5 space-y-2.5">
                  {pillar.steps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-xs leading-relaxed text-[#94A3B8]">
                      <span className="font-mono shrink-0" style={{ color: pillar.accent }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="relative mt-auto pt-6">
                {/* Visualizador interno revelado ao hover */}
                <div className="mb-4 rounded-xl border border-white/10 bg-black/30 p-3 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
                  {pillar.preview}
                </div>
                <button
                  type="button"
                  onClick={() => handlePillarAction(pillar.index)}
                  className="w-full text-left inline-flex items-center justify-between rounded-full border px-4 py-2 font-mono text-[11px] font-semibold transition-all hover:bg-white/5 cursor-pointer"
                  style={{ borderColor: `${pillar.accent}66`, color: pillar.accent }}
                >
                  <span>[ {pillar.cta} ]</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="lg:hidden mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Pilares">
          {PILLARS.map((pillar, idx) => (
            <button
              key={pillar.index}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Pilar ${pillar.index}`}
              onClick={() => goTo(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === activeIndex ? 'w-6 bg-[#88C0A8]' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* MODAL 02: Decomposição Atômica de Ementa UFAM */}
      {isUFAMModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#090B0E]/95 border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl backdrop-blur-3xl relative">
            <button
              type="button"
              onClick={() => setIsUFAMModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-100 p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Fechar modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#569DAA] bg-[#569DAA]/10 px-2.5 py-0.5 rounded-full border border-[#569DAA]/30">
                <Sparkles className="w-3 h-3" />
                Simulação de Fatiamento de Ementa Real
              </span>
              <h3 className="text-lg font-bold text-slate-100 font-display">
                Pesquisa Operacional I — Eng. de Produção UFAM
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Ementa densa de 60 horas fatiada automaticamente em 4 blocos atômicos executáveis.
              </p>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {[
                {
                  id: 1,
                  title: 'Programação Linear & Modelagem Canônica',
                  duration: '45m',
                  effort: 'Médio',
                  effortColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
                  goal: 'Formulação clara de objetivos cognitivos e modelagem de equilíbrio da rotina.',
                },
                {
                  id: 2,
                  title: 'Algoritmo Simplex Primal & Resolução Matricial',
                  duration: '45m',
                  effort: 'Deep Work (Alto)',
                  effortColor: 'text-[#FB7185] border-[#FB7185]/30 bg-[#FB7185]/10',
                  goal: 'Pivoteamento manual de base e determinação do vetor de custos relativos.',
                },
                {
                  id: 3,
                  title: 'Teoria da Dualidade & Preços-Sombra',
                  duration: '45m',
                  effort: 'Médio',
                  effortColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
                  goal: 'Interpretação econômica do problema dual e folgas complementares.',
                },
                {
                  id: 4,
                  title: 'Análise de Sensibilidade & Intervalos de Viabilidade',
                  duration: '45m',
                  effort: 'Baixo',
                  effortColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
                  goal: 'Variação paramétrica do vetor de recursos sem alterar a base ótima.',
                },
              ].map((sess) => (
                <div
                  key={sess.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 space-y-2 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                        Bloco #{sess.id}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-200 font-mono">{sess.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${sess.effortColor}`}>
                        {sess.effort}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {sess.duration}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans pl-1 border-l-2 border-[#569DAA]/40">
                    {sess.goal}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-[11px] font-mono text-slate-400">
                Total Fatiado: 3h 00m em 4 micro-ciclos
              </span>
              <Link
                to="/login?mode=signup"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-bold bg-[#569DAA] hover:bg-[#68b3c2] text-slate-950 transition-colors cursor-pointer"
              >
                <span>Fatiar Minha Ementa com IA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 03: Curva Senoidal de Rebalanceamento Neurofisiológico */}
      {isCurveModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#090B0E]/95 border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl backdrop-blur-3xl relative">
            <button
              type="button"
              onClick={() => setIsCurveModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-100 p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Fechar modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#A0AEC0] bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                <Activity className="w-3 h-3 text-[#88C0A8]" />
                Mecânica de Rebalanceamento Passivo
              </span>
              <h3 className="text-lg font-bold text-slate-100 font-display">
                Curva Senoidal de Amortecimento de Carga
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Quando um compromisso estoura ou a energia biológica cai, o motor passivo redistribui o excedente
                para a próxima janela livre da semana, sem listas vermelhas punitivas.
              </p>
            </div>

            {/* Visualizador da Curva */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Segunda-feira (Imprevisto)</span>
                <span className="text-[#88C0A8]">Quarta-feira (Amortecimento Suave)</span>
              </div>

              <svg viewBox="0 0 500 120" className="w-full h-28" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="rebalance-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FB7185" stopOpacity="0.8" />
                    <stop offset="40%" stopColor="#FB7185" stopOpacity="0.3" />
                    <stop offset="70%" stopColor="#88C0A8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#569DAA" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                {/* Linha guia de teto diário */}
                <line x1="0" y1="35" x2="500" y2="35" stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
                <text x="10" y="30" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="monospace">
                  Teto Seguro de Foco (4.5h)
                </text>

                {/* Curva de sobrecarga amortecida */}
                <path
                  d="M0 80 Q 75 10, 150 70 T 300 65 T 450 65 L 500 65"
                  stroke="url(#rebalance-grad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Ponto de imprevisto */}
                <circle cx="75" cy="30" r="5" fill="#FB7185" />
                <text x="85" y="25" fill="#FB7185" fontSize="10" fontFamily="monospace">
                  Sobrecarga detectada
                </text>

                {/* Ponto de redistribuição segura */}
                <circle cx="375" cy="65" r="5" fill="#88C0A8" />
                <text x="310" y="95" fill="#88C0A8" fontSize="10" fontFamily="monospace">
                  Folga de quarta aproveitada
                </text>
              </svg>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 font-mono text-[11px]">
                <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/20 text-rose-300">
                  <div className="font-bold">Sem Cadence</div>
                  <div className="text-[10px] text-rose-400/80">6 tarefas acumuladas com culpa em atraso</div>
                </div>
                <div className="p-2 rounded-lg bg-[#88C0A8]/10 border border-[#88C0A8]/20 text-[#B7DCC9]">
                  <div className="font-bold">Com Cadence</div>
                  <div className="text-[10px] text-[#88C0A8]">Carga redistribuída respeitando o teto fisiológico</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsCurveModalOpen(false)}
                className="px-5 py-2 rounded-full font-mono text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
