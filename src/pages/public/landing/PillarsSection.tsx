import React, { useRef, useState } from 'react';

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
        className="flex-1 rounded-sm"
        style={{ height: `${h}%`, background: accent, opacity: 0.25 + (h / 100) * 0.6 }}
      />
    ))}
  </div>
);

const PILLARS: Pillar[] = [
  {
    index: '01',
    title: 'Rough-Cut Capacity Planning',
    accent: '#88C0A8',
    concept:
      'A barreira matemática intransponível contra a sobrecarga: calculamos o limite fisiológico de horas úteis reais, em vez de aceitar itens infinitos.',
    steps: [
      'Leitura de compromissos fixos e rotina biológica.',
      'Subtração de transição e descanso obrigatório.',
      'Bandeira amarela aos 80% do limite; trava vermelha aos 100%.',
    ],
    cta: 'Ver Gráfico de Carga',
    preview: <PillarPreview accent="#88C0A8" bars={[40, 55, 70, 80, 100, 60]} />,
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
                {/* Visualizador interno revelado ao hover (sempre visível em telas sem hover) */}
                <div className="mb-4 rounded-xl border border-white/10 bg-black/30 p-3 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100">
                  {pillar.preview}
                </div>
                <span
                  className="inline-flex items-center rounded-full border px-3.5 py-1.5 font-mono text-[11px]"
                  style={{ borderColor: `${pillar.accent}66`, color: pillar.accent }}
                >
                  [ {pillar.cta} ]
                </span>
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
    </section>
  );
};
