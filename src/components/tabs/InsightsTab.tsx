import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Brain,
  Star,
  AlertTriangle,
  ShieldCheck,
  Layers,
  MessageSquare,
  Calendar,
  Activity,
  Flame,
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

  // 2. Mix de Carga Cognitiva (em minutos concluídos ou planejados)
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
    <div className={`space-y-6 ${className}`}>
      {/* Cabeçalho Técnico */}
      <div className="pb-3 border-b border-zinc-800">
        <h2 className="text-base font-bold text-zinc-100 font-mono flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          Métricas de Desempenho & Fatores Humanos
        </h2>
        <p className="text-xs text-zinc-400 font-mono mt-0.5">
          Diagnóstico de aderência da esteira, esforço cognitivo entregue e índice de fadiga percebida.
        </p>
      </div>

      {/* 1. Painel de KPIs Executivos Sóbrios (Top Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Taxa de Aderência Global */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/90 space-y-1.5">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Aderência Global
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {adherenceRate}%
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            {completedBlocks.length} de {totalBlocks} blocos concluídos
          </div>
        </div>

        {/* Carga Cumprida */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/90 space-y-1.5">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Carga Cumprida
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {Math.round((totalCompletedMinutes / 60) * 10) / 10}h
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            de {Math.round((totalPlannedMinutes / 60) * 10) / 10}h totais planejadas
          </div>
        </div>

        {/* Fator Médio de Dificuldade */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/90 space-y-1.5">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            Dificuldade Média
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {avgDifficultyStr} <span className="text-xs text-zinc-500 font-normal">/ 5.0</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            {ratedBlocks.length} {ratedBlocks.length === 1 ? 'sessão avaliada' : 'sessões avaliadas'}
          </div>
        </div>

        {/* Saldo de Sessões */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/90 space-y-1.5">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            Saldo Operacional
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {completedBlocks.length} <span className="text-sm font-normal text-zinc-500">/ {pendingBlocks.length}</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            Concluídas vs. Pendentes
          </div>
        </div>
      </div>

      {/* 2. Indicador de Fadiga & Alerta Preventivo de Burnout */}
      {isHighFatigue ? (
        <div className="p-4 rounded-xl border border-rose-600/40 bg-rose-950/20 text-xs font-mono text-rose-300 space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Alerta de Sobrecarga Mental: Dificuldade Média Crítica ({avgDifficultyStr}/5.0)</span>
          </div>
          <p className="text-rose-200/80 leading-relaxed font-sans text-xs">
            As avaliações pós-estudo recentes indicam um nível de esforço mental substancialmente acima do limiar sustentável. Recomendamos acessar a aba <strong>Planejamento</strong> e aplicar o preset de <em>"Semana de Provas"</em> ou reduzir os limites diários para proteger seu foco e evitar burnout.
          </p>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs font-mono text-zinc-400 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Índice de Fadiga Estável: Carga balanceada dentro dos parâmetros fisiológicos do PCP.</span>
          </div>
          <span className="text-[10px] text-zinc-500 hidden sm:inline">Normal (&lt; 3.8/5.0)</span>
        </div>
      )}

      {/* 3. Mix de Carga Cognitiva (Distribuição do Esforço) */}
      <section className="p-4 sm:p-5 rounded-xl border border-zinc-800 bg-zinc-900/70 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-mono font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-blue-400" />
              Mix de Carga Cognitiva ({totalCompletedMinutes > 0 ? 'Concluído' : 'Planejado'})
            </h3>
            <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
              Proporção de tempo dedicada a cada faixa de exigência mental.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Total: <strong>{baseMinutesForMix} min</strong>
          </span>
        </div>

        {/* Barra Proporcional Minimalista */}
        <div className="w-full h-3 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden flex">
          {effortMinutes.high > 0 && (
            <div
              style={{ width: `${highPct}%` }}
              className="h-full bg-rose-500/80 transition-all duration-300"
              title={`High (Deep Work): ${effortMinutes.high}m (${highPct}%)`}
            />
          )}
          {effortMinutes.medium > 0 && (
            <div
              style={{ width: `${mediumPct}%` }}
              className="h-full bg-blue-500/80 transition-all duration-300"
              title={`Medium (Prática): ${effortMinutes.medium}m (${mediumPct}%)`}
            />
          )}
          {effortMinutes.low > 0 && (
            <div
              style={{ width: `${lowPct}%` }}
              className="h-full bg-emerald-500/80 transition-all duration-300"
              title={`Low (Revisão): ${effortMinutes.low}m (${lowPct}%)`}
            />
          )}
        </div>

        {/* Subcards de Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-rose-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                High (Deep Work)
              </span>
              <span className="font-bold text-zinc-300">{highPct}%</span>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              {effortMinutes.high} min
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-blue-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500/80" />
                Medium (Prática)
              </span>
              <span className="font-bold text-zinc-300">{mediumPct}%</span>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              {effortMinutes.medium} min
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                Low (Revisão)
              </span>
              <span className="font-bold text-zinc-300">{lowPct}%</span>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              {effortMinutes.low} min
            </div>
          </div>
        </div>
      </section>

      {/* 4. Log Recente de Desempenho (Últimos Check-ins) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            Log Recente de Desempenho (Últimos Check-ins)
          </h3>
          <span className="text-[11px] font-mono text-zinc-500">
            {recentCompleted.length} {recentCompleted.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {recentCompleted.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center text-xs font-mono text-zinc-500">
            Nenhuma sessão finalizada recentemente para exibição de histórico.
          </div>
        ) : (
          <div className="space-y-2">
            {recentCompleted.map((block) => {
              const diffRating = block.session.perceived_difficulty;
              const notes = block.session.notes;

              return (
                <div
                  key={block.id}
                  className="p-3 sm:p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/80 space-y-2 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 shrink-0">
                        {block.track.category}
                      </span>
                      <h4 className="text-xs font-mono font-semibold text-zinc-200 truncate">
                        {block.session.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-[11px] font-mono">
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {block.target_date}
                      </span>
                      <span className="text-zinc-400">
                        {block.session.estimated_duration_min}m
                      </span>

                      {/* Dificuldade Percebida (Dots/Rating) */}
                      {typeof diffRating === 'number' && diffRating > 0 ? (
                        <div className="flex items-center gap-1 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400/30" />
                          <span>{diffRating}/5</span>
                        </div>
                      ) : (
                        <span className="text-zinc-600">Sem nota</span>
                      )}
                    </div>
                  </div>

                  {/* Notas de Estudo Registradas */}
                  {notes && notes.trim().length > 0 && (
                    <div className="p-2.5 rounded bg-zinc-950/70 border border-zinc-800/60 text-[11px] font-mono text-zinc-300 flex items-start gap-2">
                      <MessageSquare className="w-3 h-3 text-zinc-500 shrink-0 mt-0.5" />
                      <p className="font-sans leading-relaxed text-zinc-300">
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
