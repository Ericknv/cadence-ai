import React, { useState } from 'react';
import {
  X,
  Scale,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Loader2,
  CalendarDays,
} from 'lucide-react';
import {
  EnrichedScheduleBlock,
  TargetPeriod,
  PriorityRank,
} from '../../types/study';
import {
  DayCapacity,
  RebalancePendingSession,
  ScheduleRebalanceResponse,
  BurnoutRisk,
  rebalanceSchedule,
} from '../../services/rebalanceService';

interface RebalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBlocks: EnrichedScheduleBlock[];
  onApplyRebalancedSchedule: (newBlocks: EnrichedScheduleBlock[]) => void;
}

// Gera os próximos 7 dias úteis do ciclo a partir de hoje
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

export const RebalanceModal: React.FC<RebalanceModalProps> = ({
  isOpen,
  onClose,
  currentBlocks,
  onApplyRebalancedSchedule,
}) => {
  const [days, setDays] = useState<DayCapacity[]>(generateNext7Days());
  const [activePreset, setActivePreset] = useState<'normal' | 'provas' | 'intensivo'>('normal');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rebalanceResult, setRebalanceResult] = useState<ScheduleRebalanceResponse | null>(null);

  if (!isOpen) return null;

  // Presets Rápidos de Rotina
  const applyPreset = (preset: 'normal' | 'provas' | 'intensivo') => {
    setActivePreset(preset);
    setDays((prev) =>
      prev.map((d, idx) => {
        const isWeekend = idx >= 5; // Aproximação de fim de ciclo ou sábado/domingo
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

  const handleMinutesChange = (index: number, minutes: number) => {
    setDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, available_minutes: Math.max(0, minutes) } : d))
    );
  };

  const togglePeriod = (dayIndex: number, period: TargetPeriod) => {
    setDays((prev) =>
      prev.map((d, i) => {
        if (i !== dayIndex) return d;
        const exists = d.preferred_periods.includes(period);
        const updated = exists
          ? d.preferred_periods.filter((p) => p !== period)
          : [...d.preferred_periods, period];
        return {
          ...d,
          preferred_periods: updated.length > 0 ? updated : ['evening'],
        };
      })
    );
  };

  // Executa o rebalanceamento via API
  const handleRunRebalance = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Coletar todas as sessões pendentes ou em andamento
      const pending: RebalancePendingSession[] = currentBlocks
        .filter((b) => b.session.status !== 'completed')
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
      console.error('[RebalanceModal Error]:', err);
      const rawMsg = err instanceof Error ? err.message : '';
      const isHighDemand =
        rawMsg.toLowerCase().includes('high demand') ||
        rawMsg.toLowerCase().includes('alta demanda') ||
        rawMsg.toLowerCase().includes('503') ||
        rawMsg.toLowerCase().includes('unavailable') ||
        rawMsg.toLowerCase().includes('resource_exhausted') ||
        rawMsg.toLowerCase().includes('overloaded');

      if (isHighDemand) {
        setErrorMessage(
          'A IA está com alta demanda momentânea nos servidores da Google. Tentando novamente em instantes...'
        );
      } else {
        setErrorMessage(
          rawMsg || 'Falha inesperada ao executar rebalanceamento.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Aplica o cronograma rebalanceado
  const handleApply = () => {
    if (!rebalanceResult) return;

    // Preservar sessões concluídas
    const completedBlocks = currentBlocks.filter((b) => b.session.status === 'completed');

    // Mapear novos blocos alocados
    const newAllocatedBlocks: EnrichedScheduleBlock[] = rebalanceResult.allocated_blocks.map(
      (alloc, idx) => {
        const originalBlock = currentBlocks.find((b) => b.session.id === alloc.session_id);
        const blockId = originalBlock
          ? originalBlock.id
          : crypto.randomUUID
          ? crypto.randomUUID()
          : `blk_reb_${Date.now()}_${idx}`;

        const session = originalBlock ? originalBlock.session : currentBlocks[0].session;
        const track = originalBlock ? originalBlock.track : currentBlocks[0].track;

        return {
          id: blockId,
          user_id: session.user_id,
          session_id: alloc.session_id,
          target_date: alloc.target_date,
          target_period: alloc.target_period,
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
    onClose();
  };

  const totalWeeklyCapacity = days.reduce((acc, d) => acc + d.available_minutes, 0);
  const totalPendingMinutes = currentBlocks
    .filter((b) => b.session.status !== 'completed')
    .reduce((acc, b) => acc + b.session.estimated_duration_min, 0);

  const riskBadgeConfig: Record<
    BurnoutRisk,
    { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    low: {
      label: 'Risco de Burnout Baixo',
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-300',
      border: 'border-emerald-600/60',
      icon: ShieldCheck,
    },
    moderate: {
      label: 'Risco Moderado (Atenção)',
      bg: 'bg-amber-950/60',
      text: 'text-amber-300',
      border: 'border-amber-600/60',
      icon: AlertTriangle,
    },
    critical: {
      label: 'Risco Crítico de Sobrecarga',
      bg: 'bg-rose-950/60',
      text: 'text-rose-300',
      border: 'border-rose-600/60',
      icon: ShieldAlert,
    },
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-750 rounded-xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header do Modal */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                Rebalanceador Semanal & Proteção contra Burnout
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800">
                  Harmonia Engine • Gemini 3.8
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Ajuste harmônico de capacidade e bem-estar para equilibrar seus blocos de foco
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Resumo de Demanda vs Capacidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Demanda Pendente:</span>
              <span className="text-white font-bold">{totalPendingMinutes} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Capacidade Semanal Configurada:</span>
              <span className="text-blue-400 font-bold">{totalWeeklyCapacity} min</span>
            </div>
          </div>

          {/* Presets Rápidos de Rotina */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-zinc-500" />
              <span>Presets de Rotina Operacional</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'normal',
                  title: 'Semana Normal',
                  desc: 'Estágio + Faculdade (90m seg-sex, 180m fim de semana)',
                },
                {
                  id: 'provas',
                  title: 'Semana de Provas',
                  desc: 'Carga reduzida (45m seg-sex, 90m fim de semana)',
                },
                {
                  id: 'intensivo',
                  title: 'Fim de Semana Intensivo',
                  desc: 'Dias úteis leves (60m), sprint no fim de semana (240m)',
                },
              ].map((pst) => (
                <button
                  key={pst.id}
                  type="button"
                  onClick={() => applyPreset(pst.id as any)}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                    activePreset === pst.id
                      ? 'bg-indigo-950/50 border-indigo-500/70 text-indigo-200'
                      : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-semibold text-zinc-200 mb-0.5">{pst.title}</div>
                  <div className="text-[10px] leading-tight text-zinc-500 font-mono">
                    {pst.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuração Dia a Dia (7 Dias) */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Disponibilidade Diária (7 Dias do Ciclo)</span>
              <span className="text-zinc-500 text-[10px]">Minutos e turnos de preferência</span>
            </div>

            <div className="space-y-2">
              {days.map((day, idx) => (
                <div
                  key={day.date}
                  className="p-2.5 rounded-lg bg-zinc-950/50 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  {/* Data e Nome */}
                  <div className="w-28 shrink-0 font-mono">
                    <div className="font-semibold text-zinc-200">{day.day_name}</div>
                    <div className="text-[10px] text-zinc-500">{day.date}</div>
                  </div>

                  {/* Input de Minutos e Slider */}
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="300"
                      step="15"
                      value={day.available_minutes}
                      onChange={(e) => handleMinutesChange(idx, parseInt(e.target.value, 10))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <div className="w-16 text-right font-mono font-bold text-zinc-200">
                      {day.available_minutes}m
                    </div>
                  </div>

                  {/* Turnos Preferidos */}
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    {(['morning', 'afternoon', 'evening', 'night'] as TargetPeriod[]).map((p) => {
                      const isSelected = day.preferred_periods.includes(p);
                      const labels: Record<TargetPeriod, string> = {
                        morning: 'Manhã',
                        afternoon: 'Tarde',
                        evening: 'Noite',
                        night: 'Madruga',
                      };
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => togglePeriod(idx, p)}
                          className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-950/80 text-blue-300 border-blue-600/70'
                              : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                          }`}
                        >
                          {labels[p]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Painel de Resultados Pós-Execução */}
          {rebalanceResult && (
            <div className="rounded-xl border border-indigo-500/50 bg-indigo-950/20 p-4 space-y-3.5 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-indigo-900/40">
                <div className="flex items-center gap-2">
                  {(() => {
                    const cfg = riskBadgeConfig[rebalanceResult.burnout_risk];
                    const Icon = cfg.icon;
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{cfg.label}</span>
                      </span>
                    );
                  })()}
                </div>
                <div className="text-xs font-mono text-zinc-300">
                  <span className="text-emerald-400 font-bold">
                    {rebalanceResult.allocated_blocks.length}
                  </span>{' '}
                  sessões alocadas •{' '}
                  <span className="text-amber-400 font-bold">
                    {rebalanceResult.deferred_session_ids.length}
                  </span>{' '}
                  adiadas
                </div>
              </div>

              {/* Diagnóstico Executivo da IA */}
              <div className="text-xs text-zinc-200 leading-relaxed font-sans bg-zinc-900/80 p-3 rounded-lg border border-zinc-800">
                <span className="font-semibold text-indigo-300 font-mono mr-1.5">
                  Diagnóstico de Harmonia:
                </span>
                {rebalanceResult.diagnosis}
              </div>

              {/* Lista Resumida das Sessões Alocadas */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  Prévia do Novo Cronograma:
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
                  {rebalanceResult.allocated_blocks.map((alloc, i) => {
                    const s = currentBlocks.find((b) => b.session.id === alloc.session_id);
                    return (
                      <div
                        key={i}
                        className="p-2 rounded bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-2"
                      >
                        <div className="truncate text-zinc-200">
                          <span className="text-blue-400 font-semibold mr-1.5">
                            [{alloc.target_date} • {alloc.target_period}]
                          </span>
                          {s?.session.title || 'Sessão de Estudo'}
                        </div>
                        <span className="shrink-0 text-zinc-400 text-[10px]">
                          P{alloc.priority_rank}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Alerta de Sessões Postergadas */}
              {rebalanceResult.deferred_session_ids.length > 0 && (
                <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">
                      {rebalanceResult.deferred_session_ids.length} sessão(ões) postergada(s)
                    </span>{' '}
                    para respeitar o teto de capacidade e prevenir burnout cognitivo.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer com Ações */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            {!rebalanceResult ? (
              <button
                type="button"
                onClick={handleRunRebalance}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Calculando Harmonia da Semana...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Calcular Rebalanceamento com IA</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Aplicar Novo Cronograma</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
