# Cogitari Platform - Arquitetura Modular

## 📁 Estrutura Completa do Projeto

```
cogitari-platform/
│
├── apps/
│   └── web/                                    # Frontend React
│       ├── src/
│       │   ├── main.tsx                       # Entry point
│       │   ├── App.tsx                        # Root component
│       │   ├── router.tsx                     # Lazy loading routes
│       │   │
│       │   ├── modules/                       # 🔥 MÓDULOS ISOLADOS
│       │   │   ├── auth/                      # 🔐 Gestão Auth & Multi-Tenant
│       │   │   │   ├── pages/
│       │   │   │   │   ├── RegisterPage.tsx
│       │   │   │   │   └── TeamManagement.tsx
│       │   │   │   ├── components/
│       │   │   │   │   └── OnboardingWizard.tsx
│       │   │   ├── audit/                     # Auditoria
│       │   │   │   ├── pages/
│       │   │   │   │   ├── AuditEditor.tsx
│       │   │   │   │   └── AuditList.tsx
│       │   │   │   ├── components/
│       │   │   │   │   ├── FindingCard.tsx
│       │   │   │   │   └── SignaturePanel.tsx
│       │   │   │   ├── hooks/
│       │   │   │   │   └── useAudit.ts
│       │   │   │   ├── services/
│       │   │   │   │   ├── auditService.ts
│       │   │   │   │   └── pdfGenerator.ts
│       │   │   │   ├── types/
│       │   │   │   │   └── audit.types.ts
│       │   │   │   └── module.config.ts       # ⚙️ Configuração do módulo
│       │   │   │
│       │   │   ├── finance/                   # 💰 NOVO: Módulo Financeiro
│       │   │   │   ├── pages/
│       │   │   │   │   ├── CashFlow.tsx
│       │   │   │   │   ├── BalanceSheet.tsx
│       │   │   │   │   └── FinanceDashboard.tsx
│       │   │   │   ├── components/
│       │   │   │   │   ├── TransactionTable.tsx
│       │   │   │   │   ├── ChartRevenue.tsx
│       │   │   │   │   └── AccountsTree.tsx
│       │   │   │   ├── hooks/
│       │   │   │   │   └── useFinance.ts
│       │   │   │   ├── services/
│       │   │   │   │   ├── financeService.ts
│       │   │   │   │   └── reportGenerator.ts
│       │   │   │   ├── types/
│       │   │   │   │   └── finance.types.ts
│       │   │   │   └── module.config.ts
│       │   │   │
│       │   │   ├── compliance/                # 📋 NOVO: Compliance/SWOT
│       │   │   │   ├── pages/
│       │   │   │   │   ├── SwotAnalysis.tsx
│       │   │   │   │   ├── RiskMatrix.tsx
│       │   │   │   │   └── PolicyManager.tsx
│       │   │   │   ├── components/
│       │   │   │   │   ├── SwotQuadrant.tsx
│       │   │   │   │   └── RiskHeatmap.tsx
│       │   │   │   └── module.config.ts
│       │   │   │
│       │   │   └── registry.ts                # 🔌 Plugin Registry
│       │   │
│       │   ├── shared/                        # Código compartilhado
│       │   │   ├── components/
│       │   │   │   ├── layout/
│       │   │   │   │   ├── Sidebar.tsx
│       │   │   │   │   ├── Header.tsx
│       │   │   │   │   └── ModuleNav.tsx
│       │   │   │   └── ui/                   # shadcn/ui components
│       │   │   ├── hooks/
│       │   │   │   ├── useAuth.ts
│       │   │   │   ├── useLocalStorage.ts
│       │   │   │   └── useSignature.ts
│       │   │   ├── utils/
│       │   │   │   ├── validators.ts
│       │   │   │   ├── formatters.ts
│       │   │   │   └── security.ts
│       │   │   └── types/
│       │   │       └── global.types.ts
│       │   │
│       │   ├── store/                         # Estado Global (Zustand)
│       │   │   ├── authStore.ts
│       │   │   ├── auditStore.ts
│       │   │   ├── financeStore.ts
│       │   │   └── index.ts
│       │   │
│       │   └── config/
│       │       ├── supabase.ts
│       │       └── constants.ts
│       │
│       ├── public/
│       │   └── logo-cogitari.svg
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── tsconfig.json
│
├── packages/
│   ├── core/                                  # Business Logic (Framework Agnostic)
│   │   ├── src/
│   │   │   ├── entities/                     # Domain Models
│   │   │   │   ├── Audit.ts
│   │   │   │   ├── Finding.ts
│   │   │   │   ├── Transaction.ts
│   │   │   │   └── Account.ts
│   │   │   ├── usecases/                     # Business Rules
│   │   │   │   ├── audit/
│   │   │   │   │   ├── CreateAudit.ts
│   │   │   │   │   ├── ValidateSignatures.ts
│   │   │   │   │   └── GeneratePDF.ts
│   │   │   │   └── finance/
│   │   │   │       ├── RecordTransaction.ts
│   │   │   │       ├── CalculateBalance.ts
│   │   │   │       └── GenerateBalanceSheet.ts
│   │   │   ├── repositories/                 # Interfaces (Ports)
│   │   │   │   ├── IAuditRepository.ts
│   │   │   │   └── IFinanceRepository.ts
│   │   │   └── errors/
│   │   │       └── DomainErrors.ts
│   │   └── package.json
│   │
│   ├── ui/                                    # Design System
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── DataTable.tsx
│   │   │   └── theme/
│   │   │       └── colors.ts
│   │   └── package.json
│   │
│   └── shared/                                # Utils
│       ├── src/
│       │   ├── validators/
│       │   │   ├── cpfValidator.ts
│       │   │   └── cnpjValidator.ts
│       │   ├── formatters/
│       │   │   ├── currency.ts
│       │   │   └── date.ts
│       │   └── security/
│       │       └── sanitizer.ts
│       └── package.json
│
├── supabase/                                  # Backend as a Service
│   ├── migrations/
│   │   ├── 20250101000000_create_audits.sql
│   │   ├── 20250101000001_create_findings.sql
│   │   ├── 20250101000002_create_transactions.sql
│   │   ├── 20250101000003_create_accounts.sql
│   │   └── 20250101000004_rls_policies.sql
│   ├── functions/                            # Edge Functions
│   │   ├── generate-pdf/
│   │   │   └── index.ts
│   │   └── send-notification/
│   │       └── index.ts
│   └── config.toml
│
├── e2e/                                       # Testes E2E
│   ├── audit.spec.ts
│   ├── finance.spec.ts
│   └── playwright.config.ts
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── package.json                               # Monorepo root
├── turbo.json                                 # Turborepo config
├── pnpm-workspace.yaml
├── .env.example
├── .gitignore
└── README.md
```

