import React from 'react';

export const ManifestoSection: React.FC = () => (
  <section id="manifesto" className="relative scroll-mt-28 px-4 sm:px-6 py-32 sm:py-44 overflow-hidden bg-[#090B0E]">
    {/* Ponto de feixe de luz ao fundo */}
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full pointer-events-none"
      style={{ background: 'linear-gradient(to bottom, rgba(136,192,168,0) 0%, rgba(136,192,168,0.35) 50%, rgba(136,192,168,0) 100%)' }}
      aria-hidden="true"
    />
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
      style={{ background: 'radial-gradient(circle, rgba(86,157,170,0.12) 0%, rgba(9,11,14,0) 65%)' }}
      aria-hidden="true"
    />

    <div className="relative max-w-3xl mx-auto text-center">
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#7BDCB5] mb-6 block">
        // O Fim do Caos Cognitivo
      </span>
      <blockquote className="font-serif text-[22px] sm:text-[28px] lg:text-[32px] leading-[1.6] text-[#E2E8F0]">
        <p>
          Acreditamos que a mente humana foi feita para criar, sintetizar e compreender — não para gerenciar dezenas de abas abertas e notificações estridentes.
        </p>
        <p className="mt-8 text-slate-400 font-sans text-base sm:text-lg leading-relaxed">
          Recusamos a ideia de que produtividade exige uma estética de fábrica ou a pressão de cronômetros vermelhos. O verdadeiro foco não nasce do pânico; nasce do espaço, da ordem e da clareza.
        </p>
        <p className="mt-8 italic text-[#7BDCB5] font-serif text-xl sm:text-2xl">
          O Cadence AI é o seu santuário de conhecimento.
        </p>
        <p className="mt-6 text-slate-400 font-sans text-sm sm:text-base leading-relaxed">
          Um ambiente digital onde a física do vidro translúcido, a tipografia equilibrada e os ritmos de respiro devolvem a você o controle do seu tempo. Menos atrito. Menos ruído. Apenas você e o seu ritmo ideal.
        </p>
        <footer className="mt-12 font-display text-sm font-semibold uppercase tracking-[0.25em] text-[#7BDCB5]">
          A calma que sua rotina exigente precisa.
        </footer>
      </blockquote>
    </div>
  </section>
);
