import React from 'react';
import { CadenceLogo } from '../../../components/brand/CadenceLogo';

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: 'Produto',
    links: [
      { label: 'Metodologia PCP', href: '#metodologia' },
      { label: 'Decomposição por IA', href: '#metodologia' },
      { label: 'Motor de Rebalanceamento', href: '#metodologia' },
      { label: 'Floating Dock', href: '#simulador' },
    ],
  },
  {
    title: 'Arquitetura & Segurança',
    links: [
      { label: 'Segurança de Dados', href: '#manifesto' },
      { label: 'Isolação RLS Supabase', href: '#manifesto' },
      { label: 'Criptografia End-to-End', href: '#manifesto' },
      { label: 'Status da Rede', href: '#manifesto' },
    ],
  },
  {
    title: 'Recursos & Manifesto',
    links: [
      { label: 'O Manifesto', href: '#manifesto' },
      { label: 'Artigos sobre Ritmo Cognitivo', href: '#manifesto' },
      { label: 'Suporte de Engenharia', href: '#manifesto' },
    ],
  },
];

export const LandingFooter: React.FC = () => (
  <footer className="relative border-t border-white/10 bg-[#090B0E]">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-x border-white/10 divide-y sm:divide-y-0 lg:divide-x divide-white/10">
        <div className="p-8 space-y-4">
          <CadenceLogo size={34} subtitle="" />
          <p className="text-xs leading-relaxed text-[#94A3B8] max-w-xs">
            Engenharia de capacidade aplicada à rotina cognitiva. Planeje dentro do limite real e recupere a sua
            cadência.
          </p>
          <p className="font-mono text-[10px] text-slate-600">© {new Date().getFullYear()} Cadence AI</p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title} className="p-8">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-xs text-[#94A3B8] hover:text-[#88C0A8] transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </div>

    {/* Selo oficial de autenticidade */}
    <div className="border-t border-white/10 py-5 px-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
      Cadence AI · Cognitive Capacity Engineering · All Rights Reserved
    </div>
  </footer>
);
