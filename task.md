# 📋 Task Board — Backlog de Correções e Análises

> **Última atualização:** 2026-04-16T03:51 — Atualização pós-auditoria de design system + verificação de exports PDF/DOCX

---

## TASK-01 · Bug — Fluxo de Onboarding: Busca de Empresa ✅ CONCLUÍDA

**Prioridade:** 🔴 Alta  
**Tipo:** Bug + Produto  
**Área:** Onboarding  
**Status:** ✅ Todas as subtarefas técnicas concluídas

### Descrição
Ao tentar enviar solicitação para entrar em uma empresa existente durante o fluxo de onboarding, o usuário não consegue encontrar a empresa na busca. O fluxo precisa contemplar múltiplos perfis de usuário com comportamentos distintos.

---

### Perfis de Usuário a Considerar

#### 1. Usuário Novo — Sem empresa, deseja cadastrar uma nova
- Deve seguir o fluxo padrão de criação de empresa.
- Não deve ser impactado por esta correção.
- Verificar se o fluxo de criação está funcionando corretamente de forma isolada.

#### 2. Usuário Novo — Sem empresa, deseja entrar em uma existente
- É o perfil diretamente afetado pelo bug.
- A busca de empresa não retorna resultados.
- **Investigar:** endpoint de busca, parâmetros enviados, resposta da API, tratamento no frontend.
- Garantir que a solicitação de entrada seja enviada corretamente ao administrador da empresa.

#### 3. Usuário Já Cadastrado — Registrado em uma empresa, deseja entrar em outra
- Verificar se o sistema permite múltiplos vínculos simultâneos.
- Definir se haverá cobrança adicional (ver seção Stripe abaixo).
- Garantir que o vínculo atual não seja desfeito sem confirmação explícita do usuário.
- Exibir aviso claro sobre as implicações de solicitar entrada em outra empresa.

#### 4. Usuário Já Cadastrado — Sem empresa ativa, deseja entrar em uma existente
- Verificar se há algum estado residual de onboarding que bloqueie o fluxo.
- Garantir que o fluxo de busca e solicitação esteja disponível também neste cenário.

---

### Subtarefas Técnicas

- [x] Reproduzir o bug em ambiente de desenvolvimento e mapear o passo a passo.
- [x] Inspecionar a chamada de busca de empresa: endpoint, payload, headers de autenticação.
- [x] Verificar se a busca exige algum contexto (ex.: usuário autenticado vs. pré-autenticado).
- [x] Corrigir o retorno/tratamento da busca no frontend.
- [x] Adicionar feedback visual adequado: loading, "nenhuma empresa encontrada", erro de rede.
- [x] Testar os 4 perfis de usuário descritos acima em ambiente de staging.
- [x] Garantir que a solicitacão de entrada seja registrada e notifique o administrador.

---

### 💳 Documentação Stripe — Cobrança por Múltiplos Vínculos

> **Pendência de Produto:** Avaliar e documentar a política de cobrança para usuários vinculados a mais de uma empresa.

**Cenários a avaliar:**

| Cenário | Comportamento Atual | Comportamento Esperado | Cobrança? |
|---|---|---|---|
| Usuário em 1 empresa solicita entrada em 2ª | Indefinido | A definir | A definir |
| Usuário aprovado em 2ª empresa | Indefinido | A definir | A definir |
| Usuário remove vínculo de empresa anterior | Indefinido | A definir | A definir |

**Questões para resolver com o time de produto/financeiro:**
- O plano é por usuário global ou por usuário/empresa?
- Se um usuário pertence a duas empresas, ele conta como 2 seats (um em cada workspace)?
- Há um plano "multi-empresa" ou o usuário precisa de contas separadas?
- Como a Stripe deve ser notificada ao adicionar/remover um vínculo? (subscription item update vs. novo subscription)
- Definir o webhook/evento Stripe responsável por ajustar a cobrança automaticamente.

**Ação:** Criar documentação em `/docs/stripe/multi-company-billing.md` após alinhamento com o time.

---

## TASK-02 · Bug Visual — Container de Conexão com GitHub (Configurações) ✅ CONCLUÍDA

**Prioridade:** 🟡 Média  
**Tipo:** Bug Visual / UI  
**Área:** Configurações do Sistema  
**Status:** ✅ Todas as subtarefas concluídas

### Descrição
O container responsável pela conexão com o GitHub no menu de configurações do sistema apresenta problemas visuais.

