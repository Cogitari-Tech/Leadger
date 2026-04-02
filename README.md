# 🏗️ Cogitari Platform - Documentação Completa de Arquitetura

**Sistema de Auditoria, Compliance e Gestão Financeira**  
**Cogitari Tech** (CNPJ: 64.460.886/0001-39)

---

## 📚 Índice de Documentação

Este repositório contém toda a especificação técnica para evolução da plataforma Leadgers de um SPA monolítico para uma arquitetura modular empresarial.

### 📖 Documentos Principais

| Documento                              | Descrição                                                       | Arquivo                                |
| -------------------------------------- | --------------------------------------------------------------- | -------------------------------------- |
| **ADR (Architecture Decision Record)** | Decisões arquiteturais finais, stack aprovada, MCPs necessários | `docs/00_architecture-decision-record.md` |
| **Estrutura do Projeto**               | Organização completa de pastas, módulos e pacotes               | `docs/01_project-structure.md`            |
| **System Architecture**                | Documentação profunda de Engenharia e Regras de Negócio (Fase 1)| `docs/02_system-architecture.md`          |
| **Workflow de Desenvolvimento**        | CI/CD, Testes e Segurança (Pre-commit)                          | `docs/03_development-workflow.md`         |
| **Guia de Migração**                   | Passo a passo para migrar do sistema legado                     | `docs/04_migration-guide.md`              |
| **Developer Experience (DX)**          | Usuários de teste, bypasses e shortcuts de Vibe Coding          | `docs/05_developer-experience.md`          |

### 💻 Exemplos de Código

| Arquivo                        | Descrição                                 |
| ------------------------------ | ----------------------------------------- |
| `module-registry.ts`           | Sistema de plugins para módulos dinâmicos |
| `finance-module-config.ts`     | Configuração do módulo financeiro         |
| `Transaction-entity.ts`        | Entidade de domínio (DDD)                 |
| `RecordTransaction-usecase.ts` | Caso de uso seguindo Clean Architecture   |
| `IFinanceRepository.ts`        | Interface do repositório (Port)           |
| `SupabaseFinanceRepository.ts` | Implementação Supabase (Adapter)          |
| `useFinance-hook.ts`           | Hook React customizado                    |
| `CashFlow-component.tsx`       | Componente completo de Fluxo de Caixa     |

---

## 🎯 Stack Tecnológica (100% Gratuita para MVP)

### Frontend

```
- React 18 + TypeScript
- Vite 5 (build tool)
- TailwindCSS + shadcn/ui
- Zustand (estado local)
- React Query (server state)
- React Router v6 (roteamento)
- Recharts (gráficos)
- SheetJS (Excel)
```

### Backend (Free Tier)

```
- Supabase Free Tier
  ├─ PostgreSQL (500MB storage)
  ├─ Auth (50k usuários)
  ├─ Storage (1GB arquivos)
  └─ Edge Functions (500k invocações/mês)
  💡 Limites: https://supabase.com/pricing
```

### DevOps (Free)

```
- npm workspaces (monorepo, sem Turborepo)
- Vitest (testes unitários)
- Playwright (testes E2E)
- GitHub Actions (2000 min/mês free)
- Vercel Free (unlimited projects)
```

---

## 🔌 Integração de Agentes IA e MCPs (Model Context Protocol)

**🚨 ATENÇÃO: NUNCA instale servidores MCP (`@modelcontextprotocol/...`) como dependências do projeto através do `npm install`.**
Os MCPs são ferramentas usadas pelo seu Agente de IA Local (Cursor, Gemini CLI, Claude Desktop, etc) e rodam nativamente via `npx` em ambientes isolados pela própria IDE/Agente. O `package.json` do projeto deve permanecer limpo.

### Visão Geral dos MCPs Utilizados
Para permitir que o seu Agente contribua eficientemente ("Vibe Coding") neste repositório mantendo o alto padrão da arquitetura e das interfaces, utilizamos as seguintes capacidades estendidas (MCP Servers):

