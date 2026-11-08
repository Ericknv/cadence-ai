import React from 'react';

interface ProofBlock {
  numeral: string;
  numeralClass: string;
  label: string;
  description: string;
  spanClass?: string;
}

const BLOCKS: ProofBlock[] = [
  {
    numeral: '100%',
    numeralClass: 'text-[#E2E8F0]',
    label: 'Respeito estrito ao teto de horas reais diárias (RCCP)',
    description:
      'O motor matemático de alocação zera a ilusão de tempo disponível, eliminando a sobreposição de compromissos antes que ela ocorra.',
  },
  {
    numeral: '0',
    numeralClass: 'text-[#88C0A8]',
    label: 'Culpa por tarefas acumuladas no fim do dia',
    description:
      'O excesso de demanda é automaticamente diferido e redistribuído no horizonte futuro com base em capacidade real, não em desejo.',
  },
  {
    numeral: '3.8',
    numeralClass: 'text-[#569DAA]',
    label: 'Flash — Decomposição atômica por IA',
    description:
      'Ementas densas fatiadas em blocos executáveis de 30 a 60 minutos, com classificação de carga cognitiva.',
    spanClass: 'md:col-span-2 lg:col-span-1',
  },
];

export const NumericProofSection: React.FC = () => (
  <section id="capacidade" className="relative scroll-mt-28 px-4 sm:px-6 py-20">
    <div className="max-w-6xl mx-auto">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-8">
        // Prova numérica
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px rounded-3xl overflow-hidden border border-white/10 bg-white/10">
        {BLOCKS.map((block) => (
          <article
            key={block.numeral}
            className={`bg-[#0B0E12] p-8 sm:p-10 flex flex-col ${block.spanClass ?? ''}`}
          >
            <div
              className={`font-mono font-bold leading-none tracking-tighter text-[84px] ${block.numeralClass}`}
            >
              {block.numeral}
            </div>
            <h3 className="mt-6 font-display text-lg font-semibold text-slate-100 leading-snug">
              {block.label}
            </h3>
            <div className="my-5 h-px w-8 bg-white/20" />
            <p className="text-sm leading-relaxed text-[#94A3B8]">{block.description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);
