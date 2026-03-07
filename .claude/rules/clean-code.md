---
paths:
  - "**/*.{ts,tsx,js,jsx}"
---

# Clean Code — Padrões de Estilo Obrigatórios

## Princípios Fundamentais

1. **Código auto-documentável**: Nomes de variáveis, funções e classes devem explicar seu propósito. Evite comentários óbvios.
2. **Funções pequenas**: Máximo ~30 linhas. Se passar disso, extraia sub-funções.
3. **DRY (Don't Repeat Yourself)**: Extraia duplicações para funções utilitárias ou hooks compartilhados.
4. **KISS (Keep It Simple)**: Sempre prefira a solução mais simples que resolve o problema.
5. **Fail Fast**: Valide inputs no início da função e retorne/lance erros imediatamente.

## TypeScript

- **Strict mode**: `strict: true` no tsconfig. Zero `any` sem justificativa.
- **Tipagem explícita**: Interfaces para objetos complexos, type aliases para unions.
- **Enums proibidos**: Use `as const` objects ou union types.
- **Nullability**: Use optional chaining (`?.`) e nullish coalescing (`??`). Nunca `!` (non-null assertion) em produção.

## Naming Conventions

| Elemento                | Padrão                        | Exemplo                              |
| ----------------------- | ----------------------------- | ------------------------------------ |
| Variáveis/funções       | camelCase                     | `loadPrograms`, `isActive`           |
| Componentes React       | PascalCase                    | `AuditDashboard`, `RiskMatrix`       |
| Interfaces/Types        | PascalCase                    | `AuditProgram`, `FindingStatusCount` |
| Constantes globais      | UPPER_SNAKE_CASE              | `VALID_TRANSITIONS`, `RISK_SCORES`   |
| Arquivos de componente  | PascalCase                    | `AuditDashboard.tsx`                 |
| Arquivos de hook        | camelCase com prefixo `use`   | `useAuditPrograms.ts`                |
| Arquivos de tipo        | camelCase com sufixo `.types` | `audit.types.ts`                     |
| Arquivos de repositório | PascalCase com prefixo        | `SupabaseAuditRepository.ts`         |

## Imports

- Ordem: 1) React/libs externas, 2) Domínio (`@cogitari-platform/core`), 3) Módulos locais, 4) Types.
- Use path aliases quando disponíveis.
- Nunca importe de `../../../..` mais que 3 níveis. Refatore para um barrel export ou path alias.

## Formatação

- **Indentação**: 2 espaços.
- **Ponto e vírgula**: Obrigatório.
- **Aspas**: Double quotes para strings.
- **Trailing commas**: Sempre.
- **Linha máxima**: 100 caracteres (soft limit), 120 (hard limit).
- **Prettier**: Roda automaticamente via lint-staged no pre-commit.

## React Patterns

- **Functional components only**: Nunca use class components.
- **Hooks customizados**: Toda lógica de estado + side effects em hooks dedicados.
- **Memoização**: Use `useMemo` e `useCallback` apenas quando há evidência de re-render desnecessário. Não otimize prematuramente.
- **Keys**: Sempre use IDs estáveis. Nunca use array index como key em listas dinâmicas.
- **Error Boundaries**: Componentes críticos devem ter error boundaries.

## Zustand Stores

- Uma store por domínio (`auditStore`, `financeStore`).
- Stores armazenam apenas estado — nunca lógica de negócio.
- Actions da store são simples setters. Lógica complexa fica nos hooks.
