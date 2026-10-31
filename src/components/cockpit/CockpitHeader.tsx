import React from 'react';
import {
  Calendar,
  Brain,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Scale,
} from 'lucide-react';
import { EnrichedScheduleBlock } from '../../types/study';

interface CockpitHeaderProps {
  blocks: EnrichedScheduleBlock[];
  selectedDate: string;
  onResetMock?: () => void;
  onOpenCreateTrackModal?: () => void;
  onOpenRebalanceModal?: () => void;
  className?: string;
}

export const CockpitHeader: React.FC<CockpitHeaderProps> = ({
  blocks,
  selectedDate,
  onResetMock,
  onOpenCreateTrackModal,
  onOpenRebalanceModal,
  className = '',
}) => {
  // Cálculos de Métricas em Tempo Real
  const totalPlannedMinutes = blocks.reduce(
    (acc, b) => acc + (b.session?.estimated_duration_min || 0),
    0
  );

  const completedMinutes = blocks
    .filter((b) => b.session?.status === 'completed')
    .reduce((acc, b) => acc + (b.session?.estimated_duration_min || 0), 0);

  const totalBlocks = blocks.length;
  const completedBlocks = blocks.filter(
    (b) => b.session?.status === 'completed'
  ).length;

  const progressPercent =
    totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

  // Quebra por Esforço Cognitivo
  const effortMinutes = {
    high: blocks
      .filter((b) => b.session?.cognitive_effort === 'high')
      .reduce((acc, b) => acc + (b.session?.estimated_duration_min || 0), 0),
    medium: blocks
      .filter((b) => b.session?.cognitive_effort === 'medium')
      .reduce((acc, b) => acc + (b.session?.estimated_duration_min || 0), 0),
    low: blocks
      .filter((b) => b.session?.cognitive_effort === 'low')
      .reduce((acc, b) => acc + (b.session?.estimated_duration_min || 0), 0),
  };

  // Bloco ativo no momento
  const activeBlock = blocks.find((b) => b.session?.status === 'in_progress');

  return (
    <header className={`space-y-4 ${className}`}>
      {/* Top Bar: Identidade do Sistema e Data */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)]">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-mono">
                StudyPilot
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase tracking-widest bg-zinc-800 text-zinc-400 border border-zinc-700">
                Cadence v1.0
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Cockpit Operacional de Estudos | Engenharia & Rotinas Concorrentes
            </p>
          </div>
        </div>

        {/* Data Operacional */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs font-mono text-zinc-300">
            <button
              type="button"
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Dia anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-zinc-100">{selectedDate}</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                (Hoje)
              </span>
            </div>
            <button
              type="button"
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Próximo dia"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {onResetMock && (
            <button
              type="button"
              onClick={onResetMock}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
              title="Restaurar estado original dos mocks"
            >
              Reset Mock
            </button>
          )}

          {onOpenRebalanceModal && (
            <button
              type="button"
              onClick={onOpenRebalanceModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-sm border border-indigo-500/80 transition-colors cursor-pointer"
              title="Equilibrar cronograma semanal contra sua matriz de disponibilidade"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Rebalancear Semana (IA)</span>
            </button>
          )}

          {onOpenCreateTrackModal && (
            <button
              type="button"
              onClick={onOpenCreateTrackModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm border border-blue-500/80 transition-colors cursor-pointer"
              title="Decompor ementa e criar nova trilha com Gemini"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Nova Trilha com IA</span>
            </button>
          )}
        </div>
      </div>

      {/* Banner de Sessão Ativa (Se houver) */}
      {activeBlock && (
        <div className="rounded-lg bg-gradient-to-r from-blue-950/60 via-zinc-900 to-zinc-900 border border-blue-500/40 p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
                Sessão em Andamento Agora
              </div>
              <div className="text-sm font-semibold text-zinc-100">
                {activeBlock.session.title}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-zinc-300 bg-zinc-950/60 px-2 py-1 rounded border border-blue-800/40">
              {activeBlock.session.estimated_duration_min} min estimados
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards: Carga Cognitiva e Aderência */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Tempo Total Planejado */}
        <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/70 p-3.5">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
            <span>Carga Planejada</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-white">
              {totalPlannedMinutes}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              min ({(totalPlannedMinutes / 60).toFixed(1)}h)
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-zinc-400">
            {completedMinutes} min já executados
          </div>
        </div>

        {/* Card 2: Aderência do Cronograma */}
        <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/70 p-3.5">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
            <span>Aderência do Plano</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-white">
              {progressPercent}%
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              ({completedBlocks}/{totalBlocks} blocos)
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2.5 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Card 3: Carga Cognitiva Alta (Deep Work) */}
        <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/70 p-3.5">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
            <span>Esforço Alto (Deep)</span>
            <Brain className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-rose-400">
              {effortMinutes.high}
            </span>
            <span className="text-xs text-zinc-400 font-mono">minutos</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-zinc-400">
            {totalPlannedMinutes > 0
              ? `${Math.round((effortMinutes.high / totalPlannedMinutes) * 100)}% da carga diária`
              : '0%'}
          </div>
        </div>

        {/* Card 4: Esforço Médio & Baixo */}
        <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/70 p-3.5">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-1.5">
            <span>Médio & Suporte</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-zinc-100">
              {effortMinutes.medium + effortMinutes.low}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              min ({effortMinutes.medium}m méd / {effortMinutes.low}m baixo)
            </span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-zinc-400">
            Prática e revisões consolidadas
          </div>
        </div>
      </div>
    </header>
  );
};
