# 🏗️ Cogitari Platform - Documentação Completa de Arquitetura

**Sistema de Auditoria, Compliance e Gestão Financeira**  
**Cogitari Tech** (CNPJ: 64.460.886/0001-39)

---

## 📚 Índice de Documentação

Este repositório contém toda a especificação técnica para evolução da plataforma Cogitari de um SPA monolítico para uma arquitetura modular empresarial.

### 📖 Documentos Principais

| Documento                              | Descrição                                                       | Arquivo                                |
| -------------------------------------- | --------------------------------------------------------------- | -------------------------------------- |
| **ADR (Architecture Decision Record)** | Decisões arquiteturais finais, stack aprovada, MCPs necessários | `docs/architecture-decision-record.md` |
| **Estrutura do Projeto**               | Organização completa de pastas, módulos e pacotes               | `docs/project-structure.md`            |
| **Guia de Migração**                   | Passo a passo para migrar do sistema legado                     | `docs/migration-guide.md`              |
| **Workflow de Desenvolvimento**        | CI/CD, Testes e Segurança (Pre-commit)                          | `docs/development-workflow.md`         |

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

## 🔌 MCPs (Model Context Protocols) Necessários

```bash
# 1. Filesystem - Manipulação de arquivos
npm install @modelcontextprotocol/server-filesystem

# 2. GitHub - Versionamento e CI/CD
npm install @modelcontextprotocol/server-github

# 3. Supabase - Backend (Free Tier)
npm install @supabase/supabase-js

# 4. PostgreSQL - Queries diretas
npm install @modelcontextprotocol/server-postgres

# 5. Playwright - Testes E2E
npm install -D @playwright/test

# Nota: Todas as dependências são gratuitas!
```

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
git clone https://github.com/Cogitari-Tech/Audit-Tool.git
cd Audit-Tool

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
Audit-Tool/                     # ⚠️ Repositório: https://github.com/Cogitari-Tech/Audit-Tool
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

- 🌐 URL: `https://beta-audit-tool.vercel.app` (Vercel Free)
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

- 🌐 URL: `https://app.cogitari.com.br` (Vercel Free + domínio custom)
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

## 🗺️ Roadmap

### ✅ Q1 2026 (Concluído)

- [x] Análise do sistema legado
- [x] Definição de arquitetura
- [x] Setup do monorepo

### 🔄 Q2 2026 (Em Andamento)

- [ ] Migração módulo Auditoria
- [ ] Implementação módulo Financeiro
- [ ] Testes automatizados

### 📅 Q3 2026 (Planejado)

- [ ] Implementação módulo Compliance
- [ ] Dashboard executivo
- [ ] Mobile app (React Native)

### 🔮 Q4 2026 (Futuro)

- [ ] Integração com ERPs (SAP, TOTVS)
- [ ] IA para análise de riscos
- [ ] Multi-tenancy (SaaS)

---

## 👥 Equipe

| Papel  | Responsável    | Email                |
| ------ | -------------- | -------------------- |
| CTO    | @xXYoungMoreXx | morekaik27@gmail.com |
| DevOps | @Wesbonf       | devops@amuri.app     |

---

## 📞 Suporte

### Bugs e Issues

🐛 GitHub Issues: https://github.com/Cogitari-Tech/Audit-Tool/issues

### Emergências

📧 Email: devops@amuri.app

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

**Cogitari Tech** - Construindo o futuro da auditoria e gestão empresarial. 🚀

_Última atualização: 16 de Fevereiro de 2026_
