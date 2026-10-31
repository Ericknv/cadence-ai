import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  BookOpen,
  Brain,
  Layers,
  Palette,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Send,
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

interface CreateTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  { label: 'Sky Blue', hex: '#0284c7' },
  { label: 'Emerald', hex: '#059669' },
  { label: 'Indigo', hex: '#6366f1' },
  { label: 'Amber', hex: '#d97706' },
  { label: 'Rose', hex: '#e11d48' },
  { label: 'Cyan', hex: '#0891b2' },
  { label: 'Violet', hex: '#7c3aed' },
];

const PRESET_TEMPLATES = [
  {
    title: 'Controle Estatístico de Processos (CEP)',
    category: 'Engenharia de Produção',
    text: `Capacidade de processo (Cp e Cpk), construção de gráficos de controle por variáveis (X-barra e R) e por atributos (p e c). Regras de Shewhart para causas especiais e análise de repetibilidade e reprodutibilidade (R&R Gauge).`,
  },
  {
    title: 'Simulação de Monte Carlo & Teoria das Filas',
    category: 'Engenharia de Produção',
    text: `Distribuições de probabilidade contínuas e discretas em processos produtivos. Modelos de filas M/M/1 e M/M/s (Little's Law). Geração de números pseudoaleatórios, convergência de ensaios e intervalos de confiança na tomada de decisão.`,
  },
  {
    title: 'Arquitetura de Microsserviços e Mensageria',
    category: 'Software & TI',
    text: `Padrões de decomposição de monólitos, transações distribuídas (Saga Pattern), Event-Driven Architecture com Apache Kafka, idempotência de consumers e estratégias de observabilidade (OpenTelemetry e tracing distribuído).`,
  },
];

export const CreateTrackModal: React.FC<CreateTrackModalProps> = ({
  isOpen,
  onClose,
  onTrackCreated,
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_OPTIONS[0].hex);
  const [userLevel, setUserLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Intermediário');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      // Gerar UUIDs locais compatíveis
      const trackId = crypto.randomUUID ? crypto.randomUUID() : `trk_${Date.now()}`;

      const newTrack: StudyTrack = {
        id: trackId,
        user_id: 'usr_erick_nava',
        title: result.track_title,
        category,
        overview: result.overview,
        color_hex: selectedColor,
        is_archived: false,
        created_at: new Date().toISOString(),
      };

      // Mapeamento sequencial para períodos do dia
      const periodsSequence: TargetPeriod[] = ['morning', 'afternoon', 'evening', 'night'];

      const createdBlocks: EnrichedScheduleBlock[] = result.sessions.map((sess, idx) => {
        const sessionId = crypto.randomUUID ? crypto.randomUUID() : `ses_${Date.now()}_${idx}`;
        const blockId = crypto.randomUUID ? crypto.randomUUID() : `blk_${Date.now()}_${idx}`;

        const studySession: StudySession = {
          id: sessionId,
          track_id: trackId,
          user_id: 'usr_erick_nava',
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

        // Alocação inteligente: se esforço alto, preferir manhã; médio tarde; baixo noite
        let targetPeriod: TargetPeriod;
        if (sess.cognitive_effort === 'high') {
          targetPeriod = 'morning';
        } else if (sess.cognitive_effort === 'medium') {
          targetPeriod = 'afternoon';
        } else {
          targetPeriod = 'evening';
        }

        // Se houver mais de uma sessão com o mesmo período, distribuir pela sequência
        if (idx > 0 && idx < periodsSequence.length) {
          targetPeriod = periodsSequence[idx % periodsSequence.length];
        }

        const priorityRank: PriorityRank =
          sess.cognitive_effort === 'high' ? 5 : sess.cognitive_effort === 'medium' ? 4 : 3;

        return {
          id: blockId,
          user_id: 'usr_erick_nava',
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
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Falha inesperada ao comunicar com o Gemini Decomposer'
      );
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-750 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header do Modal */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                Decomposer Engine
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
                  Gemini 2.5 Flash
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Transforme ementas densas em sessões atômicas com dosagem cognitiva precisa
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

        {/* Formulário Principal */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold">Erro no processamento:</span>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Templates de Teste Rápido */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
              <span>Exemplos Prontos de Ementas de Engenharia</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={isLoading}
                  onClick={() => applyTemplate(tpl)}
                  className="text-left p-2 rounded-lg bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800 text-xs transition-colors cursor-pointer group"
                >
                  <div className="font-semibold text-zinc-300 group-hover:text-blue-300 truncate">
                    {tpl.title}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">{tpl.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Área de Texto da Ementa */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-300 flex items-center justify-between">
              <span>Ementa, Roteiro ou Tópicos de Estudo</span>
              <span className="text-[11px] text-zinc-500 font-mono">
                {rawText.length} caracteres
              </span>
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              disabled={isLoading}
              rows={4}
              placeholder="Cole aqui a ementa da disciplina, tópicos de edital ou sumário do livro que você precisa dominar..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors font-mono leading-relaxed"
            />
          </div>

          {/* Categoria e Nível de Proficiência */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>Categoria</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors font-mono cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                <span>Nível Inicial</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Iniciante', 'Intermediário', 'Avançado'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    disabled={isLoading}
                    onClick={() => setUserLevel(lvl)}
                    className={`py-1.5 px-2 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                      userLevel === lvl
                        ? 'bg-blue-950/70 text-blue-300 border-blue-500/70 font-semibold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Seletor de Cor da Trilha */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-zinc-400" />
              <span>Cor Identificadora da Trilha</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setSelectedColor(c.hex)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono border transition-all cursor-pointer ${
                    selectedColor === c.hex
                      ? 'border-white text-white shadow-xs bg-zinc-800'
                      : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 bg-zinc-950'
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

          {/* Animação / Estado de Processamento da IA */}
          {isLoading && (
            <div className="p-4 rounded-lg bg-blue-950/30 border border-blue-800/40 space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5 text-blue-300 text-xs font-mono">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span className="font-semibold">
                  Decomposer Engine em execução via Gemini 2.5 Flash...
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Analisando complexidade conceitual, calibrando durações (30 a 90 min) e fatiando objetivos de aprendizagem com taxonomia estrita.
              </p>
            </div>
          )}

          {/* Footer com Ações */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Decompondo Ementa...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gerar Trilha com IA</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
