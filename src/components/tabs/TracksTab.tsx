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
  Edit3,
  Trash2,
  X,
  AlertTriangle,
  Sparkles,
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
  onOpenImportCourseModal?: () => void;
  onUpdateTrack?: (updatedTrack: StudyTrack) => void;
  onDeleteTrack?: (trackId: string) => void;
  className?: string;
}

export const TracksTab: React.FC<TracksTabProps> = ({
  tracks,
  blocks,
  onOpenCreateTrackModal,
  onOpenImportCourseModal,
  onUpdateTrack,
  onDeleteTrack,
  className = '',
}) => {
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>(() => {
    if (tracks.length > 0) {
      return { [tracks[0].id]: true };
    }
    return {};
  });

  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});

  // Modais de Gestão de Trilha (Editar e Excluir)
  const [editingTrack, setEditingTrack] = useState<StudyTrack | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editOverview, setEditOverview] = useState<string>('');
  const [editColor, setEditColor] = useState<string>('#88C0A8');

  const [deletingTrack, setDeletingTrack] = useState<StudyTrack | null>(null);

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

  const handleStartEdit = (track: StudyTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTrack(track);
    setEditTitle(track.title);
    setEditCategory(track.category);
    setEditOverview(track.overview || '');
    setEditColor(track.color_hex || '#88C0A8');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack || !onUpdateTrack) return;
    const updated: StudyTrack = {
      ...editingTrack,
      title: editTitle.trim() || editingTrack.title,
      category: editCategory.trim() || editingTrack.category,
      overview: editOverview.trim(),
      color_hex: editColor,
      updated_at: new Date().toISOString(),
    };
    onUpdateTrack(updated);
    setEditingTrack(null);
  };

  const handleStartDelete = (track: StudyTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingTrack(track);
  };

  const handleConfirmDelete = () => {
    if (!deletingTrack || !onDeleteTrack) return;
    onDeleteTrack(deletingTrack.id);
    setDeletingTrack(null);
  };

  const renderStatusMicroIcon = (status: SessionStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-[#88C0A8]" title="Sessão Concluída">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#88C0A8] shrink-0" />
            <span className="hidden sm:inline">Concluída</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-sky-400" title="Sessão em Andamento">
            <PlayCircle className="w-3.5 h-3.5 text-sky-400 shrink-0 animate-pulse" />
            <span className="hidden sm:inline">Em foco</span>
          </span>
        );
      case 'skipped':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500" title="Sessão Pulada">
            <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="hidden sm:inline">Pulada</span>
          </span>
        );
      case 'todo':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500" title="Sessão Pendente">
            <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="hidden sm:inline">Pendente</span>
          </span>
        );
    }
  };

  const renderCognitiveEffort = (effort: CognitiveEffort) => {
    const config: Record<
      CognitiveEffort,
      { label: string; textClass: string; bgClass: string; borderClass: string }
    > = {
      low: {
        label: 'Low',
        textClass: 'text-[#88C0A8]',
        bgClass: 'bg-[#88C0A8]/10',
        borderClass: 'border-[#88C0A8]/30',
      },
      medium: {
        label: 'Medium',
        textClass: 'text-sky-400',
        bgClass: 'bg-sky-500/10',
        borderClass: 'border-sky-500/30',
      },
      high: {
        label: 'High (Deep Work)',
        textClass: 'text-[#FB7185]',
        bgClass: 'bg-[#FB7185]/10',
        borderClass: 'border-[#FB7185]/30',
      },
    };

    const c = config[effort] || config.medium;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border ${c.bgClass} ${c.textClass} ${c.borderClass}`}
      >
        <Brain className="w-2.5 h-2.5" />
        {c.label}
      </span>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Header do Catálogo com Ação Principal Discreta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <h2 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#88C0A8]" />
            Linha de Produção & Trilhas
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Pipeline pedagógico, catálogo de disciplinas e backlog de sessões atômicas.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onOpenImportCourseModal && (
            <button
              type="button"
              onClick={onOpenImportCourseModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-mono text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#569DAA]" />
              <span>+ Importar Curso Externo</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCreateTrackModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-bold bg-[#88C0A8] hover:bg-[#9ad0b8] text-slate-950 shadow-[0_0_20px_rgba(136,192,168,0.2)] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Trilha com IA</span>
          </button>
        </div>
      </div>

      {/* 2. Catálogo Visual de Trilhas com Design Vidro-Apple */}
      {tracks.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#0E1319]/70 backdrop-blur-2xl p-8 sm:p-12 text-center space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="w-12 h-12 rounded-2xl bg-[#88C0A8]/10 border border-[#88C0A8]/30 flex items-center justify-center mx-auto text-[#88C0A8] shadow-[0_0_20px_rgba(136,192,168,0.2)]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-display text-lg font-bold text-slate-100">
              Nenhuma trilha cadastrada
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Crie sua primeira disciplina para calcular sua cadência cognitiva ou importe cursos da Udemy, Coursera ou Alura.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={onOpenCreateTrackModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-bold bg-[#88C0A8] hover:bg-[#9ad0b8] text-slate-950 shadow-[0_0_25px_rgba(136,192,168,0.25)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Primeira Trilha com IA</span>
            </button>
            {onOpenImportCourseModal && (
              <button
                type="button"
                onClick={onOpenImportCourseModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-mono text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#569DAA]" />
                <span>Importar Curso Externo</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {tracks.map((track) => {
            const trackBlocks = blocks.filter((b) => b.track.id === track.id);

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
                className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_20px_45px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 hover:border-white/20"
              >
                {/* Linha Sutil de Acento */}
                <div
                  className="h-1 w-full"
                  style={{ backgroundColor: track.color_hex || '#88C0A8' }}
                />

                {/* Cabeçalho do Card (Vidro-Apple) */}
                <div
                  onClick={() => toggleTrack(track.id)}
                  className="p-5 sm:p-6 cursor-pointer select-none space-y-4"
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
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                          {track.category}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {totalSessionsCount} sessões atômicas
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-100 font-display">
                        {track.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-sm font-display font-bold text-slate-100">
                          {progress}%
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {totalCompletedMinutes}m / {totalPlannedMinutes}m
                        </div>
                      </div>

                      {/* Botões de Ação Discretos (Editar e Excluir) */}
                      <div className="flex items-center gap-1 pl-2 border-l border-white/10">
                        {onUpdateTrack && (
                          <button
                            type="button"
                            onClick={(e) => handleStartEdit(track, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                            title="Editar Trilha"
                            aria-label={`Editar trilha ${track.title}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteTrack && (
                          <button
                            type="button"
                            onClick={(e) => handleStartDelete(track, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Excluir Trilha"
                            aria-label={`Excluir trilha ${track.title}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {track.overview && (
                    <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-3xl">
                      {track.overview}
                    </p>
                  )}

                  {/* Barra Minimalista de Progresso */}
                  <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-[#88C0A8] to-[#569DAA] rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* 3. Backlog Atômico com Progressive Disclosure */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-black/30 p-5 sm:p-6 space-y-3.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-white/5">
                      <span className="uppercase tracking-wider font-semibold">
                        Backlog Atômico de Sessões
                      </span>
                      <span className="text-[11px] text-slate-500 hidden sm:inline">
                        Clique na sessão para expandir metas de aprendizagem
                      </span>
                    </div>

                    {trackSessions.length === 0 ? (
                      <div className="text-xs font-mono text-slate-500 py-4 text-center">
                        Nenhuma sessão vinculada a esta trilha.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {trackSessions.map((session) => {
                          const isGoalOpen = !!expandedGoals[session.id];

                          return (
                            <div
                              key={session.id}
                              className="rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/15 transition-colors overflow-hidden"
                            >
                              <div
                                onClick={(e) => toggleGoals(session.id, e)}
                                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer select-none"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="text-[10px] font-mono text-slate-500 bg-black/50 px-2 py-0.5 rounded-full border border-white/5 shrink-0">
                                    #{session.sequence_order}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-200 font-mono truncate">
                                    {session.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                                  {renderCognitiveEffort(session.cognitive_effort)}

                                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    {session.estimated_duration_min}m
                                  </span>

                                  {renderStatusMicroIcon(session.status)}

                                  <span className="text-slate-500 text-xs pl-1">
                                    {isGoalOpen ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                  </span>
                                </div>
                              </div>

                              {isGoalOpen && (
                                <div className="px-4 pb-4 pt-1.5 text-xs font-mono space-y-2.5 border-t border-white/5 bg-black/40">
                                  {session.learning_goals && session.learning_goals.length > 0 && (
                                    <div className="space-y-1.5">
                                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                                        <Target className="w-3 h-3 text-[#569DAA]" />
                                        Metas de Aprendizagem:
                                      </span>
                                      <ul className="space-y-1 pl-1">
                                        {session.learning_goals.map((goal, gIdx) => (
                                          <li
                                            key={gIdx}
                                            className="text-[11px] text-slate-300 flex items-start gap-1.5"
                                          >
                                            <span className="text-slate-600 mt-0.5">•</span>
                                            <span>{goal}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {session.recommended_approach && (
                                    <div className="space-y-1 pt-1.5 border-t border-white/5">
                                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                                        <Lightbulb className="w-3 h-3 text-amber-400" />
                                        Abordagem Recomendada:
                                      </span>
                                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
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

      {/* MODAL EDITAR TRILHA */}
      {editingTrack && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#090B0E]/95 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl backdrop-blur-3xl relative">
            <button
              type="button"
              onClick={() => setEditingTrack(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#88C0A8]" />
              <h3 className="text-base font-bold text-slate-100 font-display">Editar Trilha</h3>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Título da Trilha</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#88C0A8] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Categoria / Eixo</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="Ex: Engenharia de Produção, Exatas..."
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#88C0A8] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Visão Geral / Descrição</label>
                <textarea
                  value={editOverview}
                  onChange={(e) => setEditOverview(e.target.value)}
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#88C0A8] font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Cor de Acento</label>
                <div className="flex items-center gap-2">
                  {['#88C0A8', '#569DAA', '#FB7185', '#A0AEC0', '#38BDF8', '#F59E0B'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        editColor === color ? 'scale-110 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingTrack(null)}
                  className="px-4 py-2 rounded-full text-xs font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-mono font-bold bg-[#88C0A8] hover:bg-[#9ad0b8] text-slate-950 transition-colors cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAÇÃO EXCLUIR TRILHA */}
      {deletingTrack && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#090B0E]/95 border border-rose-500/30 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl backdrop-blur-3xl relative">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100 font-display">
                  Excluir trilha &quot;{deletingTrack.title}&quot;?
                </h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Esta ação é irreversível. Todas as sessões atômicas vinculadas e os blocos agendados no cockpit serão
                  excluídos permanentemente.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeletingTrack(null)}
                className="px-4 py-2 rounded-full text-xs font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-full text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