---

## 🎯 Princípios SOLID Aplicados

### 1️⃣ **Single Responsibility Principle (SRP)**

Cada módulo tem uma única responsabilidade:

- `audit/` → Gestão de auditorias
- `finance/` → Controle financeiro
- `compliance/` → Análises estratégicas

### 2️⃣ **Open/Closed Principle (OCP)**

Sistema aberto para extensão (novos módulos), fechado para modificação:

```typescript
// packages/core/src/usecases/audit/ValidateSignatures.ts
export class ValidateSignatures {
  constructor(private rules: ValidationRule[]) {}

  execute(audit: Audit): ValidationResult {
    return this.rules.reduce((result, rule) => rule.validate(audit, result), {
      valid: true,
      errors: [],
    });
  }
}

// Adicionar nova regra sem modificar a classe base:
const mondayRule = new MondayValidationRule();
const validator = new ValidateSignatures([mondayRule, signatureRule]);
```

### 3️⃣ **Liskov Substitution Principle (LSP)**

Interfaces claras para repositórios:

```typescript
// packages/core/src/repositories/IAuditRepository.ts
export interface IAuditRepository {
  save(audit: Audit): Promise<void>;
  findById(id: string): Promise<Audit | null>;
  findAll(): Promise<Audit[]>;
}

// Implementações intercambiáveis:
// - SupabaseAuditRepository
// - LocalStorageAuditRepository
// - MockAuditRepository (testes)
```

### 4️⃣ **Interface Segregation Principle (ISP)**

Interfaces específicas por funcionalidade:

```typescript
export interface IPDFGenerator {
  generate(content: string): Promise<Blob>;
}

export interface IEmailSender {
  send(to: string, subject: string, body: string): Promise<void>;
}

export interface IStorageProvider {
  upload(file: File, path: string): Promise<string>;
}
```

### 5️⃣ **Dependency Inversion Principle (DIP)**

Dependa de abstrações, não de implementações:

```typescript
// ❌ ERRADO (alto acoplamento):
class AuditService {
  private repo = new SupabaseRepository();
  async save(audit: Audit) {
    await this.repo.save(audit);
  }
}

// ✅ CORRETO (injeção de dependência):
class AuditService {
  constructor(private repo: IAuditRepository) {}
  async save(audit: Audit) {
    await this.repo.save(audit);
  }
}
```

---

## 🔌 Sistema de Plugins (Module Registry)

