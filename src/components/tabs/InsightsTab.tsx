import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Brain,
  Star,
  Activity,
  Award,
} from 'lucide-react';
import { EnrichedScheduleBlock } from '../../types/study';

interface InsightsTabProps {
  blocks: EnrichedScheduleBlock[];
  className?: string;
}

export const InsightsTab: React.FC<InsightsTabProps> = ({
  blocks,
  className = '',
}) => {
  const completedBlocks = blocks.filter((b) => b.session?.status === 'completed');
  const totalBlocks = blocks.length;

  const totalCompletedMinutes = completedBlocks.reduce(
    (acc, b) => acc + (b.session?.estimated_duration_min || 0),
    0
  );

  const totalPlannedMinutes = blocks.reduce(
    (acc, b) => acc + (b.session?.estimated_duration_min || 0),
    0
  );

  const adherenceRate =
    totalPlannedMinutes > 0
      ? Math.round((totalCompletedMinutes / totalPlannedMinutes) * 100)
      : 0;

  // Cálculo da Média de Dificuldade Percebida (1 a 5)
  const ratedSessions = completedBlocks.filter(
    (b) => typeof b.session?.perceived_difficulty === 'number'
  );
  const avgDifficulty =
    ratedSessions.length > 0
      ? (
          ratedSessions.reduce(
            (acc, b) => acc + (b.session?.perceived_difficulty || 0),
            0
          ) / ratedSessions.length
        ).toFixed(1)
      : 'N/A';

  // Distribuição de Esforço Cognitivo Concluído
  const effortMinutes = {
    high: completedBlocks
      .filter((b) => b.session?.cognitive_effort === 'high')
      .reduce((acc, b) => acc + (b.session?.estimated_duration_min || 0), 0),
    medium: completedBlocks
      .filter((b) => b.session?.cognitive_effort === 'medium')
      .reduce((acc, b) => acc + (b.session?.estimated_duration_min || 0), 0),
    low: completedBlocks
      .filter((b) => b.session?.cognitive_effort === 'low')
      .reduce((acc, b) => acc + (b.session?.estimated_duration_min || 0), 0),
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Header */}
      <div className="pb-3 border-b border-zinc-800">
        <h2 className="text-base font-bold text-zinc-100 font-mono flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          Métricas Operacionais & Fatores Humanos
        </h2>
        <p className="text-xs text-zinc-400 font-mono mt-0.5">
          Avaliação técnica de retenção, taxa de entrega de esforço e índice de fadiga.
        </p>
      </div>

      {/* Grid de KPIs Sóbrios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/80 space-y-1">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Taxa de Aderência
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {adherenceRate}%
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            {completedBlocks.length} de {totalBlocks} sessões concluídas
          </div>
        </div>

        <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/80 space-y-1">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Tempo Executado
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {Math.round((totalCompletedMinutes / 60) * 10) / 10}h
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            de {Math.round((totalPlannedMinutes / 60) * 10) / 10}h planejadas
          </div>
        </div>

        <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/80 space-y-1">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            Dificuldade Média
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {avgDifficulty} <span className="text-xs text-zinc-500">/ 5.0</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            {ratedSessions.length} sessões avaliadas
          </div>
        </div>
      </div>

      {/* Distribuição de Carga Cognitiva */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3">
        <h3 className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          Distribuição de Esforço Concluído
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
            <div className="text-[11px] font-mono text-rose-400">Deep Work (High)</div>
            <div className="text-lg font-bold font-mono text-zinc-200 mt-1">
              {effortMinutes.high} min
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
            <div className="text-[11px] font-mono text-blue-400">Prática (Medium)</div>
            <div className="text-lg font-bold font-mono text-zinc-200 mt-1">
              {effortMinutes.medium} min
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80">
            <div className="text-[11px] font-mono text-emerald-400">Revisão (Low)</div>
            <div className="text-lg font-bold font-mono text-zinc-200 mt-1">
              {effortMinutes.low} min
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