1. **`filesystem`**: Concede ao Agente a capacidade de ler, criar e alterar o código deste repositório com precisão.
2. **`github`**: Permite ao Agente interagir com PRs, ler issues, reviews e versionar as mudanças implementadas.
3. **`supabase-mcp-server`**: Permite ao Agente inspecionar a modelagem do banco em tempo real, gerenciar migrations de DDL (como criar tabelas RLS) e rodar Edge Functions de forma acoplada.
4. **`prisma-mcp-server`**: Fornece análise profunda no Schema, visualização de dados e gerenciamento das tabelas.
5. **`vercel`**: Garante deploy automatizado e inspeção de deployments sob demanda pela IA.
6. **`StitchMCP` (Google Stitch)**: Agiliza a criação de protótipos UI baseados nos Guidelines nativos do projeto e gerencimento de componentes interativos.
7. **`context7` (Upstash)**: Consulta instantânea da documentação atualizada de bibliotecas externas (React, Shadcn, Tailwind, Supabase) mitigando o risco de alucinações.
8. **`memory`**: Persiste as memórias, regras de projetos arquiteturais e preferências de código na "cabeça" do Agente (Knowledge Graph).
9. **`redis`**: Integração de operações de cache e persistência (Upstash Redis) quando necessário.

### 🛠 Como Configurar o "Onboarding IA"

A configuração é projetada para ser "Plug and Play". Siga uma das duas opções:

#### Opção A: Configuração Automática (Recomendada)
Forneça o seguinte prompt de início (Vibe Coding) para o seu Agente/IDE:
> *"Agente, verifique o arquivo `mcp_config.example.json` na raiz do projeto e configure seus servidores MCP internos (sua IDE) usando essas definições. Avise-me quando concluir."*
Após ele carregar as configurações, basta você acessar as propriedades do seu Agente e colar as `API keys`.

#### Opção B: Configuração Manual
1. Copie o conteúdo de `mcp_config.example.json` (localizado na raiz).
2. Cole no arquivo de configurações de MCP do seu cliente (ex: `~/AppData/Roaming/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` se estiver no VSCode/Cline, ou na UI de configurações do Cursor/Claude Desktop).

### 🔑 Política de Chaves (API Keys)
O arquivo de template requer múltiplas chaves (Supabase Token, GitHub PAT, Vercel Auth, Google X-Goog-Api-Key e Upstash Redis).
- **Consulte a equipe ("Ask your team"):** Verifique no canal oficial da engenharia se existe um conjunto de API Keys compartilhadas para ambiente de `Desenvolvimento` ou de `Homologação`.
- Se as chaves compartilhadas não estiverem disponíveis, você deverá **criar contas gratuitas pessoais** nas plataformas correspondentes (Supabase, Vercel, Upstash, Google Cloud) para injetar as credenciais no seu agente de IA local.

---

## 🚀 Quick Start (5 minutos)

### Pré-requisitos

```bash
node --version  # 20+
npm --version   # 10+
git --version
```

### Instalação

```bash
# 1. Clonar repositório
git clone https://github.com/Cogitari-Tech/Leadgers-Platform.git
cd Leadgers-Platform

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais Supabase (Free Tier)

# 4. Iniciar Supabase local
npx supabase start

# 5. Aplicar migrations
npx supabase db reset

# 6. Rodar desenvolvimento
npm run dev

# Acessar: http://localhost:5173
```

### Verificar Instalação

```bash
# Testes unitários
npm test

# Testes E2E
npm run test:e2e

# Build para produção
npm run build
```

---

## 🤝 Contribuição e Segurança

- Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes de desenvolvimento.
- Consulte [SECURITY.md](SECURITY.md) para política de segurança e report de vulnerabilidades.

---

## 📁 Estrutura do Projeto

```
Leadgers-Platform/              # ⚠️ Repositório: https://github.com/Cogitari-Tech/Leadgers-Platform
│
├── apps/
│   └── web/                    # Frontend React
│       ├── src/
│       │   ├── modules/        # 🔥 Módulos de Negócio
│       │   │   ├── audit/      # Auditoria
│       │   │   ├── finance/    # Financeiro
│       │   │   ├── compliance/ # Compliance/SWOT
│       │   │   └── registry.ts # Plugin System
│       │   ├── shared/         # Componentes compartilhados
│       │   ├── store/          # Estado global (Zustand)
│       │   └── infrastructure/ # Adapters (Repositories)
│       └── package.json
│
├── packages/
│   ├── core/                   # Business Logic (Framework Agnostic)
│   │   ├── entities/           # Domain Models
│   │   ├── usecases/           # Business Rules
│   │   ├── repositories/       # Interfaces (Ports)
│   │   └── errors/
│   ├── ui/                     # Design System
│   └── shared/                 # Utils
│
├── supabase/
│   ├── migrations/             # SQL migrations
│   └── functions/              # Edge Functions (Free Tier: 500k/mês)
│
├── e2e/                        # Testes E2E (Playwright)
├── .github/workflows/          # CI/CD (GitHub Actions Free: 2000 min/mês)
├── package.json                # Monorepo root (npm workspaces)
└── .env.example                # Template de variáveis de ambiente
```