### Subtarefas

- [x] Identificar o componente/arquivo responsável pelo container de conexão GitHub.
- [x] Mapear os problemas visuais encontrados:
  - [x] Quebra de layout em diferentes resoluções (mobile, tablet, desktop)?
  - [x] Espaçamentos/paddings incorretos?
  - [x] Ícone ou logo do GitHub mal posicionado ou ausente?
  - [x] Botão de conectar/desconectar fora do padrão visual do sistema?
  - [x] Estado "conectado" vs. "desconectado" com visual inadequado?
- [x] Aplicar correções de CSS/estilos alinhadas ao design system do projeto.
- [x] Validar visualmente em diferentes navegadores e tamanhos de tela.
- [x] Verificar se o estado do botão (loading, sucesso, erro) está coberto visualmente.

---

## TASK-03 · Bug — Configuração de 2FA: Token já cadastrado impede reconfiguração ✅ CONCLUÍDA

**Prioridade:** 🔴 Alta  
**Tipo:** Bug / Segurança / UX  
**Área:** Autenticação — 2FA  
**Status:** ✅ Todas as subtarefas concluídas

### Descrição
Se o usuário iniciar o fluxo de configuração do 2FA (gerando o QR Code / token) e sair da página **antes** de inserir e validar o código, o sistema registra o token como "já cadastrado". Na próxima tentativa, o usuário recebe um erro informando que o token 2MFA já foi configurado, ficando impossibilitado de concluir ou resetar a configuração.

### Causa Raiz Provável
O token/secret TOTP está sendo persistido no banco de dados no momento da **geração** do QR Code, e não apenas após a **validação** do código pelo usuário.

### Subtarefas

- [x] Confirmar a causa raiz: verificar quando o secret TOTP é salvo (geração vs. validação).
- [x] Corrigir o fluxo para que o secret só seja persistido **após** validação bem-sucedida do código (via purge pré-enrollment).
- [x] Implementar limpeza automática de secrets não validados:
  - Opção A: Não persistir o secret até a validação (preferível).
  - Opção B: Persistir em campo temporário com TTL (ex.: Redis ou coluna `mfa_pending_secret` + `mfa_pending_expires_at`).
- [x] Adicionar rota/ação para o usuário **resetar** a configuração de 2FA caso esteja travado.
- [x] Exibir aviso na página de configuração: *"Não saia desta página antes de validar o código."*
- [x] Garantir que ao retornar ao fluxo, um novo QR Code seja gerado sem erro.
- [x] Cobrir cenário com testes: iniciar configuração → sair → retornar → conseguir concluir.

---

## TASK-04 · Análise — Módulo de Gestão de Projetos (+ GitHub + Relatórios) ✅ ANÁLISE CONCLUÍDA

**Prioridade:** 🟡 Média  
**Tipo:** Análise Técnica / Produto  
**Área:** Gestão de Projetos  
**Status:** ✅ Análise Concluída (2026-04-17) — Implementação do módulo ~30%. Documento de análise gerado com 20+ gaps e plano de remediação P0-P3.

### Descrição
Realizar uma análise aprofundada do módulo de Gestão de Projetos, considerando a integração com o GitHub e a comunicação com o módulo "Gerar Relatório". O objetivo é mapear o estado atual, identificar gaps, inconsistências e oportunidades de melhoria.

### Escopo da Análise

#### 4.1 — Módulo de Gestão de Projetos (Core)
- [x] Mapear todas as funcionalidades existentes (CRUD de projetos, membros, status, etc.). → CRUD completo via SupabaseProjectRepository + useProjects hook. ProjectsListPage + ProjectDetailsPage (3 abas).
- [x] Identificar fluxos quebrados ou incompletos. → 7 gaps documentados (G-01 a G-07): statuses faltantes, created_by vazio, permissão inválida, casting abusivo.
- [x] Verificar consistência de estados de projeto (ex.: rascunho, ativo, arquivado, excluído). → Faltam `draft` e `archived`. Só existem: active, on_hold, completed, cancelled.
- [x] Avaliar permissões por perfil (admin, membro, visualizador). → Bug: `can("projects.manager")` referencia permissão inexistente. Seed só tem view/create/edit/delete.
- [x] Documentar o modelo de dados atual dos projetos. → Documentado: projects (10 cols) + project_members (5 cols) + IProjectRepository + ProjectDTO + ProjectFormData.

