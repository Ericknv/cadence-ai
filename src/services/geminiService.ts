import { z } from 'zod';
import {
  SessionTypeEnum,
  CognitiveEffortEnum,
  SessionType,
  CognitiveEffort,
} from '../types/study';

/* ==========================================================================
   SCHEMAS DE VALIDAÇÃO DO DECOMPOSER ENGINE
   ========================================================================== */

export const DecomposedSessionSchema = z.object({
  title: z.string().min(1, 'Título da sessão é obrigatório'),
  session_type: SessionTypeEnum,
  estimated_duration_min: z.number().int().min(15).max(180),
  cognitive_effort: CognitiveEffortEnum,
  learning_goals: z.array(z.string()).min(1, 'Ao menos uma meta de aprendizagem'),
  recommended_approach: z.string(),
});
export type DecomposedSession = z.infer<typeof DecomposedSessionSchema>;

export const DecomposeTrackResponseSchema = z.object({
  track_title: z.string().min(1, 'Título da trilha é obrigatório'),
  overview: z.string(),
  sessions: z.array(DecomposedSessionSchema).min(1, 'Ao menos uma sessão deve ser gerada'),
});
export type DecomposeTrackResponse = z.infer<typeof DecomposeTrackResponseSchema>;

/**
 * Decompõe um tópico bruto ou ementa de estudos em uma trilha com sessões atômicas estruturadas.
 * Chama o endpoint seguro do servidor (/api/decompose) utilizando o modelo gemini-2.5-flash com schema JSON.
 */
export async function decomposeStudyTopic(
  rawText: string,
  category: string,
  userLevel: string = 'Intermediário'
): Promise<DecomposeTrackResponse> {
  const response = await fetch('/api/decompose', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      rawText,
      category,
      userLevel,
    }),
  });

  if (!response.ok) {
    let errorMessage = `Erro HTTP ${response.status}: falha na comunicação com o servidor`;
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

  // Validação estrita via Zod
  const validationResult = DecomposeTrackResponseSchema.safeParse(rawJson);
  if (!validationResult.success) {
    console.error('Falha na validação Zod da resposta do Gemini:', validationResult.error);
    throw new Error(
      `A resposta da IA não respeitou a estrutura estrita esperada: ${validationResult.error.issues
        .map((i) => i.message)
        .join(', ')}`
    );
  }

  return validationResult.data;
}
