# 🏛️ Leadgers Platform - System Architecture & exhaustive Documentation

Este documento aprofunda a lógica de negócios, topologia de rede, esquemas de integração, modelos de dados e arquitetura de sistema que alimentam a Plataforma Leadgers Governance. Ele serve como o guia definitivo para os engenheiros compreenderem o "como" e o "porquê" de cada bloco lógico da plataforma (Atualizado com fechamento da Fase 1 - Março 2026).

---

## 🏗️ Topologia e Visão Macro (Sistema Distribuído)

O sistema foi arquitetado visando isolamento escalonável de recursos (`SaaS B2B Multi-Tenant`) sob os princípios Severless usando **Supabase**, **Hono** e **Vercel**.

1. **Frontend (Vite + React)**: Um SPA fortemente guiado por módulos via lazy-loading (`module_registry`). Hospedado nativamente na Edge Network (Vercel).
2. **Backend API (Hono + Node.js)**: Uma API extremamente leve e veloz rodando com suporte extensível a webhooks e streaming. Usa Zod para validação end-to-end (RPC / OpenAPI). Todo tráfego precisa enviar o cabeçalho `x-tenant-id` garantindo isolamento de dados.
3. **Database Layer (Supabase / PostgresSQL)**: Bancos isolados usando RLS (Row-Level Security) atrelado diretamente às credenciais JWT de cada usuário.
4. **Queue & Background Jobs (Inngest)**: Agendador e orquestrador de eventos resilientes para evitar picos no backend e rodar rotinas longas (ex.: Inteligência Artificial gerando reports, verificação contínua de anomalias financeiras).
5. **AI/ML Layer (@leadgers/ai)**: Integração centralizada com LLMs (nativamente Google Gemini 2.0 / OpenAI via adaptadores).

---

## 🔐 Autenticação e Multi-Tenancy

O pilar mais rigoroso do sistema é o Multilocatário (Multi-Tenant).

- **O Princípio**: Um usuário pode pertencer a N empresas (Tenants). O banco de dados nunca confia na aplicação para limitar acessos. Ele usa Row Level Security vinculado à claims JWT geradas no login pelo Supabase GoTrue Auth.
- **Isolamento via RLS**:
  Nenhuma tabela é exposta no frontend sem que as políticas abaixo obriguem o match:
  `tenant_id = (select auth.jwt() ->> 'user_metadata' -> 'tenant_id')`
- **Mapeamento Usuário/Org (Tabela pivô)**: A tabela `user_roles` define o nível de abstração (Owner, Admin, Manager, Auditor, Viewer) dentro de um tenant específico. O middleware do backend (`authMiddleware` + `tenancyMiddleware`) sempre verifica a validade cruzada entre o Token Bearer + Header do Tenant atual requisitado.

---

## 🧠 Motores e Jobs Essenciais (Fase 1 Completada)

Foram construídos sistemas inteligentes que ativamente preveem perigos e geram insights antes que as empresas peçam.

### 1. 📆 Weekly Digest (Relatório Executivo Assistido por IA)

**Código Referência**: `apps/api/src/jobs/weekly-digest.ts` e `apps/api/src/routes/ai/weekly-digest.ts`

- **Objetivo**: Extrair a carga de relatórios manuais de C-levels.
- **Funcionamento Mecânico**:
  - Toda segunda-feira às 08:00 (BRT), o Inngest dispara o Cloud Cron `weekly-digest`.
  - O Backend compila um dossiê métrico: Contas à pagar/receber nos últimos 7 dias via `transactions`, alertas pendentes não dispensados, OKRs atrasados e número de chamados.
  - O `GoogleAdapter` (LLM) é injetado. O texto é gerado numa linguagem executiva e analítica apontando gargalos financeiros.
  - Resultados são gravados na tabela de histórico `weekly_digests` permitindo leitura assíncrona on-demand.

### 2. 🚨 Alertas Preditivos (Predictive Risk Engine)

**Código Referência**: `apps/api/src/jobs/predictive-alerts.ts` e `apps/api/src/routes/strategic/alerts.ts`

- **Objetivo**: Funcionar como o alarme de incêndio preventivo do ERP.
- **Dinâmica**:
  - Uma vez por dia, um bot roda nos tenants ativos.
  - Regra Financeiro (Burn Rate Threshold): Se o custo operacional for perigosamente crescente (via `burn-rate.ts`) e o cronômetro do Runway apontar para `< 3 meses` de caixa disponível, o sistema escreve imediatamente na tabela `alerts` (Type: `CRITICAL`).
  - Regra Estratégica: OKRs que estiverem vinculados a Milestone (`milestones` table) e estejam estagnados com a data do Q alvo chegando em 15 dias: Dispara (Type: `YELLOW`).
  - O usuário logado então enxerga na Dashboard (Topo fixo) os blocos com risco de morte do negócio. Ele pode marcar como lido (`is_read = true`) ou dispensar ignorando.

