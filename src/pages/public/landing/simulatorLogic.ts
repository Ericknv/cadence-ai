export type Complexity = 'Baixo' | 'Médio' | 'Alto';

export interface CognitiveDiagnosis {
  /** Horas totais exigidas pelas tarefas planejadas. */
  horasNecessarias: number;
  /** Carga em relação à capacidade real (pode passar de 100%). */
  percentualCarga: number;
  burnoutRisk: boolean;
  tarefasHojePossiveis: number;
  tarefasDiferidas: number;
  /** Horas efetivamente alocadas hoje pelo motor (respeitando o teto). */
  horasAlocadas: number;
}

const COMPLEXITY_FACTOR: Record<Complexity, number> = {
  Baixo: 0.6,
  Médio: 1.0,
  Alto: 1.5,
};

const BASE_HOURS_PER_TASK = 0.75;

/** Algoritmo simplificado do Simulador de Capacidade (spec da Landing v1.1). */
export function calcularDiagnosticoCognitivo(
  horasDisponiveis: number,
  numTarefas: number,
  complexidade: Complexity
): CognitiveDiagnosis {
  const horasPorTarefa = BASE_HOURS_PER_TASK * COMPLEXITY_FACTOR[complexidade];
  const horasNecessarias = numTarefas * horasPorTarefa;
  const percentualCarga = Math.round((horasNecessarias / horasDisponiveis) * 100);

  const tarefasHojePossiveis = Math.min(numTarefas, Math.floor(horasDisponiveis / horasPorTarefa));
  const tarefasDiferidas = Math.max(0, numTarefas - tarefasHojePossiveis);

  return {
    horasNecessarias,
    percentualCarga,
    burnoutRisk: percentualCarga > 110,
    tarefasHojePossiveis,
    tarefasDiferidas,
    horasAlocadas: tarefasHojePossiveis * horasPorTarefa,
  };
}
