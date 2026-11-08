# Cadence AI - Workspace Master Rules

> **Status:** Ativo e Obrigatório  
> **Escopo:** Todo o repositório `cadence-ai` (Front-End, Back-End, Integrações de IA e Banco de Dados)  
> **Audiência:** Desenvolvedores, Engenheiros de Software e Agentes Autônomos de Código

---

## 1. Diretriz de Design: Minimalismo Funcional (Anti-AI Clutter)

A premissa central de design do **Cadence AI** é a redução radical da sobrecarga cognitiva para estudantes e profissionais com rotinas densas. A interface deve operar como um cockpit instrumental de alta precisão, eliminando ornamentos visuais, distrações cosméticas e padrões genéricos de "dashboards de IA".

### 1.1 Regras de Eliminação de Ruído (Anti-Clutter)
- **Zero Poluição Visual**: Proibido o uso indiscriminado de cards coloridos, gradientes chamativos, ilustrações decorativas ou múltiplos botões primários concorrentes na mesma viewport.
- **Hierarquia de Ação Singular**: Cada tela ou estado de visualização deve possuir no máximo **uma** ação primária evidente (ex: "Iniciar Sessão", "Rebalancear Semana").
- **Tipografia e Escala Neutra**:
  - Base estrutural rigorosa em tons neutros: `zinc-950` (background profundo), `zinc-900` (superfícies e cards), `zinc-800` (divisores e bordas sutis).
  - Texto de alta legibilidade: `text-zinc-100` (títulos e dados críticos), `text-zinc-400` (metadados secundários), `text-zinc-500` (suporte despriorizado).
- **Semântica Funcional de Cores (Uso Restrito)**:
  - Cores saturadas são reservadas exclusivamente para comunicação de estado operacional:
    - **Verde (`emerald-500`)**: Concluído / Sucesso / Baixo risco.
    - **Azul (`blue-500`)**: Em andamento / Foco ativo / Turno corrente.
    - **Âmbar (`amber-500`)**: Atenção / Sessão de alto esforço cognitivo / Risco moderado.
    - **Vermelho (`rose-500`)**: Sessão em atraso crítico / Risco iminente de sobrecarga (burnout).

### 1.2 Divisão em 4 Abas Estritas
A arquitetura de navegação do produto é restrita e dividida em 4 domínios funcionais:
1. **`/today` (Cockpit do Dia)**: Foco total na sessão ativa atual, cronômetro de execução e timeline linear enxuta do dia dividida por períodos (`morning`, `afternoon`, `evening`, `night`). Sem backlog ou distrações de outras matérias.
2. **`/tracks` (Linha de Produção & Matérias)**: Visão de catálogo, ementas, decomposição atômica de matérias, checkpoints pedagógicos e backlog ordenado por sequência de dependência.
3. **`/planner` (Matriz de Capacidade & PCP)**: Visualização da grade semanal de disponibilidade (`available_minutes` por data), balanço de carga e interface acionável do algoritmo de rebalanceamento.
4. **`/insights` (Métricas & Fatores Humanos)**: Análise técnica sóbria de aderência ao plano, tempo planejado vs. executado e índice de dificuldade percebida (1 a 5) reportado pós-estudo. Sem métricas de vaidade.

---

## 2. Princípios de Arquitetura e Engenharia de Software

### 2.1 Separação de Responsabilidades (SoC) & Clean Architecture
- **Camada de Apresentação (`src/components/`)**:
  - Componentes puramente funcionais com React 19.
  - Componentes de UI devem ser stateless ou gerenciar exclusivamente estado de interação visual (ex: toggles de accordion, modais abertos/fechados).
  - Proibido executar chamadas diretas de rede (`fetch` ou `supabaseClient`) dentro de componentes visuais de apresentação; toda persistência e orquestração de dados deve transitar pela camada de serviços (`src/services/`).
- **Camada de Serviços (`src/services/`)**:
  - Módulos coesos e desacoplados responsáveis por regras de negócio, chamadas HTTP ao BFF e queries ao Supabase/localStorage.
- **Camada de Contratos e Tipos (`src/types/study.ts`)**:
  - Única fonte de verdade (Single Source of Truth) para o modelo de dados do domínio.

