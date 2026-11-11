import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Brain,
  Layers,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  StudyTrack,
  StudySession,
  EnrichedScheduleBlock,
  TargetPeriod,
  PriorityRank,
} from '../../types/study';
import { decomposeStudyTopic } from '../../services/geminiService';
import { TODAY_DATE } from '../../mocks/study-data';
import { CadenceLogo } from '../brand/CadenceLogo';

interface CreateTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onTrackCreated: (newBlocks: EnrichedScheduleBlock[], newTrack: StudyTrack) => void;
}

const CATEGORIES = [
  'Engenharia de Produção',
  'Pesquisa Operacional & Otimização',
  'Software & TI',
  'Ciência de Dados & IA',
  'Matemática Aplicada & Física',
  'Gestão & Finanças',
  'Idiomas & Comunicação',
];

const COLOR_OPTIONS = [
  { label: 'Sálvia Esmeralda', hex: '#88C0A8' },
  { label: 'Azul Ciano', hex: '#569DAA' },
  { label: 'Coral Deep Work', hex: '#FB7185' },
  { label: 'Cinza Titânio', hex: '#A0AEC0' },
  { label: 'Sky Blue', hex: '#0284c7' },
  { label: 'Âmbar Dourado', hex: '#d97706' },
];

const PRESET_TEMPLATES = [
  {
    title: 'Pesquisa Operacional I (UFAM)',
    category: 'Pesquisa Operacional & Otimização',
    text: `Modelagem de Programação Linear, formulação canônica de maximização e minimização, Algoritmo Simplex primal matricial, Teoria da Dualidade, folgas complementares e análise de sensibilidade pós-ótima.`,
  },
  {
    title: 'Controle Estatístico de Processos (CEP)',
    category: 'Engenharia de Produção',
    text: `Capacidade de processo (Cp e Cpk), construção de gráficos de controle por variáveis (X-barra e R) e por atributos (p e c). Regras de Shewhart para causas especiais e análise de repetibilidade e reprodutibilidade (R&R Gauge).`,
  },
  {
    title: 'Arquitetura de Microsserviços & Event-Driven',
    category: 'Software & TI',
    text: `Padrões de decomposição de monólitos, transações distribuídas (Saga Pattern), Event-Driven Architecture com Apache Kafka, idempotência de consumers e estratégias de observabilidade com OpenTelemetry.`,
  },
];

const PIPELINE_STEPS = [
  {
    label: 'Analisando ementa e estrutura conceitual...',
    sub: 'Varredura sintática e semântica de tópicos com Gemini 3.8 Flash',
  },
  {
    label: 'Calculando densidade cognitiva e fatores humanos...',
    sub: 'Taxonomia de esforço mental: Deep Work, Prática ou Revisão',
  },
  {
    label: 'Fatiando em blocos atômicos de 30 a 60 min...',
    sub: 'Decomposição pedagógica sem fadiga decisória com metas atômicas',
  },
  {
    label: 'Balanceando agenda semanal com teto RCCP...',
    sub: 'Alocação rítmica nos turnos respeitando capacidade fisiológica',
  },
];

