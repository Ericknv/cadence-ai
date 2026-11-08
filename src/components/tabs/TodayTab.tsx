import React, { useState } from 'react';
import {
  Filter,
  PlayCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  EnrichedScheduleBlock,
  StudyTrack,
  SessionStatus,
} from '../../types/study';
import { NavTabId } from '../layout/TabNavigation';
import { CockpitTimeline } from '../cockpit/CockpitTimeline';
import { BlockCard } from '../cockpit/BlockCard';
import { ProposalCard } from '../cockpit/ProposalCard';

interface TodayTabProps {
  blocks: EnrichedScheduleBlock[];
  tracks?: StudyTrack[];
  onStatusChange: (blockId: string, newStatus: SessionStatus) => void;
  onOpenCreateTrackModal?: () => void;
  onNavigateToTab?: (tab: NavTabId) => void;
  className?: string;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  blocks,
  tracks = [],
  onStatusChange,
  onOpenCreateTrackModal,
  onNavigateToTab,
  className = '',
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | SessionStatus>('all');
  // Controle de alternância entre "Visão Geral Executiva" e "Modo Foco Estrito"
  const [isExecutiveViewOpen, setIsExecutiveViewOpen] = useState<boolean>(true);

  // Identifica a sessão ativa no momento (em andamento)
  const activeBlock = blocks.find((b) => b.session?.status === 'in_progress');
  // Primeiro bloco pendente do dia (caso não haja sessão em andamento)
  const firstPendingBlock = blocks.find((b) => b.session?.status === 'todo');

  // Filtra blocos da timeline
  const filteredBlocks =
    statusFilter === 'all'
      ? blocks
      : blocks.filter((b) => b.session.status === statusFilter);

  const handleStartSession = (blockId: string) => {
    onStatusChange(blockId, 'in_progress');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Toggle Minimalista de Modo de Visualização (Foco Estrito vs. Visão Executiva) */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          <span>
            {isExecutiveViewOpen
              ? 'Modo: Visão Geral Executiva'
              : 'Modo: Foco Estrito (Zero Distração)'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExecutiveViewOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer shadow-2xs"
          title={isExecutiveViewOpen ? 'Recolher Hero executivo' : 'Expandir Hero executivo'}
        >
          {isExecutiveViewOpen ? (
            <>
              <EyeOff className="w-3 h-3 text-zinc-500" />
              <span>Modo Foco Estrito</span>
            </>
          ) : (
            <>
              <Eye className="w-3 h-3 text-blue-400" />
              <span>Visão Executiva</span>
            </>
          )}
        </button>
      </div>

      {/* 2. ProposalCard Executivo Recolhível */}
      {isExecutiveViewOpen && (
        <section aria-label="Hero Executivo da Rotina" className="animate-in fade-in duration-200">
          <ProposalCard
            activeBlock={activeBlock || firstPendingBlock || null}
            blocks={blocks}
            tracks={tracks}
            onStartSession={handleStartSession}
            onOpenCreateTrack={onOpenCreateTrackModal}
            onOpenPlanner={() => onNavigateToTab && onNavigateToTab('planner')}
          />
        </section>
      )}

      {/* 3. Bloco de Destaque da Sessão Ativa (Cockpit Focus) */}
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

      {/* 4. Toolbar Sóbria de Filtragem */}
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

      {/* 5. Timeline Linear Enxuta do Dia */}
      <CockpitTimeline
        blocks={filteredBlocks}
        onStatusChange={onStatusChange}
      />
    </div>
  );
};