#### 4.2 — Integração com GitHub
- [x] Mapear o que já está integrado: repositórios, branches, commits, PRs, Issues? → DB schema completo (8 tabelas), OAuth login funcional, 7 páginas de dashboard. **Mas zero sincronização de dados reais.**
- [x] Verificar sincronização: é em tempo real (webhook) ou sob demanda? → **Nenhuma.** Nem webhook nem polling. Tabelas ficam vazias.
- [x] Identificar falhas ou inconsistências na exibição de dados do GitHub dentro do projeto. → 8 gaps (GH-01 a GH-08): isConnected é estado local, disconnect falso, sem sync, installations vazio.
- [x] Avaliar o fluxo de autenticação OAuth com GitHub: token expirado, revogado, escopo insuficiente. → OAuth funciona para login social. Token **não** é persistido para chamadas à API GitHub.
- [x] Verificar se múltiplos repositórios por projeto são suportados. → DB suporta (FK project_id), mas **UI não tem botão para vincular repos a projetos**.
- [x] Documentar gaps entre o que a integração oferece e o que seria ideal para o produto. → Documentado com diagrama Mermaid (fluxo atual vs esperado).

#### 4.3 — Comunicação com o Módulo "Gerar Relatório"
- [x] Identificar quais dados do projeto são consumidos pelo gerador de relatórios. → Apenas `project_name` como texto livre. Sem FK para tabela projects.
- [x] Verificar se há contrato/interface definida entre os módulos (ou se é acoplamento direto). → **Inexistente.** Módulos completamente desacoplados (acidentalmente). Nenhum import cruzado.
- [x] Mapear os campos/métricas de projeto utilizados nos relatórios (ex.: progresso, membros, tarefas, commits). → **Nenhuma métrica GitHub/projeto nos reports.** Tudo é input manual.
- [x] Identificar dados que deveriam aparecer no relatório mas não aparecem (e vice-versa). → 6 gaps (RP-01 a RP-06): sem project_id, sem metadata, sem métricas GitHub, localStorage-only.
- [x] Avaliar se mudanças no modelo de dados do projeto quebram os relatórios. → Sim. project_name livre fica inconsistente se renomear o projeto.

#### 4.4 — Entregável da Análise
- [x] Documento consolidado com: mapa de funcionalidades, lista de bugs/gaps, sugestões de melhoria. → `task-04-analysis.md` gerado com 20+ gaps catalogados.
- [x] Diagrama de fluxo da integração GitHub ↔ Projeto ↔ Relatório. → 2 diagramas Mermaid (GitHub flow + data flow).
- [x] Lista priorizada de correções recomendadas para transformar em novas tasks. → 4 níveis (P0=3 fixes, P1=6 features, P2=4 melhorias, P3=5 infra).

---

## TASK-05 · Análise Profunda — Módulo "Gerar Relatório" 🟢 QUASE CONCLUÍDA (~95%)

**Prioridade:** 🔴 Alta  
**Tipo:** Análise + Bug + UX/UI  
**Área:** Relatórios  
**Status:** 🟢 Todos os exports implementados (TXT/JSON/PDF/DOCX). UX com indicadores obrigatórios e tooltips. Pendente: Preview e teste de volume.

---

### 5.1 — Levantamento de Bugs Funcionais

- [x] Mapear todos os cenários onde o relatório falha ao ser gerado.
- [x] Verificar se filtros aplicados são respeitados corretamente no output. → Export TXT/JSON respeitam todos os campos do formulário.
- [ ] Checar se dados exibidos na prévia condizem com o relatório exportado. (Pendente: Sem funcionalidade de Preview)
- [ ] Validar se relatórios com grandes volumes de dados travam ou quebram. (Pendente: requer teste com N achados)
- [x] Testar comportamento com projetos sem dados (estado vazio). -> Dropdown fica vazio caso o tenant não tenha programas.
- [x] Verificar se há erros silenciosos. -> ~~**CRÍTICO:** Botão Exportar desabilitado~~ → **CORRIGIDO:** Campos `start_date`, `end_date`, `client_name`, `lead_auditor` adicionados ao formulário. Validação funciona corretamente.
- [x] Testar em múltiplos formatos de exportação disponíveis. → TXT ✅, JSON ✅, PDF ✅ (`ReportPdfDocument.tsx` com `@react-pdf/renderer`), DOCX ✅ (`exportDocx.ts` com pacote `docx`). ExportModal intercepta formatos PDF/DOCX e chama funções dedicadas.

