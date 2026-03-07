# Git Workflow — Branches, Commits, PRs

## Branch Strategy (GitFlow Simplificado)

```
main        ← Produção. Deploy automático via Vercel.
  ↑
beta        ← Staging/Homologação. Preview deployments.
  ↑
develop     ← Branch base de desenvolvimento.
  ↑
moredev     ← Branch de trabalho ativa do desenvolvedor.
  ↑
feature/*   ← Branches de feature (quando necessário).
```

### Fluxo de Deploy

1. Commitar e push para `moredev`.
2. PR `moredev` → `develop`. Aguardar checks do Vercel.
3. Merge aprovado → PR `develop` → `beta`. Aguardar checks.
4. Merge aprovado → PR `beta` → `main`. Deploy em produção.

**NUNCA faça push direto para `main`, `beta` ou `develop`.**

## Commits (Conventional Commits)

Formato: `type(scope): description`

### Types

| Type       | Quando usar                              |
| ---------- | ---------------------------------------- |
| `feat`     | Nova feature ou funcionalidade           |
| `fix`      | Correção de bug                          |
| `refactor` | Refatoração sem mudança de comportamento |
| `style`    | Formatação, espaçamento (sem lógica)     |
| `docs`     | Documentação                             |
| `test`     | Adição/modificação de testes             |
| `chore`    | Manutenção, deps, config                 |
| `perf`     | Otimização de performance                |
| `ci`       | CI/CD, GitHub Actions                    |
| `security` | Correção de vulnerabilidade              |

### Scopes Comuns

`auth`, `audit`, `finance`, `compliance`, `github`, `admin`, `landing`, `onboarding`, `design`, `deps`, `config`

### Exemplos

```
feat(audit): add risk matrix visualization
fix(auth): handle SSO redirect for users without tenant
refactor(finance): extract account balances to dedicated hook
chore(deps): upgrade framer-motion to v11
security(auth): enforce MFA for admin roles
```

### Regras

- Mensagem em **inglês**.
- Primeira linha: máximo 72 caracteres.
- Corpo opcional: explique o "porquê", não o "o quê" (o diff mostra o quê).
- Referência issues quando aplicável: `Closes #42`.

## Pre-commit Hooks (Husky + lint-staged)

Executados automaticamente em todo commit:

1. `npm run security-check` — Scan de secrets e vulnerabilidades.
2. `prettier --write` — Formatação automática de `.ts`, `.tsx`, `.js`, `.jsx`.

Se o security check falhar, o commit é **bloqueado**.

## Pull Requests

- Título segue Conventional Commits.
- Body descreve: o que mudou, por que mudou, como testar.
- PRs devem passar nos checks do Vercel (build + deploy preview) antes de merge.
- PRs de `moredev` → `develop` podem ser self-merged após checks.
- PRs para `main` devem ter validação extra.