---

## 🧱 Princípios Arquiteturais

### 1. Clean Architecture

```
Camadas (de fora para dentro):
┌──────────────────────────────┐
│ UI (React Components)        │
├──────────────────────────────┤
│ Adapters (Repositories)      │
├──────────────────────────────┤
│ Use Cases (Business Logic)   │
├──────────────────────────────┤
│ Entities (Domain Models)     │
└──────────────────────────────┘

Regra: Camadas internas não conhecem camadas externas
```

### 2. SOLID

- **S**ingle Responsibility - Uma classe, uma responsabilidade
- **O**pen/Closed - Aberto para extensão, fechado para modificação
- **L**iskov Substitution - Interfaces intercambiáveis
- **I**nterface Segregation - Interfaces específicas
- **D**ependency Inversion - Dependa de abstrações

### 3. Plugin System

Adicionar novos módulos sem modificar o core:

```typescript
// 1. Criar módulo
// apps/web/src/modules/hr/module.config.ts
export const hrModuleConfig: ModuleConfig = {
  id: "hr",
  name: "RH",
  routes: [
    /* ... */
  ],
  permissions: ["hr.view"],
};

// 2. Registrar
// apps/web/src/modules/registry.ts
import hrModule from "./hr/module.config";
moduleRegistry.register(hrModule);

// 3. Pronto! O módulo aparecerá automaticamente na sidebar
```

---

## 💰 Módulos Implementados

### 1. Auditoria (Legado Refatorado)

- ✅ Criação de relatórios
- ✅ Registro de achados
- ✅ Sistema de assinaturas
- ✅ Validação de compliance
- ✅ Geração de PDF
- ✅ Integração Google Drive

### 2. Financeiro (Novo)

- 🆕 **Controle de Caixa**
  - Registro de transações (partida dobrada)
  - Gráfico de fluxo de caixa
  - Conciliação bancária
- 🆕 **Balanço Patrimonial**
  - Ativo, Passivo, Patrimônio Líquido
  - Visualização hierárquica
  - Comparativo multi-período
- 🆕 **DRE (Demonstração de Resultado)**
  - Receitas e Despesas
  - Análise de margem
  - Export para Excel

### 3. Compliance (Novo)

- 🆕 **Análise SWOT**
  - Quadrantes interativos
  - Análise cruzada (FO, FA, DO, DA)
  - Export para PPTX
- 🆕 **Matriz de Riscos**
  - Heatmap 5x5
  - Cadastro de riscos
  - Planos de mitigação

### 4. Gestão de Contas (Multi-Tenant)

- 🆕 **Onboarding e Organizações**
  - Criação de slugs únicos (`cogitari-tech`) para workspaces.
  - Wizard guiado passo a passo para configuração de Empresa.
  - Painel de aprovação pendente para novos membros.
- 🆕 **RBAC (Role-Based Access Control) & Equipe**
  - Hierarquia estrita: Owner, Admin, Manager, Auditor, Viewer.
  - Gestão de membros, solicitações de acesso e perfis.
  - Envio de Links de Convite seguros (hashed tokens).
- 🆕 **Configurações Administrativas**
  - Cadastro interativo de Contas Bancárias no sistema.
- 🆕 **Segurança e Login**
  - Persistência de sessão configurável ("Mantenha-me conectado" com `localStorage`/`sessionStorage`).
  - Autenticação em Duas Etapas (TOTP) com "Lembrar dispositivo" (Trust Token 30 dias).
  - Proteção Anti-Bot inteligente com Cloudflare Turnstile (modo Managed).

---

## 🧪 Estratégia de Testes

### Unit Tests (Vitest)

```bash
# Testar lógica de negócio isoladamente
npm test

# Com cobertura
npm run test:coverage

# Watch mode
npm run test:watch
```

