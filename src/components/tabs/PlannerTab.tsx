import React, { useState } from 'react';
import {
  Scale,
  Brain,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Sparkles,
  Plus,
  Minus,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  Sliders,
  CalendarDays,
  Calendar,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import {
  EnrichedScheduleBlock,
  PriorityRank,
  TargetPeriod,
} from '../../types/study';
import {
  DayCapacity,
  rebalanceSchedule,
  RebalancePendingSession,
  ScheduleRebalanceResponse,
  BurnoutRisk,
} from '../../services/rebalanceService';

interface PlannerTabProps {
  blocks: EnrichedScheduleBlock[];
  onApplyRebalancedSchedule?: (newBlocks: EnrichedScheduleBlock[]) => void;
  onOpenRebalanceModal?: () => void;
  className?: string;
}

// Gera os próximos 7 dias a partir de hoje
const generateNext7Days = (): DayCapacity[] => {
  const days: DayCapacity[] = [];
  const dayNamesPt = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    days.push({
      date: dateStr,
      day_name: i === 0 ? 'Hoje' : dayNamesPt[dayOfWeek],
      available_minutes: isWeekend ? 180 : 90,
      preferred_periods: isWeekend ? ['morning', 'afternoon'] : ['evening'],
    });
  }
  return days;
};