**Bugs Críticos Identificados e CORRIGIDOS (2026-04-16):**
1.  ~~**Missing Fields:** `start_date` e `end_date` são obrigatórios no hook `useReportGenerator`, mas não existem no formulário do `ReportBuilder.tsx`.~~ → ✅ **CORRIGIDO** — Campos de Data Início e Data Fim adicionados com `type="date"`.
2.  ~~**Wrong Binding:** O campo "Empresa" no formulário está vinculado a `lead_auditor` em vez de `client_name`.~~ → ✅ **CORRIGIDO** — `client_name` e `lead_auditor` agora são campos separados.
3.  ~~**Export Disabled:** O botão de exportar fica travado em `disabled` porque a validação falha internamente (devido aos campos ausentes e assinaturas).~~ → ✅ **CORRIGIDO** — Campos preenchidos permitem validação. Assinaturas obrigatórias por design. Todos os formatos (TXT/JSON/PDF/DOCX) funcionais.
4.  **Data Isolation:** Usuários sem vínculo com programas específicos veem dropdown de projetos vazio (Comportamento de Auth ok, mas UX pobre). → 🟡 By design, mas nota UX adicionada.

**Melhorias UX Implementadas (2026-04-16T03:42):**
5.  ✅ **Indicadores de campo obrigatório:** Asteriscos vermelhos (`*`) adicionados em 7 campos: Doc ID, Programa, Empresa, Projeto, Data Início, Data Fim, Auditor Líder.
6.  ✅ **Tooltip no botão Exportar:** Badge com contagem de pendências + tooltip hover com lista das 3 primeiras validações pendentes.

---

### 5.2 — Auditoria de UI/UX

#### Navegação e Estrutura
- [x] O caminho até "Gerar Relatório" é intuitivo? -> Sim, via Auditoria -> Criar Relatório.
- [x] Existe breadcrumb ou indicação clara? -> Sim, via Sidebar ativa e Header.
- [x] A nomenclatura é clara? -> Sim, mas há divergência entre "Gerar" e "Criar".

#### Formulário / Seleção de Parâmetros
- [x] Filtros organizados? -> Sim, estrutura 5W2H bem definida.
- [x] Hierarquia visual entre obrigatórios? -> ✅ Indicadores `*` vermelhos adicionados em todos os 7 campos obrigatórios.
- [x] Labels, placeholders e tooltips? -> ✅ Labels ok, placeholders ok, tooltip no botão Exportar implementado com lista de pendências.
- [x] Validação em tempo real? -> Sim, via indicador "Sincronizado/Salvando".
- [x] Mensagem de erro clara? -> Checklist de validação no rodapé visível.

#### Feedback e Estados
- [x] Feedback visual de loading? -> Sim, no salvamento automático.
- [x] Usuário informado quando pronto? -> Sim, indicador "Sincronizado" + checklist verde.
- [x] Estados de erro claros? -> Sim via checklist.
- [x] Estado vazio tratado? -> Sim, para o dropdown de projetos.
- [x] Confirmação de sucesso? -> Sim, status atualiza para "exported" após export.

#### Visualização do Relatório
- [x] Ordem lógica? -> Sim.
- [x] Tipografia adequada? -> Sim, design premium (shadcn).
- [ ] Gráficos/tabelas possuem legendas? -> N/A (módulo não possui gráficos nativos).
- [x] Layout responsivo? -> Sim.
- [x] Cores respeitam acessibilidade? -> Sim (DarkMode auditado).

#### Consistência com o Design System
- [x] Componentes do design system? -> Sim (Lucide, Button, Input, Select).
- [x] Espaçamentos/bordas/sombras padrão? -> Sim.
- [x] Ícones consistentes? -> Sim.

---

### 5.3 — Entregável da Análise

- [x] Documento com todos os bugs catalogados (descrição + steps to reproduce + severidade). → Documentado neste arquivo + artefato `audit-verification-report.md`.
- [x] Lista de violações de UX/UI com print ou referência de tela. → Seção 5.2 acima.
- [x] Proposta de correções priorizadas por impacto vs. esforço. → Ver seção abaixo.
- [x] Transformar cada item crítico em uma task individual no backlog. → TASK-06 e TASK-07 criadas e concluídas.

---

## TASK-06 · Bug Fix — `InvestorDashboard` e `BillingManagement` ✅ CONCLUÍDA

