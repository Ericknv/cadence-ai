import { z } from 'zod';
import {
  TargetPeriodEnum,
  PriorityRankEnum,
  TargetPeriod,
  PriorityRank,
  StudySession,
} from '../types/study';

/* ==========================================================================
   SCHEMAS E TIPOS DO REBALANCEADOR SEMANAL
   ========================================================================== */

export const BurnoutRiskEnum = z.enum(['low', 'moderate', 'critical']);
export type BurnoutRisk = z.infer<typeof BurnoutRiskEnum>;

export const AllocatedBlockSchema = z.object({
  session_id: z.string(),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve seguir YYYY-MM-DD'),
  target_period: TargetPeriodEnum,
  priority_rank: PriorityRankEnum,
  justification: z.string(),
});
export type AllocatedBlock = z.infer<typeof AllocatedBlockSchema>;

export const ScheduleRebalanceResponseSchema = z.object({
  diagnosis: z.string().min(1, 'Diagnóstico é obrigatório'),
  burnout_risk: BurnoutRiskEnum,
  allocated_blocks: z.array(AllocatedBlockSchema),
  deferred_session_ids: z.array(z.string()),
});
export type ScheduleRebalanceResponse = z.infer<typeof ScheduleRebalanceResponseSchema>;

export interface DayCapacity {
  date: string;
  day_name: string;
  available_minutes: number;
  preferred_periods: TargetPeriod[];
}

export interface RebalancePendingSession {
  id: string;
  title: string;
  session_type: string;
  estimated_duration_min: number;
  cognitive_effort: string;
  track_title: string;
  is_delayed?: boolean;
}

/**
 * Executa o rebalanceamento de capacidade semanal via IA (Gemini 2.5 Flash),
 * garantindo alocação viável sem sobrecarga cognitiva.
 */
export async function rebalanceSchedule(
  pendingSessions: RebalancePendingSession[],
  daysCapacity: DayCapacity[]
): Promise<ScheduleRebalanceResponse> {
  const response = await fetch('/api/rebalance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pendingSessions,
      daysCapacity,
    }),
  });

  if (!response.ok) {
    let errorMessage = `Erro HTTP ${response.status}: falha no rebalanceamento semanal`;
    try {
      const errorData = await response.json();
      if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // resposta não-JSON
    }
    throw new Error(errorMessage);
  }

  const rawJson = await response.json();

  const validation = ScheduleRebalanceResponseSchema.safeParse(rawJson);
  if (!validation.success) {
    console.error('Falha na validação Zod do Rebalanceamento:', validation.error);
    throw new Error(
      `A resposta do rebalanceador não respeitou a estrutura estrita: ${validation.error.issues
        .map((i) => i.message)
        .join(', ')}`
    );
  }

  return validation.data;
}
