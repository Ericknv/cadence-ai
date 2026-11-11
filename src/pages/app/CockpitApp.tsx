import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  TODAY_DATE,
} from '../../mocks/study-data';
import {
  EnrichedScheduleBlock,
  SessionStatus,
  StudyTrack,
} from '../../types/study';
import { TopFloatingDock } from '../../components/navigation/TopFloatingDock';
import { TodayTab } from '../../components/tabs/TodayTab';
import { TracksTab } from '../../components/tabs/TracksTab';
import { PlannerTab } from '../../components/tabs/PlannerTab';
import { InsightsTab } from '../../components/tabs/InsightsTab';
import { CreateTrackModal } from '../../components/modals/CreateTrackModal';
import { ImportExternalCourseModal } from '../../components/modals/ImportExternalCourseModal';
import { StudentProfileModal, StudentProfile } from '../../components/modals/StudentProfileModal';
import { RebalanceModal } from '../../components/modals/RebalanceModal';
import { AuthModal } from '../../components/auth/AuthModal';
import { useAuth } from '../../lib/auth';
import {
  loadStoredData,
  saveBlocks,
  saveTrack,
  resetToDefaultMock,
  exportDataAsJSON,
  importDataFromJSON,
} from '../../services/storageService';
import {
  fetchUserScheduleBlocks,
  fetchUserTracks,
  updateSessionStatus,
  updateTrackDetails,
  deleteTrackAndSessions,
  persistNewTrackAndSessions,
  syncRebalancedBlocks,
} from '../../services/supabaseService';
import {
  CheckCircle,
  X,
  MessageSquare,
  Zap,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';

type CockpitTab = 'today' | 'tracks' | 'planner' | 'insights';

/** Mapeamento entre segmentos de URL (/app/:tab) e as abas internas do cockpit. */
const TAB_BY_SEGMENT: Record<string, CockpitTab> = {
  today: 'today',
  trails: 'tracks',
  planning: 'planner',
  metrics: 'insights',
};

const SEGMENT_BY_TAB: Record<CockpitTab, string> = {
  today: 'today',
  tracks: 'trails',
  planner: 'planning',
  insights: 'metrics',
};

export default function CockpitApp() {
  const { tab: tabSegment } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const { user, isDemo, setUser, signOut } = useAuth();
  const activeTab: CockpitTab | undefined = tabSegment ? TAB_BY_SEGMENT[tabSegment] : undefined;
  const setActiveTab = (tab: CockpitTab) => navigate(`/app/${SEGMENT_BY_TAB[tab]}`);

  // ISOLAMENTO ESTRITO: se usuário autenticado, nunca inicia com mocks!
  const [blocks, setBlocks] = useState<EnrichedScheduleBlock[]>(() => {
    return loadStoredData(user?.id, isDemo).blocks;
  });
  const [tracks, setTracks] = useState<StudyTrack[]>(() => {
    return loadStoredData(user?.id, isDemo).tracks;
  });

  const [selectedDate, setSelectedDate] = useState<string>(TODAY_DATE);
  const [isCreateTrackOpen, setIsCreateTrackOpen] = useState<boolean>(false);
  const [isImportCourseOpen, setIsImportCourseOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isRebalanceOpen, setIsRebalanceOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Estado para modal de feedback pós-estudo (perceived_difficulty & notes)
  const [feedbackModalBlock, setFeedbackModalBlock] =
    useState<EnrichedScheduleBlock | null>(null);
  const [ratingInput, setRatingInput] = useState<number>(3);
  const [notesInput, setNotesInput] = useState<string>('');

  // Carregamento de dados com isolamento estrito
  useEffect(() => {
    let isMounted = true;

    if (user?.id) {
      Promise.all([
        fetchUserScheduleBlocks(selectedDate, user.id),
        fetchUserTracks(user.id),
      ]).then(([remoteBlocks, remoteTracks]) => {
        if (!isMounted) return;
        setBlocks(remoteBlocks);
        setTracks(remoteTracks);
      });
    } else {
      const demoData = loadStoredData(undefined, true);
      setBlocks(demoData.blocks);
      setTracks(demoData.tracks);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedDate, user?.id, isDemo]);

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

      saveBlocks(updated, user?.id);
      return updated;
    });

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

      saveBlocks(updated, user?.id);
      return updated;
    });

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
    saveTrack(newTrack, user?.id);
    setTracks((prev) => [newTrack, ...prev.filter((t) => t.id !== newTrack.id)]);
    setBlocks((prev) => {
      const updated = [...newBlocks, ...prev];
      saveBlocks(updated, user?.id);
      return updated;
    });

    const sessions = newBlocks.map((b) => b.session);
    try {
      await persistNewTrackAndSessions(newTrack, sessions, selectedDate, user?.id);
    } catch (err) {
      console.warn('[Sync Track Warning]: Falha ao persistir no Supabase, dados salvos localmente.', err);
    }

    setSuccessBanner(
      `Trilha "${newTrack.title}" gerada com sucesso! ${newBlocks.length} sessões incorporadas.`
    );
    setTimeout(() => {
      setSuccessBanner(null), 6000;
    }, 6000);
  };

  const handleCourseImported = async (
    newBlocks: EnrichedScheduleBlock[],
    track: StudyTrack
  ) => {
    saveTrack(track, user?.id);
    setTracks((prev) => [track, ...prev.filter((t) => t.id !== track.id)]);
    setBlocks((prev) => {
      const updated = [...newBlocks, ...prev];
      saveBlocks(updated, user?.id);
      return updated;
    });

    const sessions = newBlocks.map((b) => b.session);
    try {
      await persistNewTrackAndSessions(track, sessions, selectedDate, user?.id);
    } catch (err) {
      console.warn('[Sync Course Warning]: Falha ao persistir no Supabase, dados salvos localmente.', err);
    }

    setSuccessBanner(
      `Curso "${track.title}" importado com sucesso! ${newBlocks.length} blocos atômicos gerados e distribuídos.`
    );
    setTimeout(() => {
      setSuccessBanner(null);
    }, 6000);
  };

  const handleUpdateTrack = async (updatedTrack: StudyTrack) => {
    try {
      await updateTrackDetails(updatedTrack, user?.id);
      setTracks((prev) => prev.map((t) => (t.id === updatedTrack.id ? updatedTrack : t)));
      setBlocks((prev) =>
        prev.map((b) =>
          b.track.id === updatedTrack.id ? { ...b, track: updatedTrack } : b
        )
      );
      setSuccessBanner(`Trilha "${updatedTrack.title}" atualizada com sucesso.`);
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      console.error('Falha ao atualizar trilha:', err);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    try {
      await deleteTrackAndSessions(trackId, user?.id);
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
      setBlocks((prev) => prev.filter((b) => b.track.id !== trackId));
      setSuccessBanner('Trilha e sessões associadas excluídas com sucesso.');
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      console.error('Falha ao excluir trilha:', err);
    }
  };

  const handleApplyRebalancedSchedule = (newBlocks: EnrichedScheduleBlock[]) => {
    saveBlocks(newBlocks, user?.id);
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
    await signOut();
    navigate('/', { replace: true });
  };

  const handleResetMock = () => {
    const { blocks: defaultBlocks, tracks: defaultTracks } = resetToDefaultMock(user?.id);
    setBlocks(defaultBlocks);
    setTracks(defaultTracks);
    setSuccessBanner('Armazenamento local limpo e restaurado para os dados padrão.');
    setTimeout(() => {
      setSuccessBanner(null);
    }, 6000);
  };

  const handleImportBackup = (fileContent: string) => {
    try {
      const { blocks: importedBlocks, tracks: importedTracks } = importDataFromJSON(fileContent, user?.id);
      setBlocks(importedBlocks);
      if (importedTracks && importedTracks.length > 0) {
        setTracks(importedTracks);
      }
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

  // Cálculo de RCCP (Rough-Cut Capacity Planning) da semana/dia
  const totalPlannedMin = blocks.reduce(
    (acc, b) => acc + (b.session?.estimated_duration_min || 0),
    0
  );
  const completedMin = blocks
    .filter((b) => b.session?.status === 'completed')
    .reduce((acc, b) => acc + (b.session?.estimated_duration_min || 0), 0);
  const rccpRate =
    totalPlannedMin > 0
      ? Math.min(100, Math.round((completedMin / totalPlannedMin) * 100))
      : 88;

  if (!activeTab) {
    return <Navigate to="/app/today" replace />;
  }

  return (
    <div className="min-h-screen bg-[#090B0E] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black relative overflow-x-hidden">
      {/* Glow Orbs Difusos de Fundo */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-sky-500/5 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none z-0" />

      {/* Navegação em Floating Dock Centralizado */}
      <TopFloatingDock
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        rccpPercentage={rccpRate}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Container Principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-24 pb-12 sm:px-6 space-y-6 relative z-10">
        {/* Banner de Sucesso / Feedback Transitório */}
        {successBanner && (
          <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-3 sm:p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-200 backdrop-blur-xl animate-in fade-in duration-300">
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

        {/* Renderização Condicional da Aba Ativa */}
        <div className="pt-2">
          {activeTab === 'today' && (
            <TodayTab
              blocks={blocks}
              tracks={tracks}
              onStatusChange={handleStatusChange}
              onOpenCreateTrack={() => setIsCreateTrackOpen(true)}
            />
          )}

          {activeTab === 'tracks' && (
            <TracksTab
              tracks={tracks}
              blocks={blocks}
              onOpenCreateTrackModal={() => setIsCreateTrackOpen(true)}
              onOpenImportCourseModal={() => setIsImportCourseOpen(true)}
              onUpdateTrack={handleUpdateTrack}
              onDeleteTrack={handleDeleteTrack}
            />
          )}

          {activeTab === 'planner' && (
            <PlannerTab
              blocks={blocks}
              onApplyRebalancedSchedule={handleApplyRebalancedSchedule}
              onOpenRebalanceModal={() => setIsRebalanceOpen(true)}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsTab
              blocks={blocks}
            />
          )}
        </div>
      </main>

      {/* Modal de Feedback Pós-Estudo */}
      {feedbackModalBlock && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#090B0E]/90 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 mb-2">
                  <CheckCircle className="w-3 h-3" />
                  Sessão Finalizada
                </span>
                <h3 className="text-sm font-semibold text-slate-100">
                  {feedbackModalBlock.session.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackModalBlock(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avaliação de Dificuldade Percebida (1 a 5) */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
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
                    className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-medium border transition-colors cursor-pointer ${
                      ratingInput === lvl
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/80 shadow-xs'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/15'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas Pós-Estudo */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Notas / Dúvidas / Gaps Identificados</span>
              </label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Ex: Rever dedução matricial de simplex e dualidade..."
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>

            {/* Botões do Modal */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setFeedbackModalBlock(null)}
                className="px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Pular
              </button>
              <button
                type="button"
                onClick={handleSaveFeedback}
                className="px-4 py-2 rounded-full text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-colors cursor-pointer"
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

      {/* Modal de Ingestão de Cursos Externos */}
      <ImportExternalCourseModal
        isOpen={isImportCourseOpen}
        onClose={() => setIsImportCourseOpen(false)}
        existingTracks={tracks}
        userId={user?.id}
        onCourseImported={handleCourseImported}
      />

      {/* Drawer/Modal de Perfil do Estudante */}
      <StudentProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        tracks={tracks}
        onProfileUpdated={(updatedProfile: StudentProfile) => {
          setSuccessBanner(`Metas de ${updatedProfile.fullName} atualizadas: ${(updatedProfile.dailyCapacityMinutes / 60).toFixed(1)}h diárias.`);
          setTimeout(() => setSuccessBanner(null), 5000);
        }}
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
          setSuccessBanner(`Conectado como ${authenticatedUser?.email ?? "usuário"}! Dados sincronizados.`);
          setTimeout(() => setSuccessBanner(null), 6000);
        }}
      />

      {/* Footer Técnico Minimalista & Controles Discretos de Dados */}
      <footer className="border-t border-white/5 py-6 px-4 text-center text-[11px] font-mono text-slate-500 space-y-2 relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
          <button
            type="button"
            onClick={() => exportDataAsJSON(user?.id)}
            className="hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
            title="Exportar backup completo das trilhas em JSON"
          >
            <Download className="w-3 h-3 text-slate-500" />
            <span>Exportar Backup</span>
          </button>
          <span>•</span>
          <label className="hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer">
            <Upload className="w-3 h-3 text-slate-500" />
            <span>Restaurar Backup</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const content = event.target?.result;
                  if (typeof content === 'string') {
                    handleImportBackup(content);
                  }
                };
                reader.readAsText(file);
                e.target.value = '';
              }}
            />
          </label>
          <span>•</span>
          <button
            type="button"
            onClick={handleResetMock}
            className="hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
            title="Resetar banco local para mocks padrão"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Restaurar Dados</span>
          </button>
        </div>
        <div>
          <Link to="/" className="hover:text-slate-200 transition-colors">
            ← Voltar ao site
          </Link>
        </div>
        <div>
          Cadence AI • Engenharia de Rotina & PCP Cognitivo • {TODAY_DATE}
        </div>
      </footer>
    </div>
  );
}
