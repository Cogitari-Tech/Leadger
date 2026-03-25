---
paths:
  - "**/*.{ts,tsx,js,jsx}"
  - "supabase/**/*"
  - ".env*"
---

# Security — Security First / Secure by Design

## Princípios

1. **Zero Trust**: Nunca confie em dados do client-side. Toda validação crítica é feita no backend (Supabase RLS + Edge Functions).
2. **Least Privilege**: Cada role tem apenas as permissões estritamente necessárias.
3. **Defense in Depth**: Múltiplas camadas de proteção (Cloudflare Turnstile + Supabase Auth + RLS + MFA).
4. **Fail Secure**: Em caso de dúvida, negue acesso.

## Autenticação e Autorização

- **Supabase Auth**: Email/senha + OAuth (Google, GitHub).
- **MFA**: TOTP nativo do Supabase. Obrigatório para roles sensíveis.
- **Turnstile**: Cloudflare CAPTCHA em login/register para mitigar bots.
- **RLS (Row Level Security)**: TODAS as tabelas possuem RLS habilitado. Dados são filtrados por `tenant_id` automaticamente pelo banco.
- **RBAC**: Roles (`owner`, `admin`, `auditor`, `viewer`) mapeadas a permissions granulares via `role_permissions`.

## Secrets e Variáveis de Ambiente

- **NUNCA** commite `.env`, `.env.beta`, `.env.production`. Apenas `.env.example`.
- **NUNCA** exponha `SUPABASE_SERVICE_ROLE_KEY` no client-side. Esta key só é usada em Edge Functions.
- Variáveis do client-side DEVEM ter prefixo `VITE_` para serem expostas pelo Vite.
- O pre-commit hook executa `scripts/security-scan.js` para detectar leaks.

## Input Validation

- Valide inputs no domínio (entities com `validate()` no constructor).
- Sanitize inputs de formulários antes de salvar.
- Use `encodeURIComponent()` para parâmetros de URL.
- Nunca use `dangerouslySetInnerHTML` sem sanitização.

## Supabase Edge Functions

- User-Agent: `Leadgers-Audit/1.0`.
- Validar `Authorization` header em toda Edge Function.
- Rate limiting via headers Supabase.
- Log de auditoria para operações sensíveis.

## Headers de Segurança (Vercel)

O `vercel.json` já configura:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Checklist Antes de Deploy

- [ ] `npm run security-check` sem warnings.
- [ ] Nenhum `.env` commitado.
- [ ] Nenhuma API key hardcoded.
- [ ] RLS verificado para novas tabelas.
- [ ] MFA enforcement para roles admin.
- [ ] Turnstile ativo em forms de auth.