export const CreateTrackModal: React.FC<CreateTrackModalProps> = ({
  isOpen,
  onClose,
  userId = 'usr_guest',
  onTrackCreated,
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_OPTIONS[0].hex);
  const [userLevel, setUserLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Intermediário');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pipeline sequencial de telemetria durante o loading da IA
  useEffect(() => {
    if (!isLoading) {
      setCurrentStepIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < PIPELINE_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);

    return () => clearInterval(timer);
  }, [isLoading]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setErrorMessage('Por favor, informe a ementa ou tópicos da trilha.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await decomposeStudyTopic(rawText, category, userLevel);

      const trackId = crypto.randomUUID ? crypto.randomUUID() : `trk_${Date.now()}`;

      const newTrack: StudyTrack = {
        id: trackId,
        user_id: userId,
        title: result.track_title,
        category,
        overview: result.overview,
        color_hex: selectedColor,
        is_archived: false,
        created_at: new Date().toISOString(),
      };

      const periodsSequence: TargetPeriod[] = ['morning', 'afternoon', 'evening', 'night'];

      const createdBlocks: EnrichedScheduleBlock[] = result.sessions.map((sess, idx) => {
        const sessionId = crypto.randomUUID ? crypto.randomUUID() : `ses_${Date.now()}_${idx}`;
        const blockId = crypto.randomUUID ? crypto.randomUUID() : `blk_${Date.now()}_${idx}`;

        const studySession: StudySession = {
          id: sessionId,
          track_id: trackId,
          user_id: userId,
          sequence_order: idx + 1,
          title: sess.title,
          session_type: sess.session_type,
          estimated_duration_min: sess.estimated_duration_min,
          cognitive_effort: sess.cognitive_effort,
          learning_goals: sess.learning_goals,
          recommended_approach: sess.recommended_approach,
          status: 'todo',
          created_at: new Date().toISOString(),
        };

        let targetPeriod: TargetPeriod;
        if (sess.cognitive_effort === 'high') {
          targetPeriod = 'morning';
        } else if (sess.cognitive_effort === 'medium') {
          targetPeriod = 'afternoon';
        } else {
          targetPeriod = 'evening';
        }

        if (idx > 0 && idx < periodsSequence.length) {
          targetPeriod = periodsSequence[idx % periodsSequence.length];
        }

        const priorityRank: PriorityRank =
          sess.cognitive_effort === 'high' ? 5 : sess.cognitive_effort === 'medium' ? 4 : 3;

        return {
          id: blockId,
          user_id: userId,
          session_id: sessionId,
          target_date: TODAY_DATE,
          target_period: targetPeriod,
          priority_rank: priorityRank,
          ai_justification: `Alocado automaticamente pela IA com base no esforço cognitivo ${sess.cognitive_effort.toUpperCase()} e nível ${userLevel}. Foco na absorção progressiva.`,
          is_rescheduled: false,
          created_at: new Date().toISOString(),
          session: studySession,
          track: newTrack,
        };
      });

      onTrackCreated(createdBlocks, newTrack);
      onClose();
    } catch (err: unknown) {
      console.error('[CreateTrackModal Error]:', err);
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
          rawMsg || 'Falha inesperada ao comunicar com o Gemini Decomposer'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const applyTemplate = (template: typeof PRESET_TEMPLATES[0]) => {
    setRawText(template.text);
    setCategory(template.category);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      {/* TELA DE LOADING CINEMATOGRÁFICA DA IA */}
      {isLoading ? (
        <div className="bg-[#090B0E]/95 border border-white/10 rounded-3xl max-w-lg w-full p-8 shadow-[0_30px_90px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-3xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-300">
          {/* Feixe de Luz Difusa Esmeralda de Fundo */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none blur-[90px] opacity-40"
            style={{ background: 'radial-gradient(circle, #88C0A8 0%, #569DAA 50%, transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#88C0A8]/10 border border-[#88C0A8]/40 flex items-center justify-center shadow-[0_0_35px_rgba(136,192,168,0.3)] animate-pulse">
                <CadenceLogo size={36} showText={false} />
              </div>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#88C0A8] bg-[#88C0A8]/10 px-3 py-1 rounded-full border border-[#88C0A8]/30">
                Gemini 3.8 Flash // Decomposer Core
              </span>
              <h3 className="text-xl font-bold text-slate-100 font-display mt-2">
                Fatiando Ementa com Inteligência
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Construindo a linha de produção atômica para sua rotina.
              </p>
            </div>
          </div>

          {/* Barra de Progresso Contínua e Elegante */}
          <div className="relative z-10 w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#88C0A8] via-[#569DAA] to-[#88C0A8] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${((currentStepIndex + 1) / PIPELINE_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Pipeline de Etapas de Telemetria Sequencial */}
          <div className="relative z-10 space-y-2.5 pt-1">
            {PIPELINE_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.label}
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-all duration-300 ${
                    isCurrent
                      ? 'bg-white/[0.04] border-[#88C0A8]/40 shadow-xs'
                      : isPast
                      ? 'bg-black/30 border-white/5 opacity-60'
                      : 'border-transparent opacity-25'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-[#88C0A8]" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#88C0A8] border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20" />
                    )}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className={`text-xs font-mono font-medium truncate ${isCurrent ? 'text-slate-100' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-500 font-sans truncate">
                      {step.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative z-10 text-center font-mono text-[10px] text-slate-500 pt-2 border-t border-white/5">
            Cadence AI · Rough-Cut Capacity Planning Engine
          </div>
        </div>
      ) : (
        /* FORMULÁRIO PRINCIPAL COM DESIGN VIDRO-APPLE */
        <div className="bg-[#090B0E]/95 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl backdrop-blur-3xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header do Modal */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#88C0A8]/10 border border-[#88C0A8]/30 text-[#88C0A8] flex items-center justify-center shadow-[0_0_15px_rgba(136,192,168,0.2)]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                  Decomposer Engine
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#88C0A8]/10 text-[#88C0A8] border border-[#88C0A8]/20">
                    Gemini 3.8 Flash
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Transforme ementas densas em sessões atômicas com dosagem cognitiva precisa
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formulário Principal */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="space-y-0.5">
                  <span className="font-bold">Aviso no processamento:</span>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Exemplos Prontos */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Exemplos Prontos de Ementas de Engenharia</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PRESET_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={isLoading}
                    onClick={() => applyTemplate(tpl)}
                    className="text-left p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-white/15 text-xs transition-colors cursor-pointer group space-y-1"
                  >
                    <div className="font-semibold text-slate-300 group-hover:text-[#88C0A8] truncate font-mono">
                      {tpl.title}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate font-mono">
                      {tpl.category}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Campo da Ementa */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Ementa, Conteúdo Programático ou Tópicos de Estudo</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {rawText.length} caracteres
                </span>
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Cole aqui a ementa da disciplina, tópicos de um livro, edital ou grade curricular..."
                rows={5}
                required
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#88C0A8] transition-colors font-mono leading-relaxed"
              />
            </div>

            {/* Categoria e Nível */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Área / Categoria</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0E1319] border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#88C0A8] font-mono cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-slate-400" />
                  <span>Nível de Domínio Atual</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Iniciante', 'Intermediário', 'Avançado'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setUserLevel(lvl)}
                      className={`py-2 rounded-xl text-xs font-mono transition-colors cursor-pointer border ${
                        userLevel === lvl
                          ? 'bg-[#88C0A8]/20 text-[#88C0A8] border-[#88C0A8]/40 font-semibold'
                          : 'bg-white/[0.02] text-slate-400 border-white/5 hover:border-white/15'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cor de Identificação */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Cor de Acento da Trilha</label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border transition-all cursor-pointer ${
                      selectedColor === c.hex
                        ? 'border-white text-white font-bold bg-white/10'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer com Ações */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-bold bg-[#88C0A8] hover:bg-[#9ad0b8] text-slate-950 shadow-[0_0_25px_rgba(136,192,168,0.25)] transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gerar Trilha com IA</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
