---
paths:
  - "packages/core/**/*.ts"
  - "apps/web/src/modules/**/*.{ts,tsx}"
---

# Architecture — SOLID, Clean Arch, DDD

## Clean Architecture (Hexagonal / Ports & Adapters)

### Camada de Domínio (`packages/core/`)

O core é o coração do sistema. Ele contém:

- **Entities** (Aggregate Roots): Classes com factory methods (`create`, `fromPersistence`), validação no constructor, e métodos de comportamento. Ex: `AuditProgram`, `Transaction`.
- **Value Objects**: Objetos imutáveis que encapsulam lógica de comparação e validação. Ex: `RiskLevel`, `ComplianceScore`.
- **Repository Interfaces (Ports)**: Contratos puros (`IAuditRepository`, `IFinanceRepository`). NUNCA importam infra.
- **Use Cases**: Classes com um método `execute()` que orquestram entidades e repositórios. Ex: `CreateAuditProgram`.
- **Domain Events**: `EventBus` singleton com eventos concretos (`FindingCreatedEvent`, `AuditApprovedEvent`).
- **Domain Errors**: `DomainError` com severity + `AppError` para infra.

**O `package.json` do core NÃO PODE ter dependências externas. Zero imports de Supabase, React, ou qualquer lib de infra.**

### Camada de Infraestrutura (`apps/web/src/modules/*/repositories/`)

Adapters que implementam interfaces do core:

```typescript
// ✅ CORRETO: Adapter implementa interface do core
export class SupabaseAuditRepository implements IAuditRepository {
  constructor(private supabase: SupabaseClient) {}
  // ...
}
```

### Camada de Aplicação (`apps/web/src/modules/*/hooks/`)

Hooks customizados que atuam como Controllers/Presenters:

```typescript
// ✅ CORRETO: Hook instancia repositório e orquestra use cases
export function useFinance() {
  const repository = useMemo(() => new SupabaseFinanceRepository(supabase), []);
  const recordTransaction = new RecordTransaction(repository);
  // ...
}
```

## SOLID

### S — Single Responsibility

- Cada arquivo tem UMA responsabilidade.
- Hooks: um hook por feature/operação (`useAuditPrograms`, `useAuditFindings`).
- Se um componente ou hook ultrapassar ~200 linhas, decomponha.

### O — Open/Closed

- Use o `ModuleRegistry` para adicionar módulos sem modificar o core.
- Entidades usam tabelas de transição de estado (`VALID_TRANSITIONS`) — adicionar estados não requer mudar lógica existente.

### L — Liskov Substitution

- Repository adapters DEVEM ser substituíveis. Se trocarmos Supabase por outra infra, os Use Cases não devem mudar.

### I — Interface Segregation

- Repository interfaces devem ser segregadas por Aggregate Root. Prefira interfaces menores e coesas.
- Se uma interface tem >10 métodos, questione se ela pode ser dividida.

### D — Dependency Inversion

- Use Cases recebem interfaces via constructor injection — NUNCA instanciam implementações concretas.
- Hooks criam os adapters concretos e injetam nos Use Cases.

## Domain-Driven Design

### Bounded Contexts

Cada módulo (`audit`, `finance`, `compliance`, `github`) é um bounded context com seu próprio:

- Vocabulário de domínio (types, entities)
- Repositório
- Pages e hooks

### Aggregate Roots

Entidades que controlam invariantes de seu cluster:

- `AuditProgram` controla transições de status, validação de datas, e é a raiz para Findings e ActionPlans.
- `Transaction` controla validação de partidas dobradas e valores.

### Entity Patterns

```typescript
// ✅ Padrão para entidades de domínio
export class AuditProgram {
  private constructor(private props: AuditProgramProps) {
    this.validate(); // Validação no construtor
  }

  static create(input: CreateInput): AuditProgram {
    /* factory  */
  }
  static fromPersistence(data: Record<string, unknown>): AuditProgram {
    /* rehidratação */
  }

  toPersistence(): Record<string, unknown> {
    /* serialização */
  }

  transitionTo(newStatus: Status): void {
    /* comportamento com invariantes */
  }

  private validate(): void {
    /* validação de regras de negócio */
  }
}
```

## Design Patterns em Uso

| Pattern          | Onde                                 | Exemplo                                          |
| ---------------- | ------------------------------------ | ------------------------------------------------ |
| Repository       | `packages/core/repositories/`        | `IAuditRepository` → `SupabaseAuditRepository`   |
| Factory Method   | Entities                             | `AuditProgram.create()`, `AuditFinding.create()` |
| Facade           | `hooks/useAudit.ts`                  | Compõe 5 hooks atômicos em uma API unificada     |
| Observer         | `DomainEvent` + `EventBus`           | `FindingCreatedEvent` publicado e ouvido         |
| State Machine    | `AuditProgram.transitionTo()`        | Tabela de transições válidas                     |
| Module Pattern   | `ModuleRegistry`                     | Auto-registro com lifecycle hooks                |
| Singleton        | `EventBus`, `supabase` client        | Instância única global                           |
| Composition Root | `useFinance()`, `useAuditPrograms()` | Hooks compõem dependências                       |