### Integration Tests

```bash
# Testar integração com Supabase
npm run test:integration
```

### E2E Tests (Playwright)

```bash
# Testar fluxos completos
npm run test:e2e

# Com interface gráfica
npm run test:e2e -- --ui

# Debug mode
npm run test:e2e -- --debug
```

**Meta de Cobertura:** 90%+ no core, 70%+ nos adapters

---

## 🔒 Segurança

### Row Level Security (RLS)

```sql
-- Usuários só veem seus próprios dados
CREATE POLICY "Users see own audits"
  ON audits FOR SELECT
  USING (created_by = auth.uid());

-- Admins veem tudo
CREATE POLICY "Admins see all"
  ON audits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
```

### Sanitização de Inputs

```typescript
import DOMPurify from "isomorphic-dompurify";

export const sanitize = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};
```

### Validação de CNPJ

```typescript
export const validateCNPJ = (cnpj: string): boolean => {
  // Algoritmo oficial da Receita Federal
  // (ver implementação completa em shared/validators)
};
```

---

## 📊 Métricas de Performance

### Targets

| Métrica                | Target | Ferramenta |
| ---------------------- | ------ | ---------- |
| First Contentful Paint | <1.8s  | Lighthouse |
| Time to Interactive    | <3.8s  | Lighthouse |
| Bundle Size            | <200KB | Vite       |
| Lighthouse Score       | >90    | CI         |

### Otimizações Implementadas

- ✅ Lazy loading de módulos
- ✅ Code splitting por rota
- ✅ React Query para cache (5min stale time)
- ✅ Virtualização de listas longas
- ✅ Compressão Brotli no deploy

---

## 🚢 Fluxo de Branches e Deploy

### Estrutura de Branches

```
main (produção) ← PR ← beta (homologação) ← PR ← develop (integração) ← PR ← <nickname> (feature/fix)
                         ↑
                         └─ hotfix (correções urgentes)
```

### Fluxo Completo

#### 1️⃣ Desenvolvimento Local

```bash
# Criar branch local com seu nickname
git checkout -b joao

# Desenvolver feature
git add .
git commit -m "feat: implementa módulo financeiro"

# Push para branch remota com mesmo nome
git push origin joao
```

#### 2️⃣ Integração (develop)

```bash
# Abrir PR: joao → develop
# ✅ GitHub Actions roda testes automatizados
# ✅ Code review obrigatório
# ✅ Merge após aprovação
```

**GitHub Actions (develop):**

- ✅ Lint (ESLint + Prettier)
- ✅ Type check (TypeScript)
- ✅ Unit tests (Vitest)
- ✅ Build test

#### 3️⃣ Homologação (beta)

```bash
# Abrir PR: develop → beta
# ✅ Deploy automático para staging
# ✅ Testes manuais pela equipe de QA
# ✅ Validação de funcionalidades
```

**Ambiente Beta:**

- 🌐 URL: `https://beta.leadgers.com` (Vercel Free)
- 🗄️ Database: Supabase project separado (Free Tier)

#### 4️⃣ Correção de Bugs (hotfix)

```bash
# Se encontrado bug em beta:
git checkout -b hotfix/corrige-validacao
git push origin hotfix/corrige-validacao

# Abrir PR: hotfix/corrige-validacao → beta
# Após merge, deletar branch hotfix
```

#### 5️⃣ Produção (main)

```bash
# Abrir PR: beta → main
# ✅ Aprovação do Tech Lead obrigatória
# ✅ Deploy automático para produção
# ✅ Tag de release criada automaticamente
```

**Ambiente Produção:**

- 🌐 URL: `https://app.leadgers.com` (Vercel Free + domínio custom)
- 🗄️ Database: Supabase produção (Free Tier)

### Comandos Git Úteis

```bash
# Desenvolvimento (local → remota)
git push origin <seu-nickname>

# Integração (develop)
gh pr create --base develop --head <seu-nickname> --title "feat: nova feature"

# Homologação (beta)
gh pr create --base beta --head develop --title "Release v1.2.0"

# Correção (hotfix → beta)
gh pr create --base beta --head hotfix/<nome> --title "fix: corrige bug crítico"

# Produção (main)
gh pr create --base main --head beta --title "Production Release v1.2.0"
```

### CI/CD Automático (GitHub Actions Free)

