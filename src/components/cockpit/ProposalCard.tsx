import React, { useState } from 'react';
import {
  Brain,
  Scale,
  Layers,
  Sparkles,
  ArrowRight,
  Play,
  Activity,
  ShieldCheck,
  Clock,
  Target,
  Flame,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import {
  EnrichedScheduleBlock,
  StudyTrack,
  CognitiveEffort,
} from '../../types/study';

interface ProposalCardProps {
  activeBlock?: EnrichedScheduleBlock | null;
  blocks?: EnrichedScheduleBlock[];
  tracks?: StudyTrack[];
  onStartSession?: (blockId: string) => void;
  onOpenCreateTrack?: () => void;
  onOpenPlanner?: () => void;
  className?: string;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  activeBlock,
  blocks = [],
  tracks = [],
  onStartSession,
  onOpenCreateTrack,
  onOpenPlanner,
  className = '',
}) => {
  const [activeSegment, setActiveSegment] = useState<'overview' | 'focus' | 'plan'>(
    'overview'
  );

  // Métricas extraídas das entidades reais de study.ts
  const highEffortBlocks = blocks.filter(
    (b) => b.session?.cognitive_effort === 'high' && b.session?.status !== 'completed'
  );

  const totalPlannedMinutes = blocks.reduce(
    (acc, b) => acc + (b.session?.estimated_duration_min || 0),
    0
  );

  const completedMinutes = blocks
    .filter((b) => b.session?.status === 'completed')
    .reduce((acc, b) => acc + (b.session?.estimated_duration_min || 0), 0);

  const completedCount = blocks.filter((b) => b.session?.status === 'completed').length;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 lg:p-10 shadow-2xl text-zinc-100 ${className}`}
    >
      {/* 1. Header Superior com Navegação Sóbria e Badge de Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 font-mono font-bold text-xs shadow-xs">
            CP
          </div>
          <span className="font-mono text-xs tracking-wider uppercase font-semibold text-zinc-300">
            Cadence Protocol
          </span>
        </div>

        {/* Pill Navigation Minimalista */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-full border border-zinc-800 text-xs font-mono self-start sm:self-auto">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'focus', label: 'Deep Work' },
            { id: 'plan', label: 'Capacidade (PCP)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSegment(tab.id as any)}
              className={`px-3 py-1 rounded-full transition-colors cursor-pointer text-[11px] ${
                activeSegment === tab.id
                  ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Selo Funcional Superior Direito */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 bg-zinc-900/60 border border-zinc-800 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Foco Ativo & Proteção de Carga</span>
        </div>
      </div>

      {/* 2. Hero Central - Tipografia Editorial & Chamada Principal */}
      <div className="py-8 sm:py-12 max-w-2xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono">
          <Flame className="w-3.5 h-3.5 text-blue-400" />
          <span>Engenharia Cognitiva & Planejamento de Rotina</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-100 font-sans leading-tight">
          A clearer mind <br />
          <span className="italic font-serif font-normal text-zinc-300">
            for a brighter you.
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-sans leading-relaxed">
          O Cadence AI ingere ementas densas, fatia o conteúdo em blocos atômicos
          de estudo e equilibra sua carga semanal contra o risco de sobrecarga mental.
        </p>

        {/* Botões de Ação Principais */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {activeBlock ? (
            <button
              type="button"
              onClick={() => onStartSession && onStartSession(activeBlock.id)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-bold bg-zinc-100 hover:bg-white text-zinc-950 shadow-md transition-all cursor-pointer"
            >
              <span>Continuar Sessão Ativa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCreateTrack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-bold bg-zinc-100 hover:bg-white text-zinc-950 shadow-md transition-all cursor-pointer"
            >
              <span>Criar Nova Trilha com IA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPlanner}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-mono font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <span>Matriz de Capacidade</span>
          </button>
        </div>
      </div>

      {/* 3. Cards Instrumentais em Órbita / Grid Funcional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4">
        {/* Card 1: Focus (Deep Work) */}
        <div className="p-4 rounded-xl border border-zinc-800/90 bg-zinc-900/80 space-y-2 hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-mono font-bold text-zinc-200">Focus</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-rose-400 border border-zinc-800">
              {highEffortBlocks.length} Deep Work
            </span>
          </div>
          <p className="text-[11px] font-mono text-zinc-400">
            Sessões analíticas densas alocadas no primeiro turno com isolamento cognitivo.
          </p>
        </div>

        {/* Card 2: Ideas & Tracks (Decomposição Atômica) */}
        <div className="p-4 rounded-xl border border-zinc-800/90 bg-zinc-900/80 space-y-2 hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-mono font-bold text-zinc-200">Ideas & Tracks</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-blue-400 border border-zinc-800">
              {tracks.length} {tracks.length === 1 ? 'Trilha' : 'Trilhas'}
            </span>
          </div>
          <p className="text-[11px] font-mono text-zinc-400">
            Fatiamento de ementas em 3 a 5 checkpoints objetivos de aprendizagem com o Gemini.
          </p>
        </div>

        {/* Card 3: Plan (PCP & Capacidade) */}
        <div className="p-4 rounded-xl border border-zinc-800/90 bg-zinc-900/80 space-y-2 hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Scale className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-mono font-bold text-zinc-200">Plan (PCP)</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-amber-400 border border-zinc-800">
              {Math.round((completedMinutes / 60) * 10) / 10}h / {Math.round((totalPlannedMinutes / 60) * 10) / 10}h
            </span>
          </div>
          <p className="text-[11px] font-mono text-zinc-400">
            Despacho estrito de carga semanal contra seu teto de disponibilidade real.
          </p>
        </div>
      </div>

      {/* 4. Rodapé Instrumental & Micro-telemetria */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 mt-6 border-t border-zinc-900 text-[11px] font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-zinc-400" />
          <span>
            {completedCount} blocos de estudo concluídos nesta sprint
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
          <span>Less chaos. More clarity.</span>
        </div>
      </div>
    </div>
  );
};
