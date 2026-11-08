import React, { useState } from 'react';
import {
  Layers,
  Plus,
  BookOpen,
  CheckCircle2,
  Clock,
  PlayCircle,
  Circle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Brain,
  Target,
  Lightbulb,
} from 'lucide-react';
import {
  StudyTrack,
  StudySession,
  EnrichedScheduleBlock,
  CognitiveEffort,
  SessionStatus,
} from '../../types/study';

interface TracksTabProps {
  tracks: StudyTrack[];
  blocks: EnrichedScheduleBlock[];
  onOpenCreateTrackModal: () => void;
  className?: string;
}

export const TracksTab: React.FC<TracksTabProps> = ({
  tracks,
  blocks,
  onOpenCreateTrackModal,
  className = '',
}) => {
  // Controle de expansão de trilhas (Progressive Disclosure)
  // Primeira trilha aberta por padrão para visibilidade imediata
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>(() => {
    if (tracks.length > 0) {
      return { [tracks[0].id]: true };
    }
    return {};
  });

  // Controle de expansão de metas de aprendizagem por sessão
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});

  const toggleTrack = (trackId: string) => {
    setExpandedTracks((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  };

  const toggleGoals = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedGoals((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  // Renderizador de Micro-ícone Sóbrio de Status
  const renderStatusMicroIcon = (status: SessionStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400" title="Sessão Concluída">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Concluída</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-blue-400" title="Sessão em Andamento">
            <PlayCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 animate-pulse" />
            <span className="hidden sm:inline">Em foco</span>
          </span>
        );
      case 'skipped':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-500" title="Sessão Pulada">
            <XCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="hidden sm:inline">Pulada</span>
          </span>
        );
      case 'todo':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-500" title="Sessão Pendente">
            <Circle className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            <span className="hidden sm:inline">Pendente</span>
          </span>
        );
    }
  };

  // Renderizador do Indicador de Esforço Cognitivo Sóbrio
  const renderCognitiveEffort = (effort: CognitiveEffort) => {
    const config: Record<
      CognitiveEffort,
      { label: string; textClass: string; bgClass: string; borderClass: string }
    > = {
      low: {
        label: 'Low',
        textClass: 'text-emerald-400',
        bgClass: 'bg-emerald-950/30',
        borderClass: 'border-emerald-800/40',
      },
      medium: {
        label: 'Medium',
        textClass: 'text-blue-400',
        bgClass: 'bg-blue-950/30',
        borderClass: 'border-blue-800/40',
      },
      high: {
        label: 'High (Deep Work)',
        textClass: 'text-rose-400',
        bgClass: 'bg-rose-950/30',
        borderClass: 'border-rose-800/40',
      },
    };

    const c = config[effort] || config.medium;
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${c.bgClass} ${c.textClass} ${c.borderClass}`}
      >
        <Brain className="w-2.5 h-2.5" />
        {c.label}
      </span>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Header do Catálogo com Ação Principal Discreta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-zinc-100 font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Linha de Produção & Trilhas
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Pipeline de aprendizagem, catálogo pedagógico e backlog de sessões atômicas.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateTrackModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Trilha
        </button>
      </div>

      {/* 2. Catálogo Visual de Trilhas */}
      {tracks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
          <div className="text-sm font-mono text-zinc-400">Nenhuma trilha cadastrada ainda.</div>
          <button
            type="button"
            onClick={onOpenCreateTrackModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Criar Primeira Trilha com IA
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tracks.map((track) => {
            const trackBlocks = blocks.filter((b) => b.track.id === track.id);

            // Deduplica sessões vinculadas à trilha mantendo ordem de sequência
            const sessionMap = new Map<string, StudySession>();
            for (const b of trackBlocks) {
              if (b.session && !sessionMap.has(b.session.id)) {
                sessionMap.set(b.session.id, b.session);
              }
            }
            const trackSessions = Array.from(sessionMap.values()).sort(
              (a, b) => a.sequence_order - b.sequence_order
            );

            const totalSessionsCount = trackSessions.length;
            const completedSessionsCount = trackSessions.filter(
              (s) => s.status === 'completed'
            ).length;

            const totalPlannedMinutes = trackSessions.reduce(
              (acc, s) => acc + (s.estimated_duration_min || 0),
              0
            );
            const totalCompletedMinutes = trackSessions
              .filter((s) => s.status === 'completed')
              .reduce((acc, s) => acc + (s.estimated_duration_min || 0), 0);

            const progress =
              totalSessionsCount > 0
                ? Math.round((completedSessionsCount / totalSessionsCount) * 100)
                : 0;

            const isExpanded = !!expandedTracks[track.id];

            return (
              <div
                key={track.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/90 overflow-hidden transition-all duration-200 hover:border-zinc-700"
              >
                {/* Linha Sutil de Identificação de Cor da Trilha */}
                <div
                  className="h-1 w-full"
                  style={{ backgroundColor: track.color_hex || '#0284c7' }}
                />

                {/* Cabeçalho do Card (Clicável para Expandir/Recolher) */}
                <div
                  onClick={() => toggleTrack(track.id)}
                  className="p-4 sm:p-5 cursor-pointer select-none space-y-3"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleTrack(track.id);
                    }
                  }}
                  aria-expanded={isExpanded}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          {track.category}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {totalSessionsCount} sessões atômicas
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-zinc-100 font-mono">
                        {track.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-zinc-200">
                          {progress}%
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500">
                          {totalCompletedMinutes}m / {totalPlannedMinutes}m
                        </div>
                      </div>

                      <div className="w-7 h-7 rounded-md bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {track.overview && (
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                      {track.overview}
                    </p>
                  )}

                  {/* Barra Minimalista de Progresso */}
                  <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800/80">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* 3. Backlog Atômico com Progressive Disclosure */}
                {isExpanded && (
                  <div className="border-t border-zinc-800/80 bg-zinc-950/60 p-4 sm:p-5 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-1 border-b border-zinc-800/60">
                      <span className="uppercase tracking-wider font-semibold">
                        Backlog Atômico de Sessões
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Clique na sessão para ver as metas de aprendizagem
                      </span>
                    </div>

                    {trackSessions.length === 0 ? (
                      <div className="text-xs font-mono text-zinc-500 py-3 text-center">
                        Nenhuma sessão vinculada a esta trilha.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {trackSessions.map((session) => {
                          const isGoalOpen = !!expandedGoals[session.id];

                          return (
                            <div
                              key={session.id}
                              className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 transition-colors overflow-hidden"
                            >
                              {/* Linha Principal da Sessão */}
                              <div
                                onClick={(e) => toggleGoals(session.id, e)}
                                className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer select-none"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 shrink-0">
                                    #{session.sequence_order}
                                  </span>
                                  <span className="text-xs font-semibold text-zinc-200 font-mono truncate">
                                    {session.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                                  {renderCognitiveEffort(session.cognitive_effort)}

                                  <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-zinc-500" />
                                    {session.estimated_duration_min}m
                                  </span>

                                  {renderStatusMicroIcon(session.status)}

                                  <span className="text-zinc-500 text-xs pl-1">
                                    {isGoalOpen ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Metas de Aprendizagem Retráteis */}
                              {isGoalOpen && (
                                <div className="px-3.5 pb-3.5 pt-1 text-xs font-mono space-y-2 border-t border-zinc-800/50 bg-zinc-950/40">
                                  {session.learning_goals && session.learning_goals.length > 0 && (
                                    <div className="space-y-1">
                                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1">
                                        <Target className="w-3 h-3 text-blue-400" />
                                        Metas de Aprendizagem:
                                      </span>
                                      <ul className="space-y-1 pl-1">
                                        {session.learning_goals.map((goal, gIdx) => (
                                          <li
                                            key={gIdx}
                                            className="text-[11px] text-zinc-300 flex items-start gap-1.5"
                                          >
                                            <span className="text-zinc-600 mt-0.5">•</span>
                                            <span>{goal}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {session.recommended_approach && (
                                    <div className="space-y-0.5 pt-1 border-t border-zinc-800/40">
                                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1">
                                        <Lightbulb className="w-3 h-3 text-amber-400" />
                                        Abordagem Recomendada:
                                      </span>
                                      <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                                        {session.recommended_approach}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
