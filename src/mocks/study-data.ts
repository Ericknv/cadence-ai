import {
  StudyTrack,
  StudySession,
  ScheduleBlock,
  EnrichedScheduleBlock,
} from '../types/study';

/**
 * Data padrão de hoje no formato YYYY-MM-DD
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TODAY_DATE = getTodayDateString();

/* ==========================================================================
   1. TRILHA ATIVA (Pesquisa Operacional & Otimização)
   ========================================================================== */
export const mockTrack: StudyTrack = {
  id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  user_id: 'usr_erick_nava',
  title: 'Pesquisa Operacional & Otimização Linear',
  category: 'Engenharia de Produção',
  overview:
    'Modelagem estocástica e determinística de sistemas produtivos, dualidade, algoritmo Simplex matricial e otimização de redes de distribuição.',
  color_hex: '#0284c7', // Sky-600
  is_archived: false,
  created_at: '2026-10-01T08:00:00Z',
  updated_at: '2026-10-25T14:30:00Z',
};

/* ==========================================================================
   2. SESSÕES DE ESTUDO HOMOLOGADAS
   ========================================================================== */
export const mockSessions: StudySession[] = [
  {
    id: 's1111111-1111-4111-8111-111111111111',
    track_id: mockTrack.id,
    user_id: 'usr_erick_nava',
    sequence_order: 1,
    title: 'Formulações Matriciais e Método Simplex Tableau',
    session_type: 'theory',
    estimated_duration_min: 75,
    cognitive_effort: 'high',
    learning_goals: [
      'Interpretar a forma padrão matricial (Ax = b, x >= 0) e bases viáveis',
      'Construir o tableau simplex calculando vetores de custos relativos (cj - zj)',
      'Identificar variáveis entrantes e saintes via critério da razão mínima',
    ],
    recommended_approach:
      'Dedução ativa em folha física com matriz bloco antes de verificar as operações elementares de pivoteamento.',
    status: 'completed',
    created_at: '2026-10-15T10:00:00Z',
  },
  {
    id: 's2222222-2222-4222-8222-222222222222',
    track_id: mockTrack.id,
    user_id: 'usr_erick_nava',
    sequence_order: 2,
    title: 'Implementação de Solver Python (PuLP) para Malha Logística',
    session_type: 'practice',
    estimated_duration_min: 60,
    cognitive_effort: 'medium',
    learning_goals: [
      'Modelar restrições de capacidade de fábrica e atendimento estrito da demanda',
      'Configurar o solver CBC via biblioteca PuLP e extrair a solução ótima',
      'Interpretar os preços sombra das restrições e custos reduzidos das rotas desativadas',
    ],
    recommended_approach:
      'Script procedural orientado a matrizes NumPy; validar dimensionalidade das restrições antes da chamada ao solver.',
    status: 'in_progress',
    created_at: '2026-10-16T11:00:00Z',
  },
  {
    id: 's3333333-3333-4333-8333-333333333333',
    track_id: mockTrack.id,
    user_id: 'usr_erick_nava',
    sequence_order: 3,
    title: 'Revisão Espaçada: Teorema da Dualidade Forte e Folgas',
    session_type: 'review',
    estimated_duration_min: 45,
    cognitive_effort: 'low',
    learning_goals: [
      'Enunciar as condições de Otimalidade de Karush-Kuhn-Tucker simplificadas para PL',
      'Verificar o Teorema das Folgas Complementares em 3 instâncias de teste',
    ],
    recommended_approach:
      'Revisão sintética via flashcards analíticos com ênfase na intuição econômica dos multiplicadores duais.',
    status: 'todo',
    created_at: '2026-10-18T09:30:00Z',
  },
];

/* ==========================================================================
   3. BLOCOS DE AGENDAMENTO (SCHEDULE BLOCKS) - HOJE
   ========================================================================== */
export const mockScheduleBlocks: ScheduleBlock[] = [
  {
    id: 'b1111111-aaaa-4aaa-8aaa-111111111111',
    user_id: 'usr_erick_nava',
    session_id: mockSessions[0].id,
    target_date: TODAY_DATE,
    target_period: 'morning',
    priority_rank: 5,
    ai_justification:
      'Alocada no início da manhã para aproveitar a janela de maior clareza cognitiva na dedução analítica do Simplex.',
    is_rescheduled: false,
    created_at: '2026-10-30T22:00:00Z',
  },
  {
    id: 'b2222222-bbbb-4bbb-8bbb-222222222222',
    user_id: 'usr_erick_nava',
    session_id: mockSessions[1].id,
    target_date: TODAY_DATE,
    target_period: 'afternoon',
    priority_rank: 4,
    ai_justification:
      'Sessão aplicada pós-almoço focada em código (PuLP). Demanda cognitiva média balanceada com alta produção de entregáveis.',
    is_rescheduled: false,
    created_at: '2026-10-30T22:00:00Z',
  },
  {
    id: 'b3333333-cccc-4ccc-8ccc-333333333333',
    user_id: 'usr_erick_nava',
    session_id: mockSessions[2].id,
    target_date: TODAY_DATE,
    target_period: 'evening',
    priority_rank: 3,
    ai_justification:
      'Fixação conceitual de baixo esforço no encerramento do dia, garantindo retenção de dualidade sem fadiga mental.',
    is_rescheduled: false,
    created_at: '2026-10-30T22:00:00Z',
  },
];

/* ==========================================================================
   4. DADOS ENRIQUECIDOS PARA O COCKPIT DIÁRIO
   ========================================================================== */
export const mockEnrichedScheduleBlocks: EnrichedScheduleBlock[] = mockScheduleBlocks.map(
  (block) => {
    const session = mockSessions.find((s) => s.id === block.session_id);
    if (!session) {
      throw new Error(`Sessão com id ${block.session_id} não encontrada no mock.`);
    }
    return {
      ...block,
      session,
      track: mockTrack,
    };
  }
);
