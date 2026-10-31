import React from 'react';
import {
  Sun,
  Sunset,
  Moon,
  MoonStar,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import {
  EnrichedScheduleBlock,
  TargetPeriod,
  SessionStatus,
} from '../../types/study';
import { BlockCard } from './BlockCard';

interface CockpitTimelineProps {
  blocks: EnrichedScheduleBlock[];
  onStatusChange?: (blockId: string, newStatus: SessionStatus) => void;
  className?: string;
}

interface PeriodDefinition {
  key: TargetPeriod;
  label: string;
  timeRange: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PERIODS: PeriodDefinition[] = [
  {
    key: 'morning',
    label: 'Manhã',
    timeRange: '06:00 - 12:00',
    icon: Sun,
  },
  {
    key: 'afternoon',
    label: 'Tarde',
    timeRange: '12:00 - 18:00',
    icon: Sunset,
  },
  {
    key: 'evening',
    label: 'Noite',
    timeRange: '18:00 - 23:00',
    icon: Moon,
  },
  {
    key: 'night',
    label: 'Madrugada',
    timeRange: '23:00 - 06:00',
    icon: MoonStar,
  },
];

export const CockpitTimeline: React.FC<CockpitTimelineProps> = ({
  blocks,
  onStatusChange,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {PERIODS.map((period) => {
        const periodBlocks = blocks.filter((b) => b.target_period === period.key);
        const totalMinutes = periodBlocks.reduce(
          (acc, b) => acc + (b.session?.estimated_duration_min || 0),
          0
        );
        const completedBlocks = periodBlocks.filter(
          (b) => b.session?.status === 'completed'
        ).length;
        const inProgressBlocks = periodBlocks.filter(
          (b) => b.session?.status === 'in_progress'
        ).length;
        const allCompleted =
          periodBlocks.length > 0 && completedBlocks === periodBlocks.length;
        const Icon = period.icon;

        return (
          <section
            key={period.key}
            className="rounded-xl border border-zinc-800/90 bg-zinc-950/70 p-4 sm:p-5 transition-colors"
          >
            {/* Header do Período */}
            <header className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-850">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-md border ${
                    inProgressBlocks > 0
                      ? 'bg-blue-950/50 text-blue-400 border-blue-800/60'
                      : allCompleted
                      ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
                      {period.label}
                    </h2>
                    <span className="text-[11px] font-mono text-zinc-500">
                      ({period.timeRange})
                    </span>
                  </div>
                </div>
              </div>

              {/* Métricas do Período */}
              <div className="flex items-center gap-3 text-xs font-mono">
                {periodBlocks.length > 0 ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{totalMinutes} min</span>
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
                        allCompleted
                          ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>
                        {completedBlocks}/{periodBlocks.length} concluídos
                      </span>
                    </span>
                  </>
                ) : (
                  <span className="text-[11px] text-zinc-600 font-mono">
                    Livre / Sem alocação
                  </span>
                )}
              </div>
            </header>

            {/* Lista de Blocos ou Estado Vazio */}
            {periodBlocks.length > 0 ? (
              <div className="grid grid-cols-1 gap-3.5">
                {periodBlocks.map((block) => (
                  <BlockCard
                    key={block.id}
                    block={block}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div className="py-4 px-3 text-center rounded-lg border border-dashed border-zinc-850/80 bg-zinc-900/20 text-zinc-500 text-xs font-mono">
                Janela disponível para descanso, imprevistos ou revisões pontuais.
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