export const PlannerTab: React.FC<PlannerTabProps> = ({
  blocks,
  onApplyRebalancedSchedule,
  className = '',
}) => {
  const [days, setDays] = useState<DayCapacity[]>(generateNext7Days);
  const [activePreset, setActivePreset] = useState<'normal' | 'provas' | 'intensivo'>('normal');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rebalanceResult, setRebalanceResult] = useState<ScheduleRebalanceResponse | null>(null);

  // Progressive Disclosure toggles
  const [showAllocatedDetails, setShowAllocatedDetails] = useState<boolean>(true);
  const [showDeferredDetails, setShowDeferredDetails] = useState<boolean>(false);

  // Presets Rápidos de 1-Clique
  const applyPreset = (preset: 'normal' | 'provas' | 'intensivo') => {
    setActivePreset(preset);
    setDays((prev) =>
      prev.map((d) => {
        const parts = d.date.split('-');
        const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const dayOfWeek = dateObj.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        if (preset === 'normal') {
          return {
            ...d,
            available_minutes: isWeekend ? 180 : 90,
            preferred_periods: isWeekend ? ['morning', 'afternoon'] : ['evening'],
          };
        }
        if (preset === 'provas') {
          return {
            ...d,
            available_minutes: isWeekend ? 90 : 45,
            preferred_periods: ['evening'],
          };
        }
        // intensivo
        return {
          ...d,
          available_minutes: isWeekend ? 240 : 60,
          preferred_periods: isWeekend ? ['morning', 'afternoon', 'evening'] : ['evening'],
        };
      })
    );
  };

  // Ajuste fino inline de minutos (-/+ 15 min, limite 0 a 300)
  const adjustMinutes = (index: number, delta: number) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== index) return d;
        const updated = Math.min(300, Math.max(0, d.available_minutes + delta));
        return { ...d, available_minutes: updated };
      })
    );
  };

  // Executa o motor de rebalanceamento via API
  const handleExecuteRebalance = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const pending: RebalancePendingSession[] = blocks
        .filter((b) => b.session.status !== 'completed' && b.session.status !== 'skipped')
        .map((b) => ({
          id: b.session.id,
          title: b.session.title,
          session_type: b.session.session_type,
          estimated_duration_min: b.session.estimated_duration_min,
          cognitive_effort: b.session.cognitive_effort,
          track_title: b.track.title,
          is_delayed: b.is_rescheduled,
        }));

      if (pending.length === 0) {
        throw new Error('Não há sessões pendentes no momento para rebalancear.');
      }

      const result = await rebalanceSchedule(pending, days);
      setRebalanceResult(result);
    } catch (err: unknown) {
      console.error('[PlannerTab Rebalance Error]:', err);
      const rawMsg = err instanceof Error ? err.message : '';
      const isHighDemand =
        rawMsg.toLowerCase().includes('high demand') ||
        rawMsg.toLowerCase().includes('alta demanda') ||
        rawMsg.toLowerCase().includes('503') ||
        rawMsg.toLowerCase().includes('temporarily unavailable') ||
        rawMsg.toLowerCase().includes('resource_exhausted');

      if (isHighDemand) {
        setErrorMessage(
          'A IA está com alta demanda momentânea nos servidores da Google. Tentando novamente em instantes...'
        );
      } else {
        setErrorMessage(rawMsg || 'Falha ao rebalancear cronograma semanal com Gemini.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmação e aplicação do cronograma rebalanceado
  const handleConfirmAndApply = () => {
    if (!rebalanceResult || !onApplyRebalancedSchedule) return;

    // Preserva blocos concluídos
    const completedBlocks = blocks.filter((b) => b.session.status === 'completed');

    // Mapeia blocos alocados pela IA
    const newAllocatedBlocks: EnrichedScheduleBlock[] = rebalanceResult.allocated_blocks.map(
      (alloc, idx) => {
        const originalBlock = blocks.find((b) => b.session.id === alloc.session_id);
        const blockId = originalBlock
          ? originalBlock.id
          : `blk_reb_${Date.now()}_${idx}`;

        const session = originalBlock ? originalBlock.session : blocks[0].session;
        const track = originalBlock ? originalBlock.track : blocks[0].track;

        return {
          id: blockId,
          user_id: session.user_id,
          session_id: alloc.session_id,
          target_date: alloc.target_date,
          target_period: alloc.target_period as TargetPeriod,
          priority_rank: alloc.priority_rank as PriorityRank,
          ai_justification: alloc.justification,
          is_rescheduled: true,
          created_at: new Date().toISOString(),
          session,
          track,
        };
      }
    );

    const merged = [...completedBlocks, ...newAllocatedBlocks];
    onApplyRebalancedSchedule(merged);
    setSuccessMessage('Cronograma semanal sincronizado com sucesso!');
    setRebalanceResult(null);
  };

  // Cálculos de capacidade total semanal
  const totalWeeklyCapacity = days.reduce((acc, d) => acc + d.available_minutes, 0);
  const pendingSessions = blocks.filter(
    (b) => b.session.status !== 'completed' && b.session.status !== 'skipped'
  );
  const totalPendingMinutes = pendingSessions.reduce(
    (acc, b) => acc + (b.session.estimated_duration_min || 0),
    0
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Header & Presets Rápidos de 1-Clique */}
      <section className="p-4 sm:p-5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold font-mono text-zinc-100 uppercase tracking-wider">
                Matriz de Capacidade & Planejamento Semanal (PCP)
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Defina os minutos disponíveis em cada dia para despacho inteligente de carga.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
            <span>
              Capacidade: <strong className="text-zinc-200">{Math.round((totalWeeklyCapacity / 60) * 10) / 10}h</strong>
            </span>
            <span>•</span>
            <span>
              Demanda: <strong className="text-zinc-200">{Math.round((totalPendingMinutes / 60) * 10) / 10}h</strong>
            </span>
          </div>
        </div>

        {/* Botões de Presets Rápidos */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3 h-3 text-zinc-400" />
            Presets Rápidos de Rotina
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                id: 'normal',
                title: 'Semana Normal (Estágio + UFAM)',
                desc: 'Seg-Sex: 90m | Sáb-Dom: 180m',
              },
              {
                id: 'provas',
                title: 'Semana de Provas',
                desc: 'Seg-Sex: 45m | Sáb-Dom: 90m',
              },
              {
                id: 'intensivo',
                title: 'Fim de Semana Intensivo',
                desc: 'Seg-Sex: 60m | Sáb-Dom: 240m',
              },
            ].map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id as any)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer font-mono ${
                    isSelected
                      ? 'bg-zinc-800 border-zinc-600 text-zinc-100 shadow-xs'
                      : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="text-xs font-semibold">{preset.title}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{preset.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Matriz Semanal Interativa de Capacidade (7 Dias) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
            Capacidade Diária vs. Alocação Atual
          </h3>
          <span className="text-[11px] font-mono text-zinc-500">
            Ajustes em passos de 15 min (0 a 300 min)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
          {days.map((d, idx) => {
            // Minutos atualmente alocados no dia
            const allocatedBlocks = blocks.filter(
              (b) => b.target_date === d.date && b.session.status !== 'skipped'
            );
            const allocatedMinutes = allocatedBlocks.reduce(
              (acc, b) => acc + (b.session.estimated_duration_min || 0),
              0
            );

            // Cálculo da taxa de saturação
            const isOverloaded = d.available_minutes > 0 && allocatedMinutes > d.available_minutes;
            const isIdeal =
              d.available_minutes > 0 &&
              allocatedMinutes > 0 &&
              allocatedMinutes <= d.available_minutes;
            const saturationPct =
              d.available_minutes > 0
                ? Math.round((allocatedMinutes / d.available_minutes) * 100)
                : allocatedMinutes > 0
                ? 999
                : 0;

            // Cores de saturação sutis
            const cardBorderColor = isOverloaded
              ? 'border-rose-500/60 bg-rose-950/10'
              : isIdeal
              ? 'border-emerald-500/40 bg-zinc-900/90'
              : 'border-zinc-800 bg-zinc-900/60';

            return (
              <div
                key={d.date}
                className={`p-3 rounded-lg border ${cardBorderColor} flex flex-col justify-between space-y-3 transition-colors`}
              >
                {/* Top do Card: Data e Dia */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-zinc-200">
                      {d.day_name}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {d.date.slice(5)}
                    </span>
                  </div>

                  {/* Saturação */}
                  <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-zinc-500">Alocado:</span>
                    <span
                      className={`font-semibold ${
                        isOverloaded
                          ? 'text-rose-400'
                          : isIdeal
                          ? 'text-emerald-400'
                          : 'text-zinc-400'
                      }`}
                    >
                      {allocatedMinutes}m ({saturationPct}%)
                    </span>
                  </div>
                </div>

                {/* Controle Numérico Inline (- / +) */}
                <div className="pt-2 border-t border-zinc-800/60">
                  <div className="text-[10px] font-mono text-zinc-500 mb-1 flex items-center justify-between">
                    <span>Disponível:</span>
                    <span className="font-bold text-zinc-200">{d.available_minutes}m</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => adjustMinutes(idx, -15)}
                      disabled={d.available_minutes <= 0}
                      aria-label="Diminuir 15 minutos"
                      className="flex-1 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustMinutes(idx, 15)}
                      disabled={d.available_minutes >= 300}
                      aria-label="Aumentar 15 minutos"
                      className="flex-1 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Ação Principal de Rebalanceamento */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="text-xs font-mono text-zinc-500">
          {pendingSessions.length} sessões aguardando otimização na esteira.
        </div>

        <button
          type="button"
          onClick={handleExecuteRebalance}
          disabled={isLoading || pendingSessions.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white shadow-xs transition-colors cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Calculando Balanço de PCP...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              Executar Rebalanceamento com IA
            </>
          )}
        </button>
      </div>

      {/* Mensagens de Feedback */}
      {errorMessage && (
        <div className="rounded-lg bg-rose-950/40 border border-rose-600/50 p-3 text-xs font-mono text-rose-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-emerald-950/40 border border-emerald-600/50 p-3 text-xs font-mono text-emerald-300 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 4. Painel Integrado de Resultados (Progressive Disclosure) */}
      {rebalanceResult && (
        <section className="rounded-xl border border-zinc-700 bg-zinc-900/90 p-4 sm:p-5 space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold font-mono text-zinc-100">
                Plano Semanal Otimizado (Gemini Engine)
              </h3>
            </div>

            {/* Badge Minimalista de Risco de Burnout */}
            {(() => {
              const risk = rebalanceResult.burnout_risk;
              const config =
                risk === 'low'
                  ? {
                      label: 'Risco Baixo',
                      bg: 'bg-emerald-950/60',
                      text: 'text-emerald-400',
                      border: 'border-emerald-600/40',
                      icon: ShieldCheck,
                    }
                  : risk === 'moderate'
                  ? {
                      label: 'Risco Moderado',
                      bg: 'bg-amber-950/60',
                      text: 'text-amber-400',
                      border: 'border-amber-600/40',
                      icon: AlertTriangle,
                    }
                  : {
                      label: 'Risco Crítico (Sobrecarga)',
                      bg: 'bg-rose-950/60',
                      text: 'text-rose-400',
                      border: 'border-rose-600/40',
                      icon: ShieldAlert,
                    };

              const Icon = config.icon;
              return (
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${config.bg} ${config.text} ${config.border}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{config.label}</span>
                </div>
              );
            })()}
          </div>

          {/* Diagnóstico Executivo da IA */}
          <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs font-mono text-zinc-300 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1">
              <Brain className="w-3 h-3 text-zinc-400" />
              Parecer Técnico de PCP:
            </span>
            <p className="leading-relaxed">{rebalanceResult.diagnosis}</p>
          </div>

          {/* Lista de Blocos Sugeridos (Accordion) */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowAllocatedDetails((prev) => !prev)}
              className="w-full flex items-center justify-between text-xs font-mono font-semibold text-zinc-300 py-1 cursor-pointer hover:text-zinc-100"
            >
              <span>
                Blocos Alocados ({rebalanceResult.allocated_blocks.length})
              </span>
              {showAllocatedDetails ? (
                <ChevronUp className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              )}
            </button>

            {showAllocatedDetails && (
              <div className="space-y-2 pt-1">
                {rebalanceResult.allocated_blocks.map((block) => {
                  const original = blocks.find((b) => b.session.id === block.session_id);
                  const title = original ? original.session.title : block.session_id;

                  const periodLabels: Record<TargetPeriod, string> = {
                    morning: 'Manhã',
                    afternoon: 'Tarde',
                    evening: 'Noite',
                    night: 'Madrugada',
                  };

                  return (
                    <div
                      key={block.session_id}
                      className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/60 text-xs font-mono space-y-1"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-semibold text-zinc-200">{title}</span>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                            {block.target_date}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-blue-400">
                            {periodLabels[block.target_period]}
                          </span>
                          <span className="text-zinc-500">P{block.priority_rank}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400">{block.justification}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seção Discreta: Sessões Diferidas / Postergadas */}
          {rebalanceResult.deferred_session_ids.length > 0 && (
            <div className="p-3.5 rounded-lg border border-amber-600/30 bg-amber-950/10 space-y-2">
              <button
                type="button"
                onClick={() => setShowDeferredDetails((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs font-mono font-semibold text-amber-300 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Sessões Postergadas / Diferidas ({rebalanceResult.deferred_session_ids.length})
                  </span>
                </div>
                {showDeferredDetails ? (
                  <ChevronUp className="w-4 h-4 text-amber-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-amber-400" />
                )}
              </button>

              <p className="text-[11px] font-mono text-zinc-400">
                Estas sessões foram postergadas para a próxima sprint para proteger sua capacidade e prevenir burnout.
              </p>

              {showDeferredDetails && (
                <ul className="space-y-1 pt-1 border-t border-amber-600/20">
                  {rebalanceResult.deferred_session_ids.map((id) => {
                    const original = blocks.find((b) => b.session.id === id);
                    return (
                      <li
                        key={id}
                        className="text-xs font-mono text-zinc-300 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {original ? original.session.title : id}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* Botão de Confirmação e Atualização */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setRebalanceResult(null)}
              className="px-3 py-1.5 rounded text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Descartar Proposta
            </button>
            <button
              type="button"
              onClick={handleConfirmAndApply}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Confirmar e Atualizar Cronograma
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