**Limites Gratuitos:**

- ✅ 2000 minutos/mês
- ✅ Workflows ilimitados
- ✅ Concurrent jobs: 20

**Triggers:**

```yaml
# .github/workflows/ci.yml
on:
  pull_request:
    branches: [develop, beta] # Hotfixes & Features
```

---

## 🗺️ Roadmap & Progresso

### ✅ Q1 2026 (Fundação e Fase 1)

- [x] Análise do sistema legado e definição de arquitetura
- [x] Setup do monorepo, Turborepo, Supabase e Hono API
- [x] Autenticação Multi-Tenant, Sistema de Permissões (RBAC)
- [x] **Milestone Tracker**: Rastreamento de objetivos estratégicos e OKRs
- [x] **Alertas Preditivos**: Job contínuo (Inngest) monitorando runway e anomalias
- [x] **Weekly Digest**: Relatório executivo via IA (LLM) enviado semanalmente
- [x] **Equity & Vesting (Cap Table)**: Controle de stock options, cliff period e pools ESOP
- [x] **Roadmap Visual**: Board Kanban estratégico e Timeline com importação do GitHub
- [x] **Dashboard Executivo**: Visão holística (Health Score, Auditorias, Compliance)

### 🔄 Q2 2026 (Expansão Fase 2)

- [ ] Integração Avançada de Inteligência Artificial para Compliance
- [ ] Módulo completo de Folha de Pagamento e Integração Bancária (Open Finance)
- [ ] Auditoria Automatizada Contínua
- [ ] Testes automatizados refinados (Playwright & Vitest) para os novos módulos

### 📅 Q3 2026 (Planejado)

- [ ] Mobile app (React Native / Expo)
- [ ] Workflow Builder visual para políticas internas
- [ ] Previsão de Churn e Forecast via Machine Learning Avançado

### 🔮 Q4 2026 (Futuro)

- [ ] Integração nativa com ERPs Enterprise (SAP, TOTVS)
- [ ] Deploy multi-cloud e Infra as Code Refinada (Terraform)
- [ ] White-label SaaS (Subdomínios customizados integrados à Vercel)

---

## 👥 Equipe

| Papel  | Responsável    | Email                |
| ------ | -------------- | -------------------- |
| CTO    | @xXYoungMoreXx | morekaik27@gmail.com |
| DevOps | @Wesbonf       | devops@leadgers.com  |

---

## 📞 Suporte

### Bugs e Issues

🐛 GitHub Issues: https://github.com/Cogitari-Tech/Leadgers-Platform/issues

### Emergências

📧 Email: devops@leadgers.com

---

## 📄 Licença

**Proprietário** - Copyright © 2026 Cogitari Tech (CNPJ: 64.460.886/0001-39)  
Uso interno restrito. Distribuição não autorizada é proibida.

---

## 🎓 Recursos de Aprendizado

### Vídeos

- [ ] Arquitetura do Sistema (20min)
- [ ] Como Criar um Módulo (15min)
- [ ] Testes com Vitest e Playwright (25min)

### Documentação Externa

- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Supabase Docs](https://supabase.com/docs)
- [React Query Guide](https://tanstack.com/query/latest)

---

## 🧪 Ambiente de Teste (Live Q.A.)

Para testes rápidos em ambiente de produção ou homologação:

| Usuário                              | Senha               | Função             | Comportamento             |
| ------------------------------------ | ------------------- | ------------------ | ------------------------- |
| `teste@leadgers.com`                 | `Cogitari@2026!Dev` | Admin (Auditoria)  | Estático (Persistente)    |
| `qa_vibe_test@leadgers.com`          | `Cogitari@2026!Dev` | Novo Registro      | **Auto-Removível** (LImpa ao Sair) |
| `test_removivel@leadgers.com`        | `Cogitari@2026!Dev` | Teste de Cadastro  | **Auto-Removível** (Limpa ao Sair) |

> 💡 **Dica:** Use o e-mail `qa_vibe_test@leadgers.com` se quiser testar o fluxo de registro e onboarding do zero repetidas vezes. O sistema apagará os dados deste usuário e de sua organização assim que você clicar em "Sair" do dashboard.

---

**Cogitari Tech** - Construindo o futuro da auditoria e gestão empresarial. 🚀

_Última atualização: 02 de Abril de 2026_
