import React, { useState } from 'react';
import {
  Filter,
  PlayCircle,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  EnrichedScheduleBlock,
  SessionStatus,
} from '../../types/study';
import { CockpitTimeline } from '../cockpit/CockpitTimeline';
import { BlockCard } from '../cockpit/BlockCard';

interface TodayTabProps {
  blocks: EnrichedScheduleBlock[];
  onStatusChange: (blockId: string, newStatus: SessionStatus) => void;
  className?: string;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  blocks,
  onStatusChange,
  className = '',
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | SessionStatus>('all');

  // Identifica a sessão ativa no momento (em andamento)
  const activeBlock = blocks.find((b) => b.session?.status === 'in_progress');

  // Filtra blocos da timeline
  const filteredBlocks =
    statusFilter === 'all'
      ? blocks
      : blocks.filter((b) => b.session.status === statusFilter);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Bloco de Destaque da Sessão Ativa (Cockpit Focus) */}
      {activeBlock && (
        <section aria-labelledby="active-session-title" className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
            <PlayCircle className="w-4 h-4 animate-pulse" />
            <span id="active-session-title" className="font-semibold uppercase tracking-wider">
              Sessão Ativa Agora (Foco Total)
            </span>
          </div>
          <BlockCard
            block={activeBlock}
            onStatusChange={onStatusChange}
            className="border-blue-500/50 bg-blue-950/20"
          />
        </section>
      )}

      {/* Toolbar Sóbria de Filtragem */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-900">
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
          <span className="px-2 py-1 text-zinc-500 flex items-center gap-1">
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
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-zinc-500">
          {filteredBlocks.length} de {blocks.length} blocos
        </div>
      </div>

      {/* Timeline Linear Enxuta do Dia */}
      <CockpitTimeline
        blocks={filteredBlocks}
        onStatusChange={onStatusChange}
      />
    </div>
  );
};
