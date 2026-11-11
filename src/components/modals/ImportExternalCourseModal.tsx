import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  Plus,
  CheckCircle2,
  Video,
  GraduationCap,
} from 'lucide-react';
import {
  StudyTrack,
  StudySession,
  EnrichedScheduleBlock,
  CognitiveEffort,
  TargetPeriod,
  PriorityRank,
} from '../../types/study';
import { TODAY_DATE } from '../../mocks/study-data';

interface ImportExternalCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTracks: StudyTrack[];
  userId?: string;
  onCourseImported: (newBlocks: EnrichedScheduleBlock[], track: StudyTrack) => void;
}

export type PlatformOption = 'Udemy' | 'Coursera' | 'Alura' | 'YouTube' | 'Faculdade/UFAM' | 'Manual';

const PLATFORMS: { id: PlatformOption; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'Udemy', label: 'Udemy', icon: <Video className="w-3.5 h-3.5 text-rose-400" />, color: 'border-rose-500/30 bg-rose-500/10' },
  { id: 'Coursera', label: 'Coursera', icon: <GraduationCap className="w-3.5 h-3.5 text-sky-400" />, color: 'border-sky-500/30 bg-sky-500/10' },
  { id: 'Alura', label: 'Alura', icon: <BookOpen className="w-3.5 h-3.5 text-[#569DAA]" />, color: 'border-[#569DAA]/30 bg-[#569DAA]/10' },
  { id: 'YouTube', label: 'YouTube', icon: <Video className="w-3.5 h-3.5 text-red-400" />, color: 'border-red-500/30 bg-red-500/10' },
  { id: 'Faculdade/UFAM', label: 'Faculdade/UFAM', icon: <GraduationCap className="w-3.5 h-3.5 text-[#88C0A8]" />, color: 'border-[#88C0A8]/30 bg-[#88C0A8]/10' },
  { id: 'Manual', label: 'Outro / Manual', icon: <Layers className="w-3.5 h-3.5 text-slate-400" />, color: 'border-white/10 bg-white/5' },
];

