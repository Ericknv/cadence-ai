# Cadence AI (StudyPilot) — Documento Executivo de Produto & Arquitetura

> **Cadence AI** é um sistema de **Engenharia de Rotina e Gestão da Capacidade Cognitiva** voltado para estudantes de alta performance e profissionais com cargas simultâneas exigentes (ex.: graduação em Engenharia na UFAM + estágio corporativo + certificações).

---

## 1. Visão Geral e Proposta de Valor

### O Problema Fundamental
Sistemas tradicionais de estudo (Notion, Trello, Google Calendar) tratam tarefas como listas estáticas infinitas. O estudante acumula pendências, sofre com a ilusão de planejamento e entra em ciclo de **fadiga mental e burnout**, pois essas ferramentas ignoram a **fisiologia da atenção** e a **capacidade finita de horas reais por dia**.

### A Solução
O Cadence AI aplica conceitos clássicos de **Engenharia de Produção (PCP — Planejamento e Controle da Produção)** ao aprendizado:
1. **RCCP/CRP (Rough-Cut Capacity Planning):** Cada dia possui uma restrição rígida de capacidade (`available_minutes`). Tarefas não podem exceder o limite real disponível.
2. **Decomposição Atômica:** Ementas complexas são fatiadas pela IA (Google Gemini 3.8 Flash) em sessões atômicas de 30 a 60 minutos, classificadas por esforço mental (`High / Deep Work`, `Medium`, `Low`).
3. **Rebalanceamento com Proteção:** Quando um imprevisto acontece ou o estudante tem uma semana de provas, o motor de IA redistribui a carga e **adia intencionalmente o excedente** (*deferred sessions*), eliminando a culpa da procrastinação através de dados técnicos.

---

## 2. Diagnóstico da Interface & O Que Deve Ser Eliminado

A aplicação passou pela fase funcional (banco relacional, autenticação, APIs de IA e deploy contínuo em Docker/Render). No entanto, a interface atual combate a clássica **"Síndrome do Dashboard de IA"**:

* **Eliminação de acúmulo vertical e repetição de elementos:** Eliminação de cards de métricas concorrentes, heros redundantes e timelines sobrecarregadas.
* **Cores pesadas e sem hierarquia:** Substituição de superfícies escuras chapadas (`zinc-900`/`zinc-950`) com bordas duras por minimalismo funcional com ergonomia visual e alto contraste.
* **Espaço negativo e elegância:** Introdução de respiro (dark space), tipografia editorial sóbria e microinterações táteis de baixo ruído cognitivo.

---

## 3. Direcionamento Estético (v1.1)

Com base nas referências aprovadas (*GreenMotive*, *Mindly* e *Glassmorphism 3D*), a identidade visual segue o conceito de **Minimalismo Funcional Etéreo (Visual Calmness)**:

### A. Superfícies e Profundidade (Glassmorphism Sutil)
- Camadas translúcidas com preenchimentos sutis no dark mode ou superfícies cerâmicas acetinadas.
- Bordas ultrafinas em gradiente suave ou fios de luz (`1px solid rgba(255, 255, 255, 0.08)`).
- Raios de curvatura orgânicos (`rounded-2xl` e `rounded-3xl`), transmitindo sofisticação e conforto ótico.

### B. Navegação em "Floating Dock" (Ilha Flutuante)
- Eliminação de barras de navegação tradicionais e pesadas.
- **Pílula de navegação centralizada** contendo apenas as 4 abas essenciais com microindicadores de estado ativo.

### C. Tipografia Editorial & Hierarquia Sóbria
- **Headings:** Tipografia de classe editorial, transmitindo clareza mental e foco.
- **Dados operacionais (minutos, datas, tags):** Fonte monoespelhada elegante, em caixa reduzida e tonalidade suave (`text-zinc-400`).
- **Respiro:** Espaçamentos generosos entre blocos para proporcionar alívio e foco imediato.

### D. Paleta Cromática Funcional
- **Base:** Monocromática, sóbria, tons neutros de grafite profundo, obsidian (`zinc-950`/`zinc-900`) e off-white.
- **Acentos Funcionais (usados exclusivamente para sinalização de estado):**
  - `Deep Work / Foco Crítico`: Coral suave / terracota suave (alerta sem ser estridente).
  - `PCP / Capacidade Equilibrada`: Verde sálvia ou esmeralda dessaturado (`emerald-500`).
  - `Trilhas / Progresso`: Azul etéreo ou índigo funcional (`blue-500`).

