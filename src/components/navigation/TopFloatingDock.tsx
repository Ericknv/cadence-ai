import React from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { CadenceLogo } from '../brand/CadenceLogo';

interface TopFloatingDockProps {
  activeTab: 'today' | 'tracks' | 'planner' | 'insights';
  onSelectTab: (tab: 'today' | 'tracks' | 'planner' | 'insights') => void;
  harmonyPercentage?: number;
  user?: User | null;
  onOpenAuthModal?: () => void;
  onOpenProfile?: () => void;
  onSignOut?: () => void;
}

export const TopFloatingDock: React.FC<TopFloatingDockProps> = ({
  activeTab,
  onSelectTab,
  harmonyPercentage = 88,
  user,
  onOpenAuthModal,
  onOpenProfile,
  onSignOut,
}) => {
  const tabs = [
    { id: 'today', label: 'Hoje' },
    { id: 'tracks', label: 'Espaços' },
    { id: 'planner', label: 'Harmonia' },
    { id: 'insights', label: 'Jornada' },
  ] as const;

  // Iniciais do usuário para o avatar
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'E';

  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4 pointer-events-auto">
      <nav className="flex items-center gap-2 sm:gap-3.5 px-3.5 py-2 bg-[#090B0E]/70 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)]">
        {/* Zona 1: Marca & Símbolo */}
        <div className="pr-2 sm:pr-3 border-r border-white/10 shrink-0">
          <Link to="/" aria-label="Voltar ao site institucional" className="block">
            <CadenceLogo size={26} showText={true} />
          </Link>
        </div>

        {/* Zona 2: Abas Centrais em Pílula */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`relative px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none cursor-pointer ${
                  isActive
                    ? 'bg-white/15 text-white font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Zona 3: Indicador de Harmonia + Perfil do Estudante + Auth */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/10 shrink-0">
          <div
            className="flex items-center gap-1.5 font-mono text-[11px] text-[#7BDCB5] bg-[#7BDCB5]/10 px-2.5 py-1 rounded-full border border-[#7BDCB5]/20"
            title="Harmonia Semanal: Equilíbrio da Rotina"
          >
            <span className="text-[9px] uppercase tracking-wider text-[#7BDCB5]/80">Harmonia</span>
            <span className="font-bold">{harmonyPercentage}%</span>
          </div>

          {/* Botão de Perfil do Estudante */}
          {onOpenProfile && (
            <button
              type="button"
              onClick={onOpenProfile}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-xs font-mono text-slate-300 transition-colors cursor-pointer"
              title="Ver Perfil do Estudante e Metas de Capacidade"
              aria-label="Perfil do Estudante"
            >
              {user ? (
                <span className="font-bold text-[#88C0A8]">{userInitial}</span>
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          )}

          {onOpenAuthModal && (
            <button
              type="button"
              onClick={user ? onSignOut : onOpenAuthModal}
              className="text-[10px] font-mono text-slate-400 hover:text-slate-200 px-2 py-1 rounded-full border border-white/5 hover:border-white/15 hover:bg-white/5 transition-colors cursor-pointer"
              title={user ? `Logado como ${user.email} (Clique para sair)` : 'Entrar com Supabase'}
            >
              {user ? 'Sair' : 'Login'}
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};