export const ImportExternalCourseModal: React.FC<ImportExternalCourseModalProps> = ({
  isOpen,
  onClose,
  existingTracks,
  userId = 'usr_guest',
  onCourseImported,
}) => {
  const [platform, setPlatform] = useState<PlatformOption>('Udemy');
  const [courseName, setCourseName] = useState<string>('');
  const [courseUrl, setCourseUrl] = useState<string>('');
  const [totalHours, setTotalHours] = useState<number>(30);
  const [targetTrackId, setTargetTrackId] = useState<string>('new');
  const [newTrackCategory, setNewTrackCategory] = useState<string>('Cursos Livres & Certificações');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(3);
  const [blockDurationMin, setBlockDurationMin] = useState<number>(45);

  if (!isOpen) return null;

  const totalMinutes = totalHours * 60;
  const estimatedBlocks = Math.ceil(totalMinutes / blockDurationMin);
  const weeksToComplete = Math.ceil(estimatedBlocks / daysPerWeek);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    let targetTrack: StudyTrack;

    if (targetTrackId === 'new' || !targetTrackId) {
      const newId = crypto.randomUUID ? crypto.randomUUID() : `trk_ext_${Date.now()}`;
      targetTrack = {
        id: newId,
        user_id: userId,
        title: `${courseName.trim()} [${platform}]`,
        category: newTrackCategory.trim() || 'Cursos & Certificações',
        overview: `Curso importado da plataforma ${platform}. Carga horária total de ${totalHours}h com blocos de ${blockDurationMin}m. Link: ${courseUrl || 'N/A'}`,
        color_hex: platform === 'Udemy' ? '#FB7185' : platform === 'Faculdade/UFAM' ? '#88C0A8' : '#569DAA',
        is_archived: false,
        created_at: new Date().toISOString(),
      };
    } else {
      const found = existingTracks.find((t) => t.id === targetTrackId);
      targetTrack = found || existingTracks[0];
    }

    // Gerar blocos atômicos distribuídos progressivamente
    const newBlocks: EnrichedScheduleBlock[] = [];
    const periods: TargetPeriod[] = ['morning', 'afternoon', 'evening'];

    // Módulos pedagógicos modelo
    const moduleThemes = [
      'Introdução & Configuração de Ambiente',
      'Fundamentos Teóricos & Arquitetura',
      'Aprofundamento Prático & Hands-on',
      'Casos de Estudo & Resolução de Problemas',
      'Implementação Avançada & Otimização',
      'Testes, Depuração & Validação',
      'Projeto Prático & Síntese de Conteúdo',
      'Revisão Espaçada & Avaliação Final',
    ];

    // Gerar até no máximo 12 sessões imediatas para não sobrecarregar
    const sessionsToGenerate = Math.min(estimatedBlocks, 10);

    for (let i = 0; i < sessionsToGenerate; i++) {
      const sessionId = crypto.randomUUID ? crypto.randomUUID() : `ses_ext_${Date.now()}_${i}`;
      const blockId = crypto.randomUUID ? crypto.randomUUID() : `blk_ext_${Date.now()}_${i}`;

      const effort: CognitiveEffort = i % 3 === 1 ? 'high' : i % 3 === 2 ? 'medium' : 'low';
      const period = periods[i % periods.length];
      const theme = moduleThemes[i % moduleThemes.length];

      // Distribuir datas futuras a partir de hoje
      const dayOffset = Math.floor(i / daysPerWeek) * 7 + (i % daysPerWeek) * 2;
      const targetDateObj = new Date();
      targetDateObj.setDate(targetDateObj.getDate() + dayOffset);
      const targetDateStr = targetDateObj.toISOString().split('T')[0];

      const session: StudySession = {
        id: sessionId,
        track_id: targetTrack.id,
        user_id: userId,
        sequence_order: i + 1,
        title: `Módulo ${String(i + 1).padStart(2, '0')}: ${theme}`,
        session_type: effort === 'high' ? 'theory' : effort === 'medium' ? 'practice' : 'review',
        estimated_duration_min: blockDurationMin,
        cognitive_effort: effort,
        learning_goals: [
          `Absorver conteúdo referente à etapa ${i + 1} do curso ${courseName}.`,
          `Executar notas atômicas e código/exercício correspondente.`,
        ],
        recommended_approach: `Sessão de ${blockDurationMin}m focada sem distrações. Use o cronômetro do cockpit.`,
        status: 'todo',
        created_at: new Date().toISOString(),
      };

      const rank: PriorityRank = effort === 'high' ? 5 : effort === 'medium' ? 4 : 3;

      newBlocks.push({
        id: blockId,
        user_id: userId,
        session_id: sessionId,
        target_date: targetDateStr || TODAY_DATE,
        target_period: period,
        priority_rank: rank,
        ai_justification: `Agendado pelo ingestor de cursos externos (${platform}) respeitando a cadência de ${daysPerWeek}x/semana.`,
        is_rescheduled: false,
        created_at: new Date().toISOString(),
        session,
        track: targetTrack,
      });
    }

    onCourseImported(newBlocks, targetTrack);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#090B0E]/95 border border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl backdrop-blur-3xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-100 p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#88C0A8] bg-[#88C0A8]/10 px-2.5 py-0.5 rounded-full border border-[#88C0A8]/30">
            <Sparkles className="w-3 h-3" />
            Ingestão Externa & Agenda de Estudos
          </span>
          <h2 className="text-xl font-bold text-slate-100 font-display">
            Importar Curso Externo
          </h2>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Converta cursos da Udemy, Coursera, Alura ou faculdade em blocos atômicos encaixados na sua esteira de
            capacidade.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção de Plataforma */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Plataforma de Origem</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                    platform === p.id
                      ? `${p.color} text-slate-100 font-semibold shadow-xs`
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20'
                  }`}
                >
                  {p.icon}
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nome do Curso & Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Nome do Curso / Ementa</label>
            <input
              type="text"
              required
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Ex: Formação Engenheiro de Dados com Python e PySpark"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#88C0A8] font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
              <span>Link Original do Curso (opcional)</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </label>
            <input
              type="url"
              value={courseUrl}
              onChange={(e) => setCourseUrl(e.target.value)}
              placeholder="https://www.udemy.com/course/..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#88C0A8] font-mono"
            />
          </div>

          {/* Carga Horária e Frequência */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Carga Total
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={totalHours}
                  onChange={(e) => setTotalHours(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#88C0A8] font-mono"
                />
                <span className="absolute right-3 top-2.5 text-[11px] font-mono text-slate-500">horas</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Frequência Semanal
              </label>
              <select
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full bg-[#0E1319] border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#88C0A8] font-mono cursor-pointer"
              >
                <option value={2}>2x por semana</option>
                <option value={3}>3x por semana (recomendado)</option>
                <option value={4}>4x por semana</option>
                <option value={5}>5x por semana (intensivo)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300">Duração / Bloco</label>
              <select
                value={blockDurationMin}
                onChange={(e) => setBlockDurationMin(Number(e.target.value))}
                className="w-full bg-[#0E1319] border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#88C0A8] font-mono cursor-pointer"
              >
                <option value={30}>30 min (Micro-bloco)</option>
                <option value={45}>45 min (Ideal Pomodoro)</option>
                <option value={60}>60 min (Deep Work)</option>
              </select>
            </div>
          </div>

          {/* Trilha de Destino */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-mono text-slate-300">Trilha de Destino no Cockpit</label>
            <select
              value={targetTrackId}
              onChange={(e) => setTargetTrackId(e.target.value)}
              className="w-full bg-[#0E1319] border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#88C0A8] font-mono cursor-pointer"
            >
              <option value="new">+ Criar Nova Trilha Específica para Este Curso</option>
              {existingTracks.map((t) => (
                <option key={t.id} value={t.id}>
                  Vincular à trilha: {t.title} ({t.category})
                </option>
              ))}
            </select>
          </div>

          {targetTrackId === 'new' && (
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300">Categoria da Nova Trilha</label>
              <input
                type="text"
                value={newTrackCategory}
                onChange={(e) => setNewTrackCategory(e.target.value)}
                placeholder="Ex: Engenharia de Software, Otimização..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#88C0A8] font-mono"
              />
            </div>
          )}

          {/* Telemetria de Estimativa da Ingestão */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Total de Blocos Estimados:</span>
              <span className="font-bold text-[#88C0A8]">~{estimatedBlocks} sessões</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Prazo Estimado de Conclusão:</span>
              <span className="font-bold text-sky-400">~{weeksToComplete} semanas</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1 font-sans">
              O motor gerará as sessões atômicas distribuídas sem sobrecarregar seu teto diário de horas.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-bold bg-[#88C0A8] hover:bg-[#9ad0b8] text-slate-950 shadow-[0_0_20px_rgba(136,192,168,0.25)] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gerar Blocos & Injetar na Agenda</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