---

## 4. Arquitetura Modular da Aplicação (As 4 Abas Oficiais)

A interface não é uma tela única abarrotada. O usuário navega exclusivamente entre **quatro domínios cognitivos**:

```
┌──────────────────────────────────────────────────────────┐
│                   [ FLOATING DOCK ]                      │
│        (  Hoje  •  Trilhas  •  Planejamento  •  Métricas  )     │
│          /today     /tracks      /planner      /insights │
└──────────────────────────────────────────────────────────┘
```

1. **Aba "Hoje" (`/today` — O Cockpit de Execução):**
   * *Objetivo:* Foco imediato. Zero ruído analítico.
   * *Elementos:* 
     - Apenas a **sessão ativa em andamento** (com meta pedagógica e botão de check-in).
     - Timeline linear recolhível com as próximas sessões do turno.
     - Toggle para alternar entre *Visão Geral Executiva* e *Modo Foco Estrito*.

2. **Aba "Trilhas" (`/tracks` — Linha de Produção de Conhecimento):**
   * *Objetivo:* Catálogo das matérias e gestão do backlog atômico.
   * *Elementos:*
     - Cards fluidos por disciplina (UFAM, certificações, projetos).
     - Barra de progresso percentual elegante.
     - Visualização do backlog atômico de sessões e metas de aprendizagem (*Progressive Disclosure*).
     - Ação de ingestão rápida: `+ Nova Trilha` com IA.

3. **Aba "Planejamento" (`/planner` — Motor de PCP e Capacidade):**
   * *Objetivo:* Equilíbrio de carga semanal e prevenção de burnout.
   * *Elementos:*
     - Grade interativa de 7 dias com ajuste fino dos minutos disponíveis (`available_minutes`).
     - Alerta visual suave quando houver sobrecarga ($>100\%$ da capacidade).
     - Presets rápidos de 1-clique (Normal, Provas, Intensivo).
     - Motor de rebalanceamento integrado via Gemini com diagnóstico sucinto e sessões postergadas com justificativa.

4. **Aba "Métricas" (`/insights` — Controle Estatístico e Retenção):**
   * *Objetivo:* Retrospectiva serena de desempenho.
   * *Elementos:*
     - Taxa de aderência real (% de blocos cumpridos).
     - Mix e balanço do esforço mental (Deep Work vs. Prática vs. Revisão).
     - Histórico da nota de fadiga percebida (1 a 5) coletada nos check-ins pós-estudo.

---

## 5. Especificação Técnica e Stack

| Camada | Tecnologia Adotada | Observações de Engenharia & UI |
| :--- | :--- | :--- |
| **Framework** | React 19 + TypeScript (Strict) | Componentes funcionais atômicos, tipados e sem mutação de estado. |
| **Estilização** | Tailwind CSS v4 | Utilitários CSS modernos com suporte a glassmorphism e microinterações. |
| **Ícones** | Lucide React | Ícones com traço fino (`strokeWidth={1.5}` ou `2`), tamanho consistente (14-18px). |
| **Backend / BFF** | Express (`server.ts`) + Node 22 | Proxy seguro para chamadas de IA, middlewares e assets estáticos. |
| **Banco / Auth** | Supabase (PostgreSQL + RLS) | Autenticação segura, persistência relacional com fallback local em `localStorage`. |
| **Inteligência** | Google Gemini 3.8 Flash | Decomposição atômica de ementas e algoritmo de rebalanceamento semanal com backoff exponencial. |
| **Infraestrutura** | Docker (Node 22 Slim) + GitHub Actions | Build multi-estágio seguro (non-root `cadence`) e pipeline de CI/CD automatizado. |

---

## 6. Governança & Diretrizes de Design

1. **Anti-AI Clutter:** Eliminar decorações gratuitas, gradientes berrantes ou cards concorrentes na mesma viewport.
2. **Quality Gate:** Todo commit e pull request deve validar compilação estrita e build antes de merge:
   ```bash
   npx tsc --noEmit
   npm run build
   ```
3. **Segurança de Credenciais:** A chave de API do Gemini reside estritamente no servidor (`server.ts`). Somente as chaves públicas anônimas do Supabase são expostas ao client Vite.
