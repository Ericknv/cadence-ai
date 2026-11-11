import React, { useState } from 'react';
import { X, ShieldCheck, Database, Lock, Server, CheckCircle2 } from 'lucide-react';
import { CadenceLogo } from '../../../components/brand/CadenceLogo';

interface FooterLink {
  label: string;
  href?: string;
  isSecurityModal?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: 'Produto',
    links: [
      { label: 'Metodologia Calm System', href: '#metodologia' },
      { label: 'Decomposição por IA', href: '#metodologia' },
      { label: 'Motor de Rebalanceamento', href: '#metodologia' },
      { label: 'Simulador de Carga', href: '#simulador' },
    ],
  },
  {
    title: 'Arquitetura & Segurança',
    links: [
      { label: 'Segurança de Dados', isSecurityModal: true },
      { label: 'Isolação RLS Supabase', isSecurityModal: true },
      { label: 'Criptografia End-to-End', isSecurityModal: true },
      { label: 'Status da Rede', isSecurityModal: true },
    ],
  },
  {
    title: 'Recursos & Manifesto',
    links: [
      { label: 'O Manifesto', href: '#manifesto' },
      { label: 'Artigos sobre Ritmo Cognitivo', href: '#manifesto' },
      { label: 'Engenharia de Capacidade', href: '#capacidade' },
    ],
  },
];

export const LandingFooter: React.FC = () => {
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);

  return (
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
                    {link.isSecurityModal ? (
                      <button
                        type="button"
                        onClick={() => setIsSecurityModalOpen(true)}
                        className="text-xs text-[#94A3B8] hover:text-[#88C0A8] transition-colors cursor-pointer text-left"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a href={link.href} className="text-xs text-[#94A3B8] hover:text-[#88C0A8] transition-colors">
                        {link.label}
                      </a>
                    )}
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

      {/* MODAL TÉCNICO: Arquitetura de Segurança & Isolação RLS */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#090B0E]/95 border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl backdrop-blur-3xl relative">
            <button
              type="button"
              onClick={() => setIsSecurityModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-100 p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Fechar modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#88C0A8] bg-[#88C0A8]/10 px-2.5 py-0.5 rounded-full border border-[#88C0A8]/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Arquitetura de Segurança & Soberania
              </span>
              <h3 className="text-lg font-bold text-slate-100 font-display">
                Isolamento Estrito por Tenant & RLS PostgreSQL
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                O Cadence AI foi projetado sob o princípio de tolerância zero ao vazamento de dados entre estudantes e
                profissionais.
              </p>
            </div>

            <div className="space-y-3 font-sans">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-slate-200">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Row Level Security (RLS) no PostgreSQL</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Todas as tabelas (<code className="font-mono text-[#88C0A8]">study_tracks</code>,{' '}
                  <code className="font-mono text-[#88C0A8]">study_sessions</code>,{' '}
                  <code className="font-mono text-[#88C0A8]">schedule_blocks</code>) aplicam políticas nativas no kernel do
                  PostgreSQL baseadas em <code className="font-mono text-slate-300">auth.uid() = user_id</code>. Nenhum
                  usuário consegue consultar ou modificar blocos de outro.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-slate-200">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Criptografia em Trânsito e em Repouso</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tráfego 100% criptografado com TLS 1.3 ponta a ponta. Sessões autenticadas via JWT assinados por chave
                  assimétrica e tokens em cookies HTTP-Only seguros com rotação contínua.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-1.5">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-slate-200">
                  <Server className="w-3.5 h-3.5 text-[#FB7185]" />
                  <span>Soberania de Dados & Modo Offline-First</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Você é o único proprietário dos seus dados. O Cadence permite exportar e restaurar snapshots completos em
                  JSON a qualquer momento no rodapé do cockpit, operando mesmo sem conexão ativa.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Políticas RLS Ativas & Verificadas
              </span>
              <button
                type="button"
                onClick={() => setIsSecurityModalOpen(false)}
                className="px-4 py-2 rounded-full font-mono text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
