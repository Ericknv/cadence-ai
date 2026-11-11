import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Brain,
  Star,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Calendar,
  MessageSquare,
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
  // 1. Filtragens e contagens
  const completedBlocks = blocks.filter((b) => b.session?.status === 'completed');
  const pendingBlocks = blocks.filter(
    (b) => b.session?.status === 'todo' || b.session?.status === 'in_progress'
  );
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
    totalBlocks > 0 ? Math.round((completedBlocks.length / totalBlocks) * 100) : 0;

  // Cálculo da Média Real de Dificuldade Percebida (1.0 a 5.0)
  const ratedBlocks = completedBlocks.filter(
    (b) =>
      typeof b.session?.perceived_difficulty === 'number' &&
      b.session.perceived_difficulty > 0
  );

  const avgDifficultyNum =
    ratedBlocks.length > 0
      ? ratedBlocks.reduce((acc, b) => acc + (b.session?.perceived_difficulty || 0), 0) /
        ratedBlocks.length
      : null;

  const avgDifficultyStr =
    avgDifficultyNum !== null ? avgDifficultyNum.toFixed(1) : 'N/A';

  const isHighFatigue = avgDifficultyNum !== null && avgDifficultyNum > 3.8;

  // 2. Mix de Carga Cognitiva
  const baseMinutesForMix = totalCompletedMinutes > 0 ? totalCompletedMinutes : totalPlannedMinutes;
  const targetBlocksForMix = totalCompletedMinutes > 0 ? completedBlocks : blocks;

  const effortMinutes = {
    high: targetBlocksForMix
      .filter((b) => b.session?.cognitive_effort === 'high')
      .reduce((acc, b) => acc + (b.session?.estimated_duration_min || 0), 0),
    medium: targetBlocksForMix
      .filter((b) => b.session?.cognitive_effort === 'medium')
      .reduce((acc, b) => acc + (b.session?.estimated_duration_min || 0), 0),
    low: targetBlocksForMix
      .filter((b) => b.session?.cognitive_effort === 'low')
      .reduce((acc, b) => acc + (b.session?.estimated_duration_min || 0), 0),
  };

  const highPct =
    baseMinutesForMix > 0 ? Math.round((effortMinutes.high / baseMinutesForMix) * 100) : 0;
  const mediumPct =
    baseMinutesForMix > 0 ? Math.round((effortMinutes.medium / baseMinutesForMix) * 100) : 0;
  const lowPct =
    baseMinutesForMix > 0 ? Math.max(0, 100 - highPct - mediumPct) : 0;

  // 3. Log Recente de Desempenho (Últimas 5 Sessões Concluídas)
  const recentCompleted = [...completedBlocks].slice(-5).reverse();

  return (
    <div className={`space-y-6 sm:space-y-8 ${className}`}>
      {/* Cabeçalho da Jornada */}
      <div className="pb-3 border-b border-white/5">
        <h2 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#7BDCB5]" />
          Jornada & Clareza Pessoal
        </h2>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          Acompanhamento da harmonia de rotina, energia cognitiva e consistência pessoal.
        </p>
      </div>

      {/* 1. Painel de KPIs Executivos com Vidro-Apple e Tipografia Monumental */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Aderência Global */}
        <div className="p-5 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] space-y-1.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#7BDCB5]" />
            Harmonia Global
          </div>
          <div className="text-3xl font-display font-bold text-[#7BDCB5]">
            {adherenceRate}%
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            {completedBlocks.length} de {totalBlocks} blocos concluídos
          </div>
        </div>

        {/* Carga Cumprida */}
        <div className="p-5 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] space-y-1.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            Tempo Dedicado
          </div>
          <div className="text-3xl font-display font-bold text-slate-100">
            {Math.round((totalCompletedMinutes / 60) * 10) / 10}h
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            de {Math.round((totalPlannedMinutes / 60) * 10) / 10}h planejadas
          </div>
        </div>

        {/* Dificuldade Média */}
        <div className="p-5 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] space-y-1.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-[#FDBA74]" />
            Intensidade Média
          </div>
          <div className="text-3xl font-display font-bold text-slate-100">
            {avgDifficultyStr} <span className="text-sm text-slate-500 font-normal">/ 5.0</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            {ratedBlocks.length} {ratedBlocks.length === 1 ? 'sessão avaliada' : 'sessões avaliadas'}
          </div>
        </div>

        {/* Saldo Operacional */}
        <div className="p-5 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] space-y-1.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#7DD3FC]" />
            Balanço de Sessões
          </div>
          <div className="text-3xl font-display font-bold text-slate-100">
            {completedBlocks.length}{' '}
            <span className="text-sm font-normal text-slate-500">/ {pendingBlocks.length}</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Concluídas vs. Pendentes
          </div>
        </div>
      </div>

      {/* 2. Indicador de Ritmo & Equilíbrio Pessoal (Calm System v2.0 - Sem pânico vermelho) */}
      {isHighFatigue ? (
        <div className="p-4 rounded-3xl border border-[#FDBA74]/30 bg-[#FDBA74]/10 text-xs font-mono text-[#FDBA74] space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-bold text-[#FDBA74]">
            <AlertTriangle className="w-4 h-4 text-[#FDBA74] shrink-0" />
            <span>Ponto de Respiro: Intensidade Percebida Alta ({avgDifficultyStr}/5.0)</span>
          </div>
          <p className="text-amber-100/80 leading-relaxed font-sans text-xs">
            As avaliações pós-estudo recentes indicam um nível de esforço mental elevado. Acesse a aba <strong>Harmonia</strong> e redistribua os blocos para recuperar a serenidade.
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-3xl border border-white/10 bg-white/[0.02] text-xs font-mono text-slate-400 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7BDCB5] shrink-0" />
            <span>Índice de Serenidade Estável: Ritmo sustentável e equilíbrio biológico preservado.</span>
          </div>
          <span className="text-[10px] text-slate-500 hidden sm:inline">Equilíbrio Ótimo (&lt; 3.8/5.0)</span>
        </div>
      )}

      {/* 3. Mix de Carga Cognitiva */}
      <section className="p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-[#569DAA]" />
              Mix de Carga Cognitiva ({totalCompletedMinutes > 0 ? 'Concluído' : 'Planejado'})
            </h3>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">
              Proporção de tempo dedicada a cada faixa de exigência mental.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total: <strong>{baseMinutesForMix} min</strong>
          </span>
        </div>

        {/* Barra Proporcional */}
        <div className="w-full h-3 rounded-full bg-black/40 border border-white/5 overflow-hidden flex">
          {effortMinutes.high > 0 && (
            <div
              style={{ width: `${highPct}%` }}
              className="h-full bg-[#FB7185] transition-all duration-300"
              title={`High (Deep Work): ${effortMinutes.high}m (${highPct}%)`}
            />
          )}
          {effortMinutes.medium > 0 && (
            <div
              style={{ width: `${mediumPct}%` }}
              className="h-full bg-sky-400 transition-all duration-300"
              title={`Medium (Prática): ${effortMinutes.medium}m (${mediumPct}%)`}
            />
          )}
          {effortMinutes.low > 0 && (
            <div
              style={{ width: `${lowPct}%` }}
              className="h-full bg-[#88C0A8] transition-all duration-300"
              title={`Low (Revisão): ${effortMinutes.low}m (${lowPct}%)`}
            />
          )}
        </div>

        {/* Subcards de Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#FB7185] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FB7185]" />
                High (Deep Work)
              </span>
              <span className="font-bold text-slate-200">{highPct}%</span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              {effortMinutes.high} min
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-sky-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                Medium (Prática)
              </span>
              <span className="font-bold text-slate-200">{mediumPct}%</span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              {effortMinutes.medium} min
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#88C0A8] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#88C0A8]" />
                Low (Revisão)
              </span>
              <span className="font-bold text-slate-200">{lowPct}%</span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              {effortMinutes.low} min
            </div>
          </div>
        </div>
      </section>

      {/* 4. Log Recente de Desempenho */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Log Recente de Desempenho (Últimos Check-ins)
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            {recentCompleted.length} {recentCompleted.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {recentCompleted.length === 0 ? (
          <div className="p-8 rounded-3xl border border-dashed border-white/10 text-center text-xs font-mono text-slate-500">
            Nenhuma sessão finalizada recentemente para exibição de histórico.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentCompleted.map((block) => {
              const diffRating = block.session.perceived_difficulty;
              const notes = block.session.notes;

              return (
                <div
                  key={block.id}
                  className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2 hover:border-white/20 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 shrink-0">
                        {block.track.category}
                      </span>
                      <h4 className="text-xs font-mono font-semibold text-slate-200 truncate">
                        {block.session.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-[11px] font-mono">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {block.target_date}
                      </span>
                      <span className="text-slate-400">
                        {block.session.estimated_duration_min}m
                      </span>

                      {typeof diffRating === 'number' && diffRating > 0 ? (
                        <div className="flex items-center gap-1 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400/30" />
                          <span>{diffRating}/5</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">Sem nota</span>
                      )}
                    </div>
                  </div>

                  {notes && notes.trim().length > 0 && (
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-slate-300 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <p className="font-sans leading-relaxed text-slate-300">
                        {notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
