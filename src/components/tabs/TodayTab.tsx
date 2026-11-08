import React, { useState } from 'react';
import {
  Brain,
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Flame,
  CheckSquare,
  Square,
  Activity,
  Layers,
  Filter,
} from 'lucide-react';
import {
  EnrichedScheduleBlock,
  StudyTrack,
  SessionStatus,
  CognitiveEffort,
} from '../../types/study';
import { CockpitTimeline } from '../cockpit/CockpitTimeline';

interface TodayTabProps {
  blocks: EnrichedScheduleBlock[];
  tracks?: StudyTrack[];
  onStatusChange: (blockId: string, newStatus: SessionStatus) => void;
  className?: string;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  blocks,
  onStatusChange,
  className = '',
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | SessionStatus>('all');
  const [checkedGoals, setCheckedGoals] = useState<Record<string, boolean>>({});

  // 1. Cálculos da Faixa de Telemetria de Capacidade (RCCP Diário)
  const totalPlannedMinutes = blocks.reduce(
    (acc, b) => acc + (b.session?.estimated_duration_min || 0),
    0
  );

  const completedBlocks = blocks.filter((b) => b.session?.status === 'completed');
  const completedMinutes = completedBlocks.reduce(
    (acc, b) => acc + (b.session?.estimated_duration_min || 0),
    0
  );

  const remainingMinutes = Math.max(0, totalPlannedMinutes - completedMinutes);
  const adherencePct =
    totalPlannedMinutes > 0
      ? Math.round((completedMinutes / totalPlannedMinutes) * 100)
      : 0;

  const deepWorkMinutes = blocks
    .filter((b) => b.session?.cognitive_effort === 'high')
    .reduce((acc, b) => acc + (b.session?.estimated_duration_min || 0), 0);

  // 2. Seleção do Bloco de Foco Executivo (Prioriza Em Andamento, depois o Primeiro Pendente)
  const activeBlock =
    blocks.find((b) => b.session?.status === 'in_progress') ||
    blocks.find((b) => b.session?.status === 'todo') ||
    blocks[0];

  const isSessionInProgress = activeBlock?.session?.status === 'in_progress';
  const isSessionCompleted = activeBlock?.session?.status === 'completed';

