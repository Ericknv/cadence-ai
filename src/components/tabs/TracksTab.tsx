import React from 'react';
import {
  Layers,
  Plus,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  StudyTrack,
  EnrichedScheduleBlock,
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
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cabeçalho de Linha de Produção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-zinc-100 font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Linha de Produção & Trilhas
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Catálogo de matérias, ementas atômicas e pipeline de execução.
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

      {/* Grid de Trilhas Existentes */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((track) => {
            const trackBlocks = blocks.filter((b) => b.track.id === track.id);
            const totalTrackSessions = trackBlocks.length;
            const completedSessions = trackBlocks.filter(
              (b) => b.session.status === 'completed'
            ).length;
            const progress =
              totalTrackSessions > 0
                ? Math.round((completedSessions / totalTrackSessions) * 100)
                : 0;

            return (
              <div
                key={track.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4 space-y-3 hover:border-zinc-700 transition-colors relative overflow-hidden"
              >
                {/* Linha de Cor Temática */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: track.color_hex || '#0284c7' }}
                />

                <div className="flex items-start justify-between gap-2 pt-1">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                      {track.category}
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-100 mt-1.5">
                      {track.title}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-300">
                    {progress}%
                  </span>
                </div>

                {track.overview && (
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {track.overview}
                  </p>
                )}

                {/* Barra de Progresso */}
                <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Metadados e Contagem de Sessões */}
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/60">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    {completedSessions} / {totalTrackSessions} sessões
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    {trackBlocks.reduce((acc, b) => acc + (b.session.estimated_duration_min || 0), 0)} min
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
