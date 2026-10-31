import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Modelo centralizado de IA (migrado para gemini-3.8-flash)
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

/**
 * Utilitário defensivo de resiliência: executa chamadas ao Gemini com até 3 tentativas
 * e backoff exponencial em caso de instabilidade transitória (503 / 429 / alta demanda).
 */
async function generateWithRetry(
  ai: GoogleGenAI,
  params: Parameters<typeof ai.models.generateContent>[0],
  maxRetries = 3
) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      attempt++;
      const errorMsg = (error?.message || error?.toString() || '').toLowerCase();
      const status = error?.status || error?.statusCode || error?.code;
      const isTransient =
        status === 503 ||
        status === 429 ||
        errorMsg.includes('high demand') ||
        errorMsg.includes('503') ||
        errorMsg.includes('temporarily unavailable') ||
        errorMsg.includes('resource_exhausted') ||
        errorMsg.includes('overloaded');

      if (attempt >= maxRetries || !isTransient) {
        throw error;
      }

      const delayMs = attempt * 1500; // 1.5s, 3.0s
      console.warn(
        `[Gemini Resilience] Tentativa ${attempt}/${maxRetries} falhou com erro transitório (${error?.message}). Aguardando ${delayMs}ms antes de retentar...`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('Falha após múltiplas tentativas de retry com o Gemini.');
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '5mb' }));

  // Endpoint de Decomposição Inteligente com Gemini
  app.post('/api/decompose', async (req: Request, res: Response) => {
    try {
      const { rawText, category, userLevel } = req.body;

      if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
        return res.status(400).json({ error: 'O texto da ementa ou tópico é obrigatório.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error:
            'Chave GEMINI_API_KEY não configurada no servidor. Verifique o painel Settings > Secrets.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `Você é o Decomposer Engine do StudyPilot (Cadence), especializado em organização de estudos para estudantes de engenharia e profissionais com rotinas concorrentes.
Sua missão é ingerir a ementa ou tópico fornecido e fatiá-lo em uma trilha coesa contendo de 3 a 5 sessões atômicas de estudo altamente estruturadas.

Diretrizes Obrigatórias:
1. 'session_type' DEVE ser estritamente um dos seguintes: 'theory', 'practice', 'review', 'project'.
2. 'cognitive_effort' DEVE ser estritamente um dos seguintes: 'low', 'medium', 'high'.
   - 'high': formulações matemáticas, deduções, novas abstrações densas.
   - 'medium': aplicação prática, implementação em código, listas de exercícios.
   - 'low': revisões espaçadas, leitura sintética, mapas conceituais.
3. 'estimated_duration_min' deve estar entre 30 e 90 minutos por sessão.
4. 'learning_goals' deve conter de 2 a 4 metas concretas e verificáveis.
5. 'recommended_approach' deve fornecer uma instrução pragmática de execução para evitar dispersão mental.
6. Garanta progressão pedagógica lógica: primeiro bases/teoria, depois prática procedural, projeto e revisão.`;

      const prompt = `Categoria de Estudo: ${category || 'Geral / Engenharia'}
Nível do Usuário: ${userLevel || 'Intermediário'}
Ementa / Roteiro Bruto a Decompor:
"""
${rawText}
"""

Gere a estrutura JSON estrita contendo 'track_title', 'overview' e o array de 'sessions'.`;

      const response = await generateWithRetry(ai, {
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              track_title: {
                type: Type.STRING,
                description: 'Título conciso e profissional da trilha de estudos',
              },
              overview: {
                type: Type.STRING,
                description: 'Resumo técnico do escopo e objetivos da trilha',
              },
              sessions: {
                type: Type.ARRAY,
                description: 'Lista ordenada de sessões atômicas de estudo',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: {
                      type: Type.STRING,
                      description: 'Título específico da sessão',
                    },
                    session_type: {
                      type: Type.STRING,
                      description:
                        'Tipo da sessão: theory, practice, review ou project',
                    },
                    estimated_duration_min: {
                      type: Type.INTEGER,
                      description: 'Duração estimada em minutos (30 a 90)',
                    },
                    cognitive_effort: {
                      type: Type.STRING,
                      description: 'Nível de esforço cognitivo: low, medium ou high',
                    },
                    learning_goals: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description:
                        'Checkpoints ou metas concretas de aprendizagem',
                    },
                    recommended_approach: {
                      type: Type.STRING,
                      description:
                        'Estratégia prática e pragmática recomendada para a sessão',
                    },
                  },
                  required: [
                    'title',
                    'session_type',
                    'estimated_duration_min',
                    'cognitive_effort',
                    'learning_goals',
                    'recommended_approach',
                  ],
                },
              },
            },
            required: ['track_title', 'overview', 'sessions'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Resposta vazia retornada pelo modelo Gemini.');
      }

      const parsedData = JSON.parse(responseText);
      return res.status(200).json(parsedData);
    } catch (err: unknown) {
      console.error('[Gemini Decomposer Error]:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao decompor trilha com Gemini';

      const isHighDemand =
        errorMessage.toLowerCase().includes('high demand') ||
        errorMessage.toLowerCase().includes('503') ||
        errorMessage.toLowerCase().includes('temporarily unavailable') ||
        errorMessage.toLowerCase().includes('resource_exhausted');

      if (isHighDemand) {
        return res.status(503).json({
          error:
            'A IA está com alta demanda momentânea nos servidores da Google. Tentando novamente em instantes...',
        });
      }

      return res.status(500).json({ error: errorMessage });
    }
  });

  // Endpoint de Rebalanceamento Semanal Inteligente (PCP & Proteção contra Burnout)
  app.post('/api/rebalance', async (req: Request, res: Response) => {
    try {
      const { pendingSessions, daysCapacity } = req.body;

      if (!pendingSessions || !Array.isArray(pendingSessions) || pendingSessions.length === 0) {
        return res.status(400).json({ error: 'Lista de pendingSessions é obrigatória.' });
      }

      if (!daysCapacity || !Array.isArray(daysCapacity) || daysCapacity.length === 0) {
        return res.status(400).json({ error: 'Configuração de daysCapacity é obrigatória.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error:
            'Chave GEMINI_API_KEY não configurada no servidor. Verifique o painel Settings > Secrets.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `Você é o Rebalancer Engine do StudyPilot (Cadence), atuando como Engenheiro Especialista em Planejamento e Controle da Produção (PCP) e Fatores Humanos.
Sua missão é equilibrar a carga de estudos semanal de um engenheiro/profissional contra sua matriz real de disponibilidade de tempo, protegendo-o rigorosamente contra fadiga mental e burnout.

Regras Estritas de Capacidade:
1. NUNCA exceda o 'available_minutes' diário definido para cada data. Se a demanda de minutos superar a capacidade da semana, você DEVE postergar as sessões excedentes colocando os seus IDs em 'deferred_session_ids'.
2. Priorização:
   - Sessões em atraso ou com dependência de fundamentos devem ser alocadas primeiro.
   - Sessões com 'cognitive_effort' = 'high' (Deep Work analítico) DEVEM ser alocadas preferencialmente no primeiro turno de estudo disponível do dia (ex: 'morning' ou turno preferido) e NUNCA coloque duas sessões 'high' no mesmo dia a menos que haja mais de 180 min disponíveis.
   - Sessões 'practice' e 'review' podem ser distribuídas na tarde/noite ou em dias com menor capacidade.
3. 'target_period' DEVE ser estritamente um dos seguintes: 'morning', 'afternoon', 'evening', 'night'.
4. 'burnout_risk' DEVE ser estritamente: 'low', 'moderate' ou 'critical'.
   - 'critical': se a taxa de ocupação da semana for > 90% ou houver dias sobrecarregados sem buffer de contingência.
   - 'moderate': se a taxa estiver entre 70% e 90%.
   - 'low': ocupação < 70% com distribuição balanceada de esforço cognitivo.
5. 'diagnosis' deve ser uma avaliação técnica concisa e direta ao ponto (2 a 3 frases) em português, destacando gargalos e taxas de ocupação.
6. 'justification' de cada bloco deve explicar o motivo técnico da alocação naquela data e período específico.`;

      const prompt = `Matriz de Capacidade Semanal (Disponibilidade Diária):
${JSON.stringify(daysCapacity, null, 2)}

Sessões de Estudo Pendentes para Alocação:
${JSON.stringify(pendingSessions, null, 2)}

Gere o plano rebalanceado em JSON estrito.`;

      const response = await generateWithRetry(ai, {
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diagnosis: {
                type: Type.STRING,
                description: 'Diagnóstico executivo de viabilidade da semana e balanço de carga',
              },
              burnout_risk: {
                type: Type.STRING,
                description: 'Nível de risco de fadiga/burnout: low, moderate ou critical',
              },
              allocated_blocks: {
                type: Type.ARRAY,
                description: 'Lista de sessões alocadas nos dias e períodos permitidos',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    session_id: {
                      type: Type.STRING,
                      description: 'ID da sessão de estudo alocada',
                    },
                    target_date: {
                      type: Type.STRING,
                      description: 'Data de agendamento no formato YYYY-MM-DD',
                    },
                    target_period: {
                      type: Type.STRING,
                      description: 'Período: morning, afternoon, evening ou night',
                    },
                    priority_rank: {
                      type: Type.INTEGER,
                      description: 'Classificação de prioridade de 1 a 5',
                    },
                    justification: {
                      type: Type.STRING,
                      description: 'Justificativa técnica da alocação de capacidade',
                    },
                  },
                  required: [
                    'session_id',
                    'target_date',
                    'target_period',
                    'priority_rank',
                    'justification',
                  ],
                },
              },
              deferred_session_ids: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'IDs das sessões postergadas para a próxima sprint',
              },
            },
            required: ['diagnosis', 'burnout_risk', 'allocated_blocks', 'deferred_session_ids'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Resposta vazia retornada pelo modelo Gemini.');
      }

      const parsedData = JSON.parse(responseText);
      return res.status(200).json(parsedData);
    } catch (err: unknown) {
      console.error('[Gemini Rebalance Error]:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao rebalancear cronograma com Gemini';

      const isHighDemand =
        errorMessage.toLowerCase().includes('high demand') ||
        errorMessage.toLowerCase().includes('503') ||
        errorMessage.toLowerCase().includes('temporarily unavailable') ||
        errorMessage.toLowerCase().includes('resource_exhausted');

      if (isHighDemand) {
        return res.status(503).json({
          error:
            'A IA está com alta demanda momentânea nos servidores da Google. Tentando novamente em instantes...',
        });
      }

      return res.status(500).json({ error: errorMessage });
    }
  });

  // Configuração do Vite Middleware em desenvolvimento ou arquivos estáticos em produção
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[StudyPilot Server] Rodando na porta ${PORT}`);
  });
}

startServer();