```typescript
// apps/web/src/modules/registry.ts
export interface ModuleConfig {
  id: string;
  name: string;
  icon: string;
  routes: RouteObject[];
  permissions: string[];
}

export const moduleRegistry = new Map<string, ModuleConfig>();

// Registrar módulos dinamicamente:
import auditConfig from "./audit/module.config";
import financeConfig from "./finance/module.config";

moduleRegistry.set("audit", auditConfig);
moduleRegistry.set("finance", financeConfig);

// Lazy loading no router:
export function createAppRouter() {
  const routes = Array.from(moduleRegistry.values()).flatMap(
    (module) => module.routes,
  );

  return createBrowserRouter(routes);
}
```

---

## 🗄️ Schema do Banco (PostgreSQL via Supabase)

```sql
-- Audits Table
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  project_name TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (EXTRACT(DOW FROM end_date) = 1), -- Monday check
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Findings Table
CREATE TABLE findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  risk_level TEXT CHECK (risk_level IN ('Crítico', 'Alto', 'Médio', 'Baixo')),
  status TEXT CHECK (status IN ('Pendente', 'Andamento', 'Concluído', 'Bloqueado')),
  impacts TEXT[], -- Array de impactos
  recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Finance: Accounts (Plano de Contas)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- Ex: 1.1.01 (Ativo Circulante - Caixa)
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('Ativo', 'Passivo', 'Receita', 'Despesa', 'Patrimônio')),
  parent_id UUID REFERENCES accounts(id),
  is_analytical BOOLEAN DEFAULT false -- Folha ou grupo
);

-- Finance: Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  description TEXT,
  account_debit UUID REFERENCES accounts(id),
  account_credit UUID REFERENCES accounts(id),
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Compliance: SWOT
CREATE TABLE swot_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  analysis_date DATE NOT NULL,
  strengths TEXT[],
  weaknesses TEXT[],
  opportunities TEXT[],
  threats TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (RLS)
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their audits"
  ON audits FOR SELECT
  USING (created_by = auth.uid());
```

---

## 🛡️ Segurança (Manter Privacy by Design)

```typescript
// shared/utils/security.ts
import DOMPurify from "isomorphic-dompurify";

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

// Validação de CNPJ
export const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length !== 14) return false;

  // Algoritmo de validação do CNPJ
  // (implementação completa omitida por brevidade)
  return true;
};

// Assinatura digital (mantém rastreabilidade)
export const generateSignature = (userId: string, action: string): string => {
  const timestamp = new Date().toISOString();
  return `${userId}:${action}:${timestamp}`;
};
```

---

## 📊 Exemplos de Novos Módulos

### Módulo Finance - Controle de Caixa

```typescript
// modules/finance/pages/CashFlow.tsx
export function CashFlow() {
  const { transactions, addTransaction } = useFinance();

  return (
    <div className="p-8">
      <h1>Fluxo de Caixa</h1>

      {/* Gráfico de entradas/saídas */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={transactions}>
          <Line type="monotone" dataKey="inflow" stroke="#10b981" />
          <Line type="monotone" dataKey="outflow" stroke="#ef4444" />
        </LineChart>
      </ResponsiveContainer>

      {/* Tabela de transações */}
      <TransactionTable transactions={transactions} />

      {/* Formulário de nova transação */}
      <TransactionForm onSubmit={addTransaction} />
    </div>
  );
}
```

### Módulo Compliance - SWOT

```typescript
// modules/compliance/pages/SwotAnalysis.tsx
export function SwotAnalysis() {
  const [swot, setSwot] = useState({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  });

  return (
    <div className="grid grid-cols-2 gap-4 p-8">
      <SwotQuadrant
        title="Forças"
        items={swot.strengths}
        color="green"
        onAdd={(item) => setSwot({...swot, strengths: [...swot.strengths, item]})}
      />
      <SwotQuadrant
        title="Fraquezas"
        items={swot.weaknesses}
        color="red"
      />
      <SwotQuadrant
        title="Oportunidades"
        items={swot.opportunities}
        color="blue"
      />
      <SwotQuadrant
        title="Ameaças"
        items={swot.threats}
        color="orange"
      />
    </div>
  );
}
```

---

## 🚀 Comandos para Início Rápido

```bash
# 1. Inicializar Monorepo (Turborepo)
npx create-turbo@latest cogitari-platform
cd cogitari-platform

# 2. Instalar dependências
pnpm install

# 3. Configurar Supabase
npx supabase init
npx supabase start

# 4. Rodar ambiente de desenvolvimento
pnpm dev

# 5. Rodar testes
pnpm test

# 6. Build para produção
pnpm build
```

---

## 📦 Migração do Código Legado

**Estratégia: Strangler Fig Pattern**

1. Manter SPA atual funcionando
2. Criar novos módulos em paralelo
3. Migrar feature por feature
4. Desativar partes antigas gradualmente

**Prioridade de Migração:**

1. ✅ Módulo Audit (já existe, refatorar)
2. 🆕 Módulo Finance (novo, implementar do zero)
3. 🆕 Módulo Compliance (novo, implementar do zero)
