import React from 'react';
import {
  CalendarDays,
  Scale,
  Brain,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { EnrichedScheduleBlock } from '../../types/study';

interface PlannerTabProps {
  blocks: EnrichedScheduleBlock[];
  onOpenRebalanceModal: () => void;
  className?: string;
}

export const PlannerTab: React.FC<PlannerTabProps> = ({
  blocks,
  onOpenRebalanceModal,
  className = '',
}) => {
  // Agrupamento de blocos por data
  const dateMap: Record<string, EnrichedScheduleBlock[]> = {};
  for (const block of blocks) {
    if (!dateMap[block.target_date]) {
      dateMap[block.target_date] = [];
    }
    dateMap[block.target_date].push(block);
  }

  const sortedDates = Object.keys(dateMap).sort();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner de Planeamento e Controle da Produção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold font-mono text-zinc-100 uppercase tracking-wider">
              Matriz de Capacidade & PCP
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Planejamento semanal equilibrado contra restrições de tempo real, com proteção ativa contra estafa mental (burnout).
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenRebalanceModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          Rebalancear com IA
        </button>
      </div>

      {/* Grade de Alocação por Data */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">
          Alocações Registradas por Data
        </h3>

        {sortedDates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-xs font-mono text-zinc-500">
            Nenhum bloco agendado no período.
          </div>
        ) : (
          <div className="space-y-2">
            {sortedDates.map((dateStr) => {
              const dayBlocks = dateMap[dateStr];
              const totalMinutes = dayBlocks.reduce(
                (acc, b) => acc + (b.session.estimated_duration_min || 0),
                0
              );
              const highEffortCount = dayBlocks.filter(
                (b) => b.session.cognitive_effort === 'high'
              ).length;

              return (
                <div
                  key={dateStr}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 font-mono text-xs font-bold">
                      {dateStr.slice(-2)}
                    </div>
                    <div>
                      <div className="text-xs font-mono font-semibold text-zinc-200">
                        {dateStr}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500">
                        {dayBlocks.length} {dayBlocks.length === 1 ? 'sessão' : 'sessões'} • {totalMinutes} min planejados
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {highEffortCount > 0 && (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        {highEffortCount} Deep Work
                      </span>
                    )}
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      {Math.round((totalMinutes / 60) * 10) / 10}h
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
