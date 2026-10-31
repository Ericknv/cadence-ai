import React, { useState, useEffect } from 'react';
import {
  mockEnrichedScheduleBlocks,
  TODAY_DATE,
} from './mocks/study-data';
import {
  EnrichedScheduleBlock,
  SessionStatus,
  StudyTrack,
  StudySession,
  ScheduleBlock,
} from './types/study';
import { CockpitHeader } from './components/cockpit/CockpitHeader';
import { CockpitTimeline } from './components/cockpit/CockpitTimeline';
import { CreateTrackModal } from './components/modals/CreateTrackModal';
import { RebalanceModal } from './components/modals/RebalanceModal';
import { AuthModal } from './components/auth/AuthModal';
import { supabaseClient, isSupabaseConfigured } from './lib/supabaseClient';
import {
  loadStoredData,
  saveBlocks,
  saveTrack,
  resetToDefaultMock,
  exportDataAsJSON,
  importDataFromJSON,
} from './services/storageService';
import {
  fetchUserScheduleBlocks,
  updateSessionStatus,
  persistNewTrackAndSessions,
  syncRebalancedBlocks,
} from './services/supabaseService';
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
    () => loadStoredData().blocks
  );
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_DATE);
  const [statusFilter, setStatusFilter] = useState<'all' | SessionStatus>('all');
  const [isCreateTrackOpen, setIsCreateTrackOpen] = useState<boolean>(false);
  const [isRebalanceOpen, setIsRebalanceOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Estado para modal de feedback pós-estudo (perceived_difficulty & notes)
  const [feedbackModalBlock, setFeedbackModalBlock] =
    useState<EnrichedScheduleBlock | null>(null);
  const [ratingInput, setRatingInput] = useState<number>(3);
  const [notesInput, setNotesInput] = useState<string>('');

  // Verificação de sessão de usuário no Supabase Auth
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabaseClient.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });

      const {
        data: { subscription },
      } = supabaseClient.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Carregamento inicial e reativo ao mudar de data ou usuário via Supabase
  useEffect(() => {
    let isMounted = true;
    fetchUserScheduleBlocks(selectedDate, user?.id).then((remoteBlocks) => {
      if (isMounted && remoteBlocks && remoteBlocks.length > 0) {
        setBlocks(remoteBlocks);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedDate, user]);

  const handleStatusChange = (blockId: string, newStatus: SessionStatus) => {
    let targetSessionId = '';
    setBlocks((prev) => {
      let targetForModal: EnrichedScheduleBlock | null = null;
      const updated = prev.map((block) => {
        if (block.id !== blockId) return block;

        targetSessionId = block.session.id;
        const updatedSession = {
          ...block.session,
          status: newStatus,
        };

        const updatedBlock: EnrichedScheduleBlock = {
          ...block,
          session: updatedSession,
        };

        if (newStatus === 'completed') {
          targetForModal = updatedBlock;
        }

        return updatedBlock;
      });

      if (targetForModal) {
        setFeedbackModalBlock(targetForModal);
        setRatingInput((targetForModal as EnrichedScheduleBlock).session.perceived_difficulty || 3);
        setNotesInput((targetForModal as EnrichedScheduleBlock).session.notes || '');
      }

      saveBlocks(updated);
      return updated;
    });

    // Sincronização remota com Supabase (background)
    if (targetSessionId) {
      updateSessionStatus(targetSessionId, newStatus);
    }
  };

  const handleSaveFeedback = () => {
    if (!feedbackModalBlock) return;
    const targetSessionId = feedbackModalBlock.session.id;

    setBlocks((prev) => {
      const updated = prev.map((block) => {
        if (block.id !== feedbackModalBlock.id) return block;
        return {
          ...block,
          session: {
            ...block.session,
            perceived_difficulty: ratingInput,
            notes: notesInput.trim(),
          },
        };
      });

      saveBlocks(updated);
      return updated;
    });

    // Sincronização remota de feedback com Supabase
    updateSessionStatus(targetSessionId, feedbackModalBlock.session.status, {
      perceived_difficulty: ratingInput,
      notes: notesInput.trim(),
    });
    setFeedbackModalBlock(null);
  };

  const handleTrackCreated = async (
    newBlocks: EnrichedScheduleBlock[],
    newTrack: StudyTrack
  ) => {
    saveTrack(newTrack);
    setBlocks((prev) => {
      const updated = [...newBlocks, ...prev];
      saveBlocks(updated);
      return updated;
    });

    // Sincroniza trilha e sessões no Supabase com rollback defensivo
    const sessions = newBlocks.map((b) => b.session);
    try {
      await persistNewTrackAndSessions(newTrack, sessions, selectedDate);
    } catch (err) {
      console.warn('[Sync Track Warning]: Falha ao persistir no Supabase, dados salvos localmente.', err);
    }

    setSuccessBanner(
      `Trilha "${newTrack.title}" gerada com sucesso! ${newBlocks.length} sessões incorporadas e sincronizadas.`
    );
    setTimeout(() => {
      setSuccessBanner(null);
    }, 6000);
  };

  const handleApplyRebalancedSchedule = (newBlocks: EnrichedScheduleBlock[]) => {
    saveBlocks(newBlocks);
    setBlocks(newBlocks);

    const dateList = Array.from(new Set(newBlocks.map((b) => b.target_date)));
    syncRebalancedBlocks(newBlocks, dateList, user?.id);

    setSuccessBanner(
      `Cronograma semanal rebalanceado com sucesso! Carga redistribuída respeitando limites diários.`
    );
    setTimeout(() => {
      setSuccessBanner(null);
    }, 6000);
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      await supabaseClient.auth.signOut();
      setUser(null);
      setSuccessBanner('Sessão encerrada. Operando no modo local.');
      setTimeout(() => setSuccessBanner(null), 5000);
    }
  };

  const handleResetMock = () => {
    const { blocks: defaultBlocks } = resetToDefaultMock();
    setBlocks(defaultBlocks);
    setSuccessBanner('Armazenamento local limpo e restaurado para os mocks padrão.');
    setTimeout(() => {
      setSuccessBanner(null);
    }, 6000);
  };

  const handleImportBackup = (fileContent: string) => {
    try {
      const { blocks: importedBlocks } = importDataFromJSON(fileContent);
      setBlocks(importedBlocks);
      setSuccessBanner(
        `Backup restaurado com sucesso! ${importedBlocks.length} blocos carregados e sincronizados.`
      );
      setTimeout(() => {
        setSuccessBanner(null);
      }, 6000);
    } catch (err: unknown) {
      console.error(err);
      setSuccessBanner(
        err instanceof Error ? `Erro: ${err.message}` : 'Falha ao restaurar arquivo de backup'
      );
    }
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
        {/* Banner de Sucesso pós-decomposição / rebalanceamento / backup */}
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
          user={user}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onSignOut={handleSignOut}
          onResetMock={handleResetMock}
          onOpenCreateTrackModal={() => setIsCreateTrackOpen(true)}
          onOpenRebalanceModal={() => setIsRebalanceOpen(true)}
          onExportBackup={exportDataAsJSON}
          onImportBackup={handleImportBackup}
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
        userId={user?.id}
        onTrackCreated={handleTrackCreated}
      />

      {/* Modal de Rebalanceamento Semanal & Proteção contra Burnout */}
      <RebalanceModal
        isOpen={isRebalanceOpen}
        onClose={() => setIsRebalanceOpen(false)}
        currentBlocks={blocks}
        onApplyRebalancedSchedule={handleApplyRebalancedSchedule}
      />

      {/* Modal de Autenticação Supabase */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          setSuccessBanner(`Conectado como ${authenticatedUser.email}! Dados sincronizados.`);
          setTimeout(() => setSuccessBanner(null), 6000);
        }}
      />

      {/* Footer Técnico Minimalista */}
      <footer className="border-t border-zinc-900 py-3 text-center text-[11px] font-mono text-zinc-600">
        StudyPilot Cadence Engine • Modo Operacional • {TODAY_DATE}
      </footer>
    </div>
  );
}