  const toggleGoal = (goalIndex: number) => {
    if (!activeBlock) return;
    const key = `${activeBlock.id}_${goalIndex}`;
    setCheckedGoals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filtragem da Timeline
  const filteredBlocks =
    statusFilter === 'all'
      ? blocks
      : blocks.filter((b) => b.session?.status === statusFilter);

  return (
    <div className={`space-y-6 sm:space-y-8 ${className}`}>
      {/* 1. Faixa de Telemetria de Capacidade (Glassmorphism Sóbrio) */}
      <section
        aria-label="Telemetria de Capacidade Diária"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-[#090B0E]/70 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Carga Planejada
          </div>
          <div className="text-base sm:text-lg font-mono font-bold text-slate-100">
            {Math.round((totalPlannedMinutes / 60) * 10) / 10}h
            <span className="text-[10px] text-slate-500 font-normal ml-1">
              ({totalPlannedMinutes}m)
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Aderência
          </div>
          <div className="text-base sm:text-lg font-mono font-bold text-emerald-400">
            {adherencePct}%
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FB7185]" />
            Deep Work
          </div>
          <div className="text-base sm:text-lg font-mono font-bold text-[#FB7185]">
            {deepWorkMinutes}m
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Tempo Restante
          </div>
          <div className="text-base sm:text-lg font-mono font-bold text-slate-200">
            {remainingMinutes}m
          </div>
        </div>
      </section>

      {/* 2. Card de Foco Executivo (Glassmorphism rounded-3xl com Tag Coral Deep Work) */}
      {activeBlock && (
        <section
          aria-labelledby="executive-focus-title"
          className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent backdrop-blur-2xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7)] space-y-5 overflow-hidden transition-all duration-300"
        >
          {/* Luz de acento sutil no topo do card */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />

          {/* Top Row: Meta-tags, Trilha e Badge de Esforço */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                {activeBlock.track.category}
              </span>
              <span className="text-xs font-mono text-slate-400 truncate max-w-[220px] sm:max-w-none">
                {activeBlock.track.title}
              </span>
            </div>

            {/* Tag de Esforço Cognitivo: Destaque Coral Suave para Deep Work */}
            {activeBlock.session.cognitive_effort === 'high' ? (
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-[#FB7185]/10 text-[#FB7185] border border-[#FB7185]/25 shadow-[0_0_12px_rgba(251,113,133,0.15)]">
                <Brain className="w-3 h-3 text-[#FB7185]" />
                <span>Deep Work • Alto Esforço</span>
              </div>
            ) : activeBlock.session.cognitive_effort === 'medium' ? (
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/25">
                <Brain className="w-3 h-3" />
                <span>Prática Procedural</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                <Brain className="w-3 h-3" />
                <span>Revisão Espaçada</span>
              </div>
            )}
          </div>

          {/* Título & Abordagem Pragmática */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {isSessionInProgress && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
              <h2
                id="executive-focus-title"
                className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 font-sans"
              >
                {activeBlock.session.title}
              </h2>
            </div>
            {activeBlock.session.recommended_approach && (
              <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed">
                {activeBlock.session.recommended_approach}
              </p>
            )}
          </div>

          {/* Checklist Atômico (Metas de Aprendizagem) */}
          {activeBlock.session.learning_goals && activeBlock.session.learning_goals.length > 0 && (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Metas Atômicas de Aprendizagem
              </span>
              <ul className="space-y-2">
                {activeBlock.session.learning_goals.map((goal, idx) => {
                  const isChecked = !!checkedGoals[`${activeBlock.id}_${idx}`];
                  return (
                    <li
                      key={idx}
                      onClick={() => toggleGoal(idx)}
                      className="flex items-start gap-2.5 text-xs font-mono text-slate-300 hover:text-slate-100 cursor-pointer select-none transition-colors"
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-slate-400 hover:text-emerald-400 shrink-0"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                      <span className={isChecked ? 'line-through text-slate-500' : ''}>
                        {goal}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Cronômetro e Ações Táteis de Execução */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Duração:</span>
                <strong className="text-white">
                  {activeBlock.session.estimated_duration_min} min
                </strong>
              </div>
              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                {isSessionInProgress ? 'Sessão em curso ativo' : 'Pronto para despacho'}
              </span>
            </div>

            {/* Botões Táteis de Ação */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {!isSessionInProgress && !isSessionCompleted && (
                <button
                  type="button"
                  onClick={() => onStatusChange(activeBlock.id, 'in_progress')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-bold bg-white text-slate-950 hover:bg-slate-100 transition-all cursor-pointer shadow-lg shadow-white/10 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Iniciar Sessão</span>
                </button>
              )}

              {isSessionInProgress && (
                <>
                  <button
                    type="button"
                    onClick={() => onStatusChange(activeBlock.id, 'todo')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-mono text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                  >
                    <span>Pausar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onStatusChange(activeBlock.id, 'completed')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Concluir Sessão</span>
                  </button>
                </>
              )}

              {isSessionCompleted && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Concluída
                  </span>
                  <button
                    type="button"
                    onClick={() => onStatusChange(activeBlock.id, 'in_progress')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-mono text-[11px] text-slate-400 hover:text-slate-200 bg-white/5 border border-white/10 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Refazer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 3. Toolbar Sóbria de Filtragem da Timeline */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5 bg-[#090B0E]/80 p-1 rounded-full border border-white/10 text-xs font-mono">
          <span className="px-2.5 py-1 text-slate-500 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Filtrar:
          </span>
          {(
            [
              { key: 'all', label: 'Todos' },
              { key: 'in_progress', label: 'Em Andamento' },
              { key: 'todo', label: 'Pendentes' },
              { key: 'completed', label: 'Concluídos' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1 rounded-full transition-colors cursor-pointer text-[11px] ${
                statusFilter === tab.key
                  ? 'bg-white/15 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-500">
          {filteredBlocks.length} de {blocks.length} blocos hoje
        </div>
      </div>

      {/* 4. Timeline dos Turnos do Cockpit Diário */}
      <CockpitTimeline
        blocks={filteredBlocks}
        onStatusChange={onStatusChange}
      />
    </div>
  );
};