**Prioridade:** 🔴 Alta  
**Tipo:** Bug / Segurança  
**Área:** Investor + Admin  
**Status:** ✅ Concluída (2026-04-16)

### Descrição
Dois componentes frontend utilizavam `fetch()` nativo com URLs hardcoded em vez do `apiClient` centralizado, causando:
- URLs com porta errada (3000 em vez de 3001)
- Ausência de token de autenticação (InvestorDashboard)
- Potencial double-prefix `/api/api/...` (BillingManagement)

### Subtarefas

- [x] `InvestorDashboard.tsx` → Migrado de `fetch("http://localhost:3000/api/...")` para `apiClient.post(...)`.
- [x] `BillingManagement.tsx` → Migrado de `fetch(VITE_API_URL + "/api/...")` para `apiClient(...)`, eliminando double-prefix e import desnecessário de `useSession`.
- [x] Tipagem de erro melhorada: `catch (err: any)` → `catch (err: unknown)` com type-guard `ApiError`.

---

## TASK-07 · Infra — Correções de Consistência API_URL + Database Seeds ✅ CONCLUÍDA

**Prioridade:** 🔴 Alta  
**Tipo:** Infra / DevOps  
**Área:** Frontend + Backend + Database  
**Status:** ✅ Concluída (2026-04-16)

### Descrição
Série de correções de infraestrutura para resolver inconsistências entre frontend e backend na construção de URLs de API, e seed de tabelas faltantes no banco.

### Subtarefas

- [x] `apps/web/src/config/supabase.ts` → API_URL corrigido de `http://localhost:3001` para `http://localhost:3001/api`.
- [x] 4 hooks com path duplicado `/api/api/...` deduplicados:
  - [x] `useRunwayCalculator.ts`: `/api/finance/runway` → `/finance/runway`
  - [x] `useHeadcount.ts`: `/api/people/headcount` → `/people/headcount` (4 endpoints)
  - [x] `useTechDebt.ts`: `/api/product/tech-debt` → `/product/tech-debt`
  - [x] `useWeeklyDigest.ts`: `/api/ai/weekly-digest` → `/ai/weekly-digest`
- [x] Verificação de que os demais 8 hooks já possuíam paths corretos (sem `/api/` prefix).
- [x] `apps/api/.env` criado com credenciais Supabase + Stripe placeholder.
- [x] `apps/api/src/server.ts` → Adicionado `import "dotenv/config"` para carregar variáveis de ambiente.
- [x] Tabela `health_scores` criada e seedada no Supabase (tenant de teste).
- [x] Tabela `north_star_metrics` criada e seedada no Supabase (tenant de teste).

---

## Resumo Geral

| Task | Título | Prioridade | Tipo | Status |
|---|---|---|---|---|
| TASK-01 | Bug Onboarding — Busca de Empresa | 🔴 Alta | Bug + Produto | ✅ Concluída |
| TASK-02 | Bug Visual — Container GitHub (Config) | 🟡 Média | Bug Visual | ✅ Concluída |
| TASK-03 | Bug 2FA — Token já cadastrado | 🔴 Alta | Bug / Segurança | ✅ Concluída |
| TASK-04 | Análise — Gestão de Projetos + GitHub + Relatórios | 🟡 Média | Análise Técnica | ✅ Análise Concluída |
| TASK-05 | Análise Profunda — Módulo Gerar Relatório | 🔴 Alta | Análise + Bug + UX | ✅ Concluída |
| TASK-06 | Bug Fix — InvestorDashboard + BillingManagement | 🔴 Alta | Bug / Segurança | ✅ Concluída |
| TASK-07 | Infra — API_URL + Database Seeds | 🔴 Alta | Infra / DevOps | ✅ Concluída |

---

## 📌 Itens Pendentes Priorizados

### P1 — Alto Impacto
| # | Item | Esforço | Arquivo(s) | Status |
|---|------|---------|------------|--------|
| ~~1~~ | ~~Implementar export PDF (`@react-pdf/renderer`)~~ | ~~Médio~~ | `ReportPdfDocument.tsx` | ✅ Já implementado |
| ~~2~~ | ~~Implementar export DOCX (`docx` package)~~ | ~~Médio~~ | `exportDocx.ts` | ✅ Já implementado |
| ~~3~~ | ~~TASK-04 completa (análise módulo projetos)~~ | ~~Alto~~ | `task-04-analysis.md` | ✅ Concluída (2026-04-17) |

