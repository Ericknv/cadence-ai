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

    <blockquote className="relative max-w-3xl mx-auto text-center font-serif text-[22px] sm:text-[28px] lg:text-[34px] leading-[1.5] text-[#E2E8F0]">
      <p>
        O mundo não precisa de mais um aplicativo de tarefas que te faz se sentir atrasado.
      </p>
      <p className="mt-6 text-slate-400">
        Você não precisa de mais listas vermelhas piscando no final da noite, lembrando do que você não conseguiu
        fazer.
      </p>
      <p className="mt-6 italic text-[#88C0A8]">Você precisa de um regulador de ritmo.</p>

      <p className="mt-16">
        Porque produzir com burnout não é dedicação. <span className="italic">É erro de cálculo.</span>
      </p>
      <p className="mt-6 text-slate-400">
        A produtividade sustentável é um problema de engenharia de capacidade, não de força de vontade.
      </p>
      <footer className="mt-10 font-display text-sm font-semibold uppercase tracking-[0.25em] text-[#88C0A8]">
        Recupere a sua cadência.
      </footer>
    </blockquote>
  </section>
);
