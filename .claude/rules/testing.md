---
paths:
  - "**/*.test.{ts,tsx}"
  - "**/*.spec.{ts,tsx}"
  - "packages/core/**/*.ts"
---

# Testing — Estratégia de Testes

## Pirâmide de Testes

```
        /  E2E  \        ← Poucos, lentos, alto valor
       / Integração \     ← Moderados, hooks + Supabase
      /   Unitários    \  ← Muitos, rápidos, domínio puro
```

## Tipos de Teste

### 1. Unitários (Domínio — `packages/core/`)

Prioridade máxima. Testam entidades, VOs, use cases e domain events isoladamente.

```typescript
// ✅ Padrão AAA (Arrange-Act-Assert)
describe("AuditProgram", () => {
  it("should transition from draft to in_progress", () => {
    // Arrange
    const program = AuditProgram.create({ name: "Test", ... });

    // Act
    program.transitionTo("in_progress");

    // Assert
    expect(program.status).toBe("in_progress");
  });

  it("should throw on invalid transition", () => {
    const program = AuditProgram.create({ name: "Test", ... });

    expect(() => program.transitionTo("approved"))
      .toThrow("Cannot transition");
  });
});
```

### 2. Integração (Hooks — `apps/web/`)

Testam hooks com mocks de repositórios.

### 3. E2E (Scripts — `scripts/`)

Scripts automatizados que testam fluxos completos no browser.

- `scripts/e2e-user-registration.ts` — Fluxo de cadastro.
- `scripts/e2e-audit-menus.ts` — Navegação de menus de auditoria.

## Frameworks

- **Vitest**: Runner principal (`npm run test`).
- **Testing Library**: Para testes de componentes React (quando necessário).

## Comandos

```bash
npm run test          # Executa todos os testes
npm run test:watch    # Watch mode (packages/core)
npm run test:e2e      # Testes E2E
```

## Regras

1. **Testes de domínio são obrigatórios** para novas entidades, Value Objects e Use Cases.
2. **Cada Use Case deve ter pelo menos**: teste de sucesso, teste de validação falha, teste de edge case.
3. **Mocking**: Use mocks apenas para dependências externas (repositórios). Nunca mocke entidades de domínio.
4. **Naming**: `describe("NomeDoModulo")` → `it("should [ação] when [condição]")`.
5. **Coverage**: Almeje 80%+ no `packages/core`. Não force coverage em UI components.
