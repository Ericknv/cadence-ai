import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
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