### 3. 📈 Health Score (Pontuação de Resiliência de 0 a 100)

**Código Referência**: `apps/web/src/modules/dashboard/hooks/useHealthScore.ts`

- **Objetivo**: Compilar complexidade em uma única métrica gamificada e executiva.
- O backend consulta 5 pesos de forma pesada (ponderada):
  - **30% Financeiro:** Runway > 12 Meses; Burn Rate Estável.
  - **25% Compliance:** Sem auditorias críticas não cumpridas. Vulnerabilidades limitadas.
  - **20% Operação:** Milestones no cronograma (`status = in_progress` validando contra o tempo).
  - **15% Legal:** Pools ESOP regularizados e contabilidade atualizada.
  - **10% Engajamento de IA:** O nível com que os administradores geraram e resolveram insights gerados pelas IAs.

---

## 💼 Módulos Físicos Core do Negócio

### 📊 Equity & Vesting (Cap Table Engine)

**Tabelas**: `esop_pool`, `stock_option_grants`
**Caminho**: `apps/web/src/modules/finance/pages/EquityVesting.tsx`

- Startups e Empresas SaaS perdem controle de Opções de Acesso acionário muito fácil.
- O Módulo de Equity armazena os Pools de Stock Options de colaboradores com um banco matemático preciso.
- **O Motor de Cálculo**:
  1. Identificação do `Cliff Period` (Carência, geralmente 12 a 24 meses).
  2. Subtração de Datas (Grant Date até Date Now) via TypeScript `date-fns`.
  3. Se Carência Ocorreu = O burst share é liberado.
  4. O residual é dividido simetricamente por mes/dias dependentes no percurso dos próximos 36 ou 48 meses agendados do vesting total. Tudo renderizado num gráfico de linhas temporal do `Recharts`.

### 🛣️ Roadmap Visual (Integração Direta com GitHub)

**Tabelas**: `roadmap_items`
**Caminho**: `apps/web/src/modules/dashboard/pages/RoadmapKanban.tsx`
O Leadgers utiliza a técnica "Single-Source of Truth Unidirecional" para o Board Tecnológico no módulo Dashboard.

- C-Levels usam Cards Kanban e Timeline com Status (`backlog`, `in_progress`, `review`, `completed`).
- **Drag-And-Drop**: Usa mock API adaptável no Frontend, reodenando itens usando `patch()` on-the-fly (`sort_order`).
- **Integração Externa Automática**: O C-Level insere seu Personal Access Token do GitHub via Frontend de forma limpa. O backend consome a API oficial do GitHub `GET /repos/{owner}/{repo}/issues`, filtra exclusivamente issues etiquetadas como "roadmap" (_strict filtering_) e puxa pra mesa. Sem duplicidade ou conflitos bidirecionais assustadores, priorizando estabilidade. Nenhuma edição dentro do Kanban sobreescreve falhamente o repositório remoto dos programadores; protege-se o ecossistema e visualiza-se de ponta a ponta.

### ⛳ Milestone Tracker & OKRs

**Tabelas**: `milestones`, `okrs`, `key_results`
O elo principal de amarração na plataforma. Absolutamente tudo na plataforma é interligado; ex: O módulo Financeiro monitora os custos de Milestones, e os Roadmaps são amarrados (Linked_okr_id FK) ao sistema de medição. A timeline apresenta o atraso real no cumprimento baseando em matemática temporal.

## 🧱 Abordagem Arquitetural no Código Typescript

### Backend / Hono Routes

Todo Roteamento (`app.ts`) abstrai a repetição de códigos de segurança de tenant da seguinte forma generalista (Padrão Decorator em camadas middleware da api):

```typescript
import { authMiddleware, tenancyMiddleware } from "../../middlewares/auth";

const roadmapRoutes = new Hono()
  .use("*", authMiddleware, tenancyMiddleware)
  .post("/import-github", async (c) => {
    // Escopo seguro. 100% Protegido pro 'tenant atual' extraido do header.
    // O Objeto Prisma ($transaction) é usado majoriatariamete para operações seguras de Rollback ACID.
  });
```

### Frontend / Registros de Hook & Módulos

Nenhum desenvolvedor deve espargir rotas hardcoded (Chumbadas) pelo App! O sistema usa `apps/web/src/modules/registry.ts`.
Ao construir um módulo e tela, apenas importe e injete no Registry o seu array de paths. O painel central `Sidebar`/`Layout` fará de modo auto-descritivo as renderizações via loops e Lazy Imports.

```tsx
import { lazy } from "react";
const RoadmapComponent = lazy(() => import("./pages/RoadmapKanban"));

export const dashboardModuleConfig = {
  id: "dashboard",
  routes: [{ path: "roadmap", element: <RoadmapComponent /> }],
};
// Magica Acontece!
```

---

_Fim da Documentação Base Sistêmica._
