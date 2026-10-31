import { z } from 'zod';

/* ==========================================================================
   ENUMS & LITERAL DEFINITIONS
   ========================================================================== */

export const SessionTypeEnum = z.enum(['theory', 'practice', 'review', 'project']);
export type SessionType = z.infer<typeof SessionTypeEnum>;

export const CognitiveEffortEnum = z.enum(['low', 'medium', 'high']);
export type CognitiveEffort = z.infer<typeof CognitiveEffortEnum>;

export const SessionStatusEnum = z.enum(['todo', 'in_progress', 'completed', 'skipped']);
export type SessionStatus = z.infer<typeof SessionStatusEnum>;

export const TargetPeriodEnum = z.enum(['morning', 'afternoon', 'evening', 'night']);
export type TargetPeriod = z.infer<typeof TargetPeriodEnum>;

export const PriorityRankEnum = z.number().int().min(1).max(5);
export type PriorityRank = 1 | 2 | 3 | 4 | 5;

/* ==========================================================================
   DATABASE ENTITY SCHEMAS & TYPES (PRD CONSOLIDADO)
   ========================================================================== */

/**
 * Trilha de Estudos (study_tracks)
 */
export const StudyTrackSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  title: z.string().min(1, 'O título da trilha é obrigatório'),
  category: z.string().min(1, 'A categoria é obrigatória'),
  overview: z.string(),
  color_hex: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Formato hexadecimal inválido'),
  is_archived: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type StudyTrack = z.infer<typeof StudyTrackSchema>;

/**
 * Sessão de Estudo (study_sessions)
 */
export const StudySessionSchema = z.object({
  id: z.string().uuid(),
  track_id: z.string().uuid(),
  user_id: z.string(),
  sequence_order: z.number().int().nonnegative(),
  title: z.string().min(1, 'O título da sessão é obrigatório'),
  session_type: SessionTypeEnum,
  estimated_duration_min: z.number().int().positive('A duração deve ser positiva'),
  cognitive_effort: CognitiveEffortEnum,
  learning_goals: z.array(z.string()).min(1, 'Defina ao menos uma meta de aprendizagem'),
  recommended_approach: z.string(),
  status: SessionStatusEnum.default('todo'),
  perceived_difficulty: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
  created_at: z.string().optional(),
});
export type StudySession = z.infer<typeof StudySessionSchema>;

/**
 * Bloco de Agendamento (schedule_blocks)
 */
export const ScheduleBlockSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  session_id: z.string().uuid(),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)'),
  target_period: TargetPeriodEnum,
  priority_rank: PriorityRankEnum,
  ai_justification: z.string(),
  is_rescheduled: z.boolean().default(false),
  created_at: z.string().optional(),
});
export type ScheduleBlock = z.infer<typeof ScheduleBlockSchema>;

/* ==========================================================================
   COMPOSITE TYPES PARA RENDERIZAÇÃO DA UI
   ========================================================================== */

/**
 * Visão consolidada para os blocos da Timeline do Cockpit Diário
 */
export interface EnrichedScheduleBlock extends ScheduleBlock {
  session: StudySession;
  track: StudyTrack;
}

/**
 * Resumo diário de carga cognitiva e progresso
 */
export interface DailyCockpitSummary {
  date: string;
  total_planned_minutes: number;
  completed_minutes: number;
  total_blocks: number;
  completed_blocks: number;
  effort_breakdown: {
    high: number; // minutos
    medium: number;
    low: number;
  };
}
