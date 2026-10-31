import React, { useState } from 'react';
import {
  mockEnrichedScheduleBlocks,
  TODAY_DATE,
} from './mocks/study-data';
import {
  EnrichedScheduleBlock,
  SessionStatus,
} from './types/study';
import { CockpitHeader } from './components/cockpit/CockpitHeader';
import { CockpitTimeline } from './components/cockpit/CockpitTimeline';
import { CreateTrackModal } from './components/modals/CreateTrackModal';
import { RebalanceModal } from './components/modals/RebalanceModal';
import {
  StudyTrack,
} from './types/study';
import {
  CheckCircle,
  Filter,
  X,
  Star,
  MessageSquare,
  Sparkles,
  Zap,
  Scale,
} from 'lucide-react';

export default function App() {
  const [blocks, setBlocks] = useState<EnrichedScheduleBlock[]>(
    mockEnrichedScheduleBlocks
  );
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_DATE);
  const [statusFilter, setStatusFilter] = useState<'all' | SessionStatus>('all');
  const [isCreateTrackOpen, setIsCreateTrackOpen] = useState<boolean>(false);
  const [isRebalanceOpen, setIsRebalanceOpen] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Estado para modal de feedback pós-estudo (perceived_difficulty & notes)
  const [feedbackModalBlock, setFeedbackModalBlock] =
    useState<EnrichedScheduleBlock | null>(null);
  const [ratingInput, setRatingInput] = useState<number>(3);
  const [notesInput, setNotesInput] = useState<string>('');

  const handleStatusChange = (blockId: string, newStatus: SessionStatus) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== blockId) return block;

        const updatedSession = {
          ...block.session,
          status: newStatus,
        };

        const updatedBlock: EnrichedScheduleBlock = {
          ...block,
          session: updatedSession,
        };

        // Se marcou como concluído, abre opcionalmente o modal de feedback
        if (newStatus === 'completed') {
          setFeedbackModalBlock(updatedBlock);
          setRatingInput(updatedSession.perceived_difficulty || 3);
          setNotesInput(updatedSession.notes || '');
        }

        return updatedBlock;
      })
    );
  };

  const handleSaveFeedback = () => {
    if (!feedbackModalBlock) return;

    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== feedbackModalBlock.id) return block;
        return {
          ...block,
          session: {
            ...block.session,
            perceived_difficulty: ratingInput,
            notes: notesInput.trim(),
          },
        };
      })
    );

    setFeedbackModalBlock(null);
  };

  const handleTrackCreated = (
    newBlocks: EnrichedScheduleBlock[],
    newTrack: StudyTrack
  ) => {
    setBlocks((prev) => [...newBlocks, ...prev]);
    setSuccessBanner(
      `Trilha "${newTrack.title}" gerada com sucesso! ${newBlocks.length} sessões incorporadas ao plano.`
    );
    setTimeout(() => {
      setSuccessBanner(null);
    }, 6000);
  };

  const handleApplyRebalancedSchedule = (newBlocks: EnrichedScheduleBlock[]) => {
    setBlocks(newBlocks);
    setSuccessBanner(
      `Cronograma semanal rebalanceado com sucesso! Carga redistribuída respeitando limites diários.`
    );
    setTimeout(() => {
      setSuccessBanner(null);
    }, 6000);
  };

  const handleResetMock = () => {
    setBlocks(mockEnrichedScheduleBlocks);
    setSuccessBanner(null);
  };

  // Filtragem visual dos blocos
  const filteredBlocks =
    statusFilter === 'all'
      ? blocks
      : blocks.filter((b) => b.session.status === statusFilter);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* Banner de Sucesso pós-decomposição / rebalanceamento */}
        {successBanner && (
          <div className="rounded-lg bg-emerald-950/60 border border-emerald-600/60 p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-200 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium font-mono">{successBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-400 hover:text-emerald-200 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Cockpit Header com KPIs Operacionais */}
        <CockpitHeader
          blocks={blocks}
          selectedDate={selectedDate}
          onResetMock={handleResetMock}
          onOpenCreateTrackModal={() => setIsCreateTrackOpen(true)}
          onOpenRebalanceModal={() => setIsRebalanceOpen(true)}
        />

        {/* Toolbar de Filtro e Controles Rápidos */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
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
                    ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-zinc-500">
            {filteredBlocks.length} de {blocks.length} blocos visualizados
          </div>
        </div>

        {/* Timeline do Cockpit Diário */}
        <CockpitTimeline
          blocks={filteredBlocks}
          onStatusChange={handleStatusChange}
        />
      </main>

      {/* Modal / Sheet de Feedback Pós-Estudo */}
      {feedbackModalBlock && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-750 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 mb-1.5">
                  <CheckCircle className="w-3 h-3" />
                  Sessão Finalizada
                </span>
                <h3 className="text-sm font-semibold text-zinc-100">
                  {feedbackModalBlock.session.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackModalBlock(null)}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avaliação de Dificuldade Percebida (1 a 5) */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Dificuldade Percebida (1: Trivial a 5: Extrema)</span>
                <span className="font-bold text-amber-400">
                  Nível {ratingInput}/5
                </span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setRatingInput(lvl)}
                    className={`flex-1 py-1.5 rounded text-xs font-mono font-medium border transition-colors cursor-pointer ${
                      ratingInput === lvl
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/80 shadow-xs'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas Pós-Estudo */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                <span>Notas / Dúvidas / Gaps Identificados</span>
              </label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Ex: Rever cálculo de base viável e sensibilidade de preço sombra..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
              />
            </div>

            {/* Botões do Modal */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setFeedbackModalBlock(null)}
                className="px-3 py-1.5 rounded text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Pular Feedback
              </button>
              <button
                type="button"
                onClick={handleSaveFeedback}
                className="px-3.5 py-1.5 rounded text-xs font-mono font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors cursor-pointer"
              >
                Salvar Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação e Decomposição de Trilha com IA */}
      <CreateTrackModal
        isOpen={isCreateTrackOpen}
        onClose={() => setIsCreateTrackOpen(false)}
        onTrackCreated={handleTrackCreated}
      />

      {/* Modal de Rebalanceamento Semanal & Proteção contra Burnout */}
      <RebalanceModal
        isOpen={isRebalanceOpen}
        onClose={() => setIsRebalanceOpen(false)}
        currentBlocks={blocks}
        onApplyRebalancedSchedule={handleApplyRebalancedSchedule}
      />

      {/* Footer Técnico Minimalista */}
      <footer className="border-t border-zinc-900 py-3 text-center text-[11px] font-mono text-zinc-600">
        StudyPilot Cadence Engine • Modo Operacional • {TODAY_DATE}
      </footer>
    </div>
  );
}