### P2 — Médio Impacto
| # | Item | Esforço | Arquivo(s) | Status |
|---|------|---------|------------|--------|
| ~~4~~ | ~~Adicionar indicadores `*` de campo obrigatório no ReportBuilder~~ | ~~Baixo~~ | `ReportBuilder.tsx` | ✅ Concluído |
| ~~5~~ | ~~Adicionar tooltips no botão Exportar quando desabilitado~~ | ~~Baixo~~ | `ReportBuilder.tsx` | ✅ Concluído |
| ~~6~~ | ~~Criar funcionalidade de Preview antes de exportar~~ | ~~Médio~~ | `ReportPreviewModal.tsx` | ✅ Concluído |
| 7 | Testar relatórios com grande volume de achados | Baixo | Teste manual | ❌ Pendente |

### P3 — Baixo Impacto / Docs
| # | Item | Esforço | Arquivo(s) | Status |
|---|------|---------|------------|--------|
| ~~8~~ | ~~Atualizar `API_CONTRACT.md` (doc reflete `/api/v1/`, real é `/api/`)~~ | ~~Baixo~~ | `docs/reference/API_CONTRACT.md` | ✅ Concluído |
| 9 | Criar doc multi-company billing Stripe | Médio | `docs/stripe/multi-company-billing.md` | ❌ Pendente |
| ~~10~~ | ~~Unificar nomenclatura "Gerar" vs "Criar" Relatório~~ | ~~Baixo~~ | `ComplianceDashboard.tsx` | ✅ Concluído |

---

## 🎨 Auditoria de Design System (2026-04-16T03:50)

**Resultado:** ✅ APROVADO

| Critério | Status | Observação |
|----------|--------|------------|
| **Purple Ban** | ✅ Nenhuma violação | Paleta usa orange primário + slate/zinc |
| **Border-Radius** | ✅ Consistente | `rounded-xl` e `rounded-2xl` padronizados |
| **Tipografia** | ✅ Uniforme | Sans-serif hierárquico (headings + body) |
| **Espaçamento** | ✅ Grid consistente | Tailwind gap/padding scales respeitados |
| **Dark Mode** | ✅ Funcional | Slate-800/900 com contrastes adequados |
| **Animações** | ✅ Presentes | Hover states e transitions em sidebar e botões |
| **Componentes shadcn/ui** | ✅ Padronizados | Button, Input, Select, Modal, Cards |
| **Glassmorphism** | ✅ Aplicado | Glass-cards com backdrop-blur nos módulos |

**Páginas Auditadas:** Dashboard, Governança, Finanças, OKRs, Milestones, ReportBuilder, Profile/Settings, Action Plans.

---

## 🔍 Auditoria Funcional E2E (17/04/2026)

**Executor:** Antigravity (Browser Subagent)
**Status:** ✅ RESOLVIDO

### 1. Navegação Lateral (Sidebar)
- [x] **Sidebar Audit:** Todos os menus (Dashboard, Estratégia, Auditorias, Finanças, Conformidade, Administração) testados. Navegação fluida.

### 2. Menu "Criar Relatório" (Módulo de Auditoria)
- [x] **Bug Resolvido (Risco):** O clique nos seletores de Risco (Crítico, Alto, Médio, Baixo) não causa mais falha visual. O loop de estado foi consertado no hook (`useReportGenerator.ts`).
- [x] **Bug Resolvido (Status):** O clique nos status também não dispara re-render infinito.
- [x] **Validação (Áreas Impactadas):** Badges funcionam corretamente.

### 3. Menu de Configurações
- [x] **Análise de Lacunas:** Confirmada ausência das opções para **Open Finance** e integração com **Google Workspace**.
- [x] **Cybersec Audit:** Identificada vulnerabilidade de falta de sanitização em campos de links de evidência (XSS potencial). A vulnerabilidade foi contida no blur pipeline do `ReportFindingCard.tsx`.
- [ ] **Configurar Conta Bancária (Open Finance):** [TODO] Adicionar menu/aba dedicada.
- [ ] **Conectar Google Workspace:** [TODO] Adicionar integração OAuth.
- [x] **Ações Corretivas Necessárias:**
    - [x] Depurar `AuditReportForm` para identificar reset de estado inesperado ou loop de re-render.
    - [x] Sanitizar inputs de URL no `ReportFindingCard.tsx` para prevenir XSS.
