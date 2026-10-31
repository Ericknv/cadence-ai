import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle,
  RotateCcw,
  AlertCircle,
  Lightbulb,
  CheckSquare,
  Square,
} from 'lucide-react';
import { EnrichedScheduleBlock, SessionStatus } from '../../types/study';
import {
  CognitiveEffortBadge,
  SessionTypeBadge,
  SessionStatusBadge,
} from './SessionBadge';

interface BlockCardProps {
  block: EnrichedScheduleBlock;
  onStatusChange?: (blockId: string, newStatus: SessionStatus) => void;
  className?: string;
}

export const BlockCard: React.FC<BlockCardProps> = ({
  block,
  onStatusChange,
  className = '',
}) => {
  const { session, track } = block;
  const [isAiExpanded, setIsAiExpanded] = useState<boolean>(false);
  const [completedGoals, setCompletedGoals] = useState<Record<number, boolean>>({});

  const toggleGoal = (index: number) => {
    setCompletedGoals((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleActionClick = () => {
    if (!onStatusChange) return;

    if (session.status === 'todo') {
      onStatusChange(block.id, 'in_progress');
    } else if (session.status === 'in_progress') {
      onStatusChange(block.id, 'completed');
    } else if (session.status === 'completed') {
      onStatusChange(block.id, 'in_progress');
    }
  };

  const isCompleted = session.status === 'completed';
  const isInProgress = session.status === 'in_progress';

  return (
    <div
      className={`relative rounded-lg border transition-all duration-200 bg-zinc-900/90 text-zinc-100 p-4 sm:p-5 ${
        isInProgress
          ? 'border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/30'
          : isCompleted
          ? 'border-zinc-800/90 bg-zinc-950/60 opacity-90'
          : 'border-zinc-800 hover:border-zinc-700'
      } ${className}`}
    >
      {/* Barra de destaque lateral com a cor da trilha */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r"
        style={{ backgroundColor: track.color_hex || '#3b82f6' }}
      />

      <div className="pl-2">
        {/* Top Header: Trilha, Prioridade e Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase font-mono"
              style={{
                backgroundColor: `${track.color_hex}1a`,
                color: track.color_hex,
                border: `1px solid ${track.color_hex}40`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: track.color_hex }}
              />
              {track.title}
            </span>

            {/* Prioridade do Bloco */}
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700/60"
              title={`Prioridade de agendamento: Rank ${block.priority_rank}/5`}
            >
              P{block.priority_rank}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <SessionStatusBadge status={session.status} />
          </div>
        </div>

        {/* Título Principal da Sessão */}
        <div className="mb-3">
          <h3
            className={`text-base font-semibold leading-snug tracking-tight ${
              isCompleted ? 'line-through text-zinc-400' : 'text-zinc-100'
            }`}
          >
            {session.title}
          </h3>
        </div>

        {/* Metadados Operacionais: Tipo, Carga Cognitiva e Duração */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          <SessionTypeBadge type={session.session_type} />
          <CognitiveEffortBadge effort={session.cognitive_effort} />

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-750">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>{session.estimated_duration_min} min</span>
          </span>

          {block.is_rescheduled && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/50">
              <RotateCcw className="w-2.5 h-2.5" />
              Reagendado
            </span>
          )}
        </div>

        {/* Checkpoints de Aprendizagem (learning_goals) */}
        {session.learning_goals && session.learning_goals.length > 0 && (
          <div className="mb-3.5 bg-zinc-950/40 rounded-md p-2.5 border border-zinc-850/80">
            <div className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Metas da Sessão ({session.learning_goals.length})</span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {Object.values(completedGoals).filter(Boolean).length}/
                {session.learning_goals.length} atingidas
              </span>
            </div>
            <ul className="space-y-1.5">
              {session.learning_goals.map((goal, idx) => {
                const goalChecked = !!completedGoals[idx] || isCompleted;
                return (
                  <li
                    key={idx}
                    onClick={() => toggleGoal(idx)}
                    className="flex items-start gap-2 text-xs text-zinc-300 cursor-pointer group select-none"
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-zinc-500 group-hover:text-zinc-300 transition-colors focus:outline-none"
                      aria-label="Alternar meta"
                    >
                      {goalChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
                      )}
                    </button>
                    <span
                      className={`leading-relaxed ${
                        goalChecked ? 'line-through text-zinc-500' : 'text-zinc-300'
                      }`}
                    >
                      {goal}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Abordagem Recomendada (Dica Pragmática) */}
        {session.recommended_approach && (
          <div className="flex items-start gap-1.5 text-[11px] text-zinc-400 mb-3 bg-zinc-950/30 px-2.5 py-1.5 rounded border border-zinc-800/40">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400/90 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-semibold text-zinc-300">Abordagem:</span>{' '}
              {session.recommended_approach}
            </p>
          </div>
        )}

        {/* Justificativa da IA (Expansível) */}
        <div className="mb-3.5">
          <button
            type="button"
            onClick={() => setIsAiExpanded(!isAiExpanded)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-800/40 hover:bg-zinc-800/70 border border-zinc-800 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Justificativa de Alocação da IA</span>
            </span>
            {isAiExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            )}
          </button>

          {isAiExpanded && (
            <div className="mt-1.5 p-2.5 rounded bg-sky-950/20 border border-sky-900/40 text-xs text-sky-200/90 leading-relaxed font-sans">
              {block.ai_justification}
            </div>
          )}
        </div>

        {/* Rodapé com Ações Operacionais */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
          <div className="text-[11px] font-mono text-zinc-500">
            Seq #{session.sequence_order}
          </div>

          <div className="flex items-center gap-2">
            {session.status === 'todo' && (
              <button
                type="button"
                onClick={handleActionClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Iniciar Sessão</span>
              </button>
            )}

            {session.status === 'in_progress' && (
              <button
                type="button"
                onClick={handleActionClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Concluir</span>
              </button>
            )}

            {session.status === 'completed' && (
              <button
                type="button"
                onClick={handleActionClick}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors cursor-pointer"
                title="Reabrir sessão"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reabrir</span>
              </button>
            )}

            {/* Alternar status secundário */}
            {session.status !== 'completed' && (
              <button
                type="button"
                onClick={() => onStatusChange?.(block.id, session.status === 'skipped' ? 'todo' : 'skipped')}
                className="px-2 py-1 rounded text-zinc-500 hover:text-zinc-300 text-[11px] font-mono transition-colors"
                title={session.status === 'skipped' ? 'Restaurar' : 'Pular bloco'}
              >
                {session.status === 'skipped' ? 'Restaurar' : 'Pular'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