### 2.2 Tipagem Estrita e Validação na Borda (Type-Driven Development)
- **Zero `any`**: O uso de `any` é terminantemente proibido. Utilize tipos derivados de schemas Zod (`z.infer<typeof ...>`), generics delimitados ou uniões discriminadas.
- **Validação de Fronteira com Zod**:
  - Toda comunicação com o mundo externo (retornos de endpoints Express, payloads de IA do Gemini, responses do Supabase PostgREST e dados lidos de `localStorage`) **deve** ser submetida ao `.safeParse()` do respectivo schema Zod antes de ser consumida pela aplicação.
  - Caso a validação falhe, o sistema deve logar o detalhamento do erro de schema e disparar um fallback controlado, impedindo falhas em cascata na renderização.

### 2.3 Persistência Híbrida & Offline-First (Resiliência Operacional)
- **Estratégia Local-First com Fallback Transparente**:
  - O aplicativo deve funcionar de forma instantânea e autônoma, independentemente da disponibilidade de conexão ou configuração prévia do backend.
  - Mutações de estado de sessão devem aplicar atualizações otimistas na interface e persistir imediatamente no `localStorage` via `storageService.ts`.
  - Quando as variáveis do Supabase (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) estiverem presentes e o usuário logado, as operações devem ser sincronizadas em segundo plano via `supabaseService.ts`, respeitando as políticas de Row Level Security (RLS).

### 2.4 Integração Segura com Inteligência Artificial (BFF Pattern)
- **Segurança de Credenciais**: A chave `GEMINI_API_KEY` deve residir única e exclusivamente no ambiente seguro do servidor (`server.ts`). Nenhuma credencial de IA deve ser exposta ou referenciada no código cliente.
- **Contratos Determinísticos com Structured Outputs**:
  - Todas as chamadas ao modelo (`gemini-3.8-flash` ou `GEMINI_MODEL`) devem exigir `responseMimeType: 'application/json'` e definir explicitamente o `responseSchema` com tipos primitivos do SDK (`Type.OBJECT`, `Type.ARRAY`, etc.).
- **Tolerância a Falhas**:
  - Chamadas de IA devem ser encapsuladas pelo utilitário `generateWithRetry`, aplicando *exponential backoff* para absorver sobrecargas transitórias (HTTP 503 / 429).

---

## 3. Stack Tecnológica Padronizada

| Componente | Ferramenta / Biblioteca | Versão / Padrão |
| :--- | :--- | :--- |
| **Linguagem** | TypeScript | `~5.x / 7.x`, strict mode ativado no `tsconfig.json` |
| **Front-End UI** | React | `19.x` (Hooks modernos, sem bibliotecas pesadas de estado global) |
| **Bundler & Dev** | Vite | `8.x` com plugin oficial `@vitejs/plugin-react` |
| **Estilização** | Tailwind CSS | `v4.x` via `@tailwindcss/vite` (utilitários atômicos e classes nativas) |
| **Iconografia** | Lucide Icons | `lucide-react` (proporções homogêneas de 16px ou 20px) |
| **Validação** | Zod | `v4.x / 3.x` em `src/types/study.ts` |
| **Servidor BFF** | Express | `4.x` em `server.ts` executado via `tsx` |
| **Banco / Auth** | Supabase | `@supabase/supabase-js` (PostgreSQL com RLS) |
| **Motor de IA** | Google GenAI SDK | `@google/genai` com modelo `gemini-3.8-flash` |

---

## 4. Loop de Verificação Obrigatório (Quality Gate)

Nenhuma tarefa, refatoração ou funcionalidade pode ser dada como concluída sem que as seguintes etapas de qualidade sejam rigorosamente executadas e aprovadas no terminal:

```bash
# 1. Checagem Estrita de Tipagem (Sem emissão de arquivos)
npx tsc --noEmit

# 2. Validação de Build de Produção
npm run build
```

### Critérios Inegociáveis de Aceite (Definition of Done):
1. **Zero Erros de TypeScript**: A execução de `npx tsc --noEmit` deve retornar código de saída `0` sem qualquer advertência ou erro de tipo.
2. **Imutabilidade e Prevenção de Efeitos Colaterais**: Estados no React devem ser atualizados via funções puras sem mutação direta de arrays ou objetos.
3. **Preservação de Documentação**: Comentários explicativos de arquitetura, contratos de interfaces e regras de negócio existentes devem ser preservados e enriquecidos a cada modificação.
4. **Respeito aos Contratos de Dados**: Nenhuma propriedade obrigatória de `StudyTrack`, `StudySession` ou `ScheduleBlock` pode ser omitida ou renomeada sem a devida atualização síncrona nos schemas Zod, nos componentes e nas migrações do banco.
