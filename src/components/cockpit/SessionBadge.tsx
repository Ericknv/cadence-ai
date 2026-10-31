import React from 'react';
import {
  Brain,
  BookOpen,
  Code2,
  RotateCcw,
  Hammer,
  CheckCircle2,
  Clock,
  PlayCircle,
  XCircle,
} from 'lucide-react';
import { CognitiveEffort, SessionType, SessionStatus } from '../../types/study';

/* ==========================================================================
   1. COGNITIVE EFFORT BADGE
   ========================================================================== */
interface CognitiveEffortBadgeProps {
  effort: CognitiveEffort;
  showIcon?: boolean;
  className?: string;
}

export const CognitiveEffortBadge: React.FC<CognitiveEffortBadgeProps> = ({
  effort,
  showIcon = true,
  className = '',
}) => {
  const configs: Record<
    CognitiveEffort,
    { label: string; textClass: string; bgClass: string; borderClass: string }
  > = {
    low: {
      label: 'Esforço Baixo',
      textClass: 'text-emerald-400',
      bgClass: 'bg-emerald-950/40',
      borderClass: 'border-emerald-800/60',
    },
    medium: {
      label: 'Esforço Médio',
      textClass: 'text-amber-400',
      bgClass: 'bg-amber-950/40',
      borderClass: 'border-amber-800/60',
    },
    high: {
      label: 'Esforço Alto',
      textClass: 'text-rose-400',
      bgClass: 'bg-rose-950/40',
      borderClass: 'border-rose-800/60',
    },
  };

  const current = configs[effort];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono tracking-tight font-medium border ${current.bgClass} ${current.textClass} ${current.borderClass} ${className}`}
      title={`Carga Cognitiva: ${current.label}`}
    >
      {showIcon && <Brain className="w-3 h-3 opacity-90" />}
      <span>{current.label}</span>
    </span>
  );
};

/* ==========================================================================
   2. SESSION TYPE BADGE
   ========================================================================== */
interface SessionTypeBadgeProps {
  type: SessionType;
  showIcon?: boolean;
  className?: string;
}

export const SessionTypeBadge: React.FC<SessionTypeBadgeProps> = ({
  type,
  showIcon = true,
  className = '',
}) => {
  const configs: Record<
    SessionType,
    {
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      textClass: string;
      bgClass: string;
      borderClass: string;
    }
  > = {
    theory: {
      label: 'Teoria & Conceito',
      icon: BookOpen,
      textClass: 'text-sky-300',
      bgClass: 'bg-sky-950/40',
      borderClass: 'border-sky-800/50',
    },
    practice: {
      label: 'Prática & Código',
      icon: Code2,
      textClass: 'text-cyan-300',
      bgClass: 'bg-cyan-950/40',
      borderClass: 'border-cyan-800/50',
    },
    review: {
      label: 'Revisão Espaçada',
      icon: RotateCcw,
      textClass: 'text-violet-300',
      bgClass: 'bg-violet-950/40',
      borderClass: 'border-violet-800/50',
    },
    project: {
      label: 'Projeto / Lab',
      icon: Hammer,
      textClass: 'text-orange-300',
      bgClass: 'bg-orange-950/40',
      borderClass: 'border-orange-800/50',
    },
  };

  const current = configs[type];
  const IconComponent = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${current.bgClass} ${current.textClass} ${current.borderClass} ${className}`}
    >
      {showIcon && <IconComponent className="w-3 h-3" />}
      <span>{current.label}</span>
    </span>
  );
};

/* ==========================================================================
   3. SESSION STATUS BADGE
   ========================================================================== */
interface SessionStatusBadgeProps {
  status: SessionStatus;
  className?: string;
}

export const SessionStatusBadge: React.FC<SessionStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const configs: Record<
    SessionStatus,
    {
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badgeClass: string;
    }
  > = {
    todo: {
      label: 'Pendente',
      icon: Clock,
      badgeClass: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
    },
    in_progress: {
      label: 'Em Andamento',
      icon: PlayCircle,
      badgeClass:
        'bg-blue-950/70 text-blue-300 border-blue-500/60 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
    },
    completed: {
      label: 'Concluído',
      icon: CheckCircle2,
      badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-600/50',
    },
    skipped: {
      label: 'Pulado',
      icon: XCircle,
      badgeClass: 'bg-zinc-900 text-zinc-500 border-zinc-800',
    },
  };

  const current = configs[status];
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono tracking-wide font-medium border ${current.badgeClass} ${className}`}
    >
      <Icon className={`w-3 h-3 ${status === 'in_progress' ? 'animate-pulse text-blue-400' : ''}`} />
      <span>{current.label}</span>
    </span>
  );
};
