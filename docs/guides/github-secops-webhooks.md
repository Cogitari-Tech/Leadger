# GitHub SecOps & Governance - Webhook Configuration

Este documento descreve como configurar o GitHub App e os webhooks associados para habilitar a sincronização em tempo real de alertas de segurança e métricas de governança para o Supabase.

## 1. Configuração do GitHub App

Para integrar o Cogitari Governance com sua organização no GitHub, você precisa criar um GitHub App.

### Permissões Necessárias (Repository Permissions)

- **Administration**: `Read-only`
- **Code scanning alerts**: `Read-only`
- **Commit statuses**: `Read-only`
- **Contents**: `Read-only`
- **Dependabot alerts**: `Read-only`
- **Issues**: `Read & write` (Para poder abrir/fechar issues a partir dos achados)
- **Pull requests**: `Read & write`
- **Secret scanning alerts**: `Read-only`

### Permissões Necessárias (Organization Permissions)

- **Members**: `Read-only`
- **Administration**: `Read-only`

## 2. Configuração do Webhook

Configure o webhook do GitHub App para apontar para o seu Edge Function do Supabase.

1. **Webhook URL:** `https://<REF_ID>.supabase.co/functions/v1/github-webhook`
2. **Webhook Secret:** Gere uma string segura (ex: `openssl rand -hex 32`) e adicione tanto no GitHub App quanto nas secrets do Supabase (`supabase secrets set GITHUB_WEBHOOK_SECRET=<secret>`).

### Eventos a serem assinados (Subscribe to events)

- `Branch protection rule`
- `Code scanning alert`
- `Dependabot alert`
- `Issues`
- `Pull request`
- `Push`
- `Repository`
- `Secret scanning alert`
- `Security_and_analysis`

## 3. Variáveis de Ambiente no Supabase (Edge Functions)

As seguintes secrets precisam estar configuradas no projeto Supabase para que as funções do GitHub operem corretamente (via `.env` local ou `supabase secrets set`):

```bash
# Autenticação do App para realizar chamadas à API
GITHUB_APP_ID="seu-app-id"
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."

# Secret para validação do payload recebido via webhook
GITHUB_WEBHOOK_SECRET="sua-secret-gerada"
```

## 4. Fluxo de Recebimento (Como funciona o webhook)

1. Quando um evento ocorre no GitHub (ex: nova vulnerabilidade de Dependabot), o GitHub envia um payload `POST` para `github-webhook`.
2. A Edge Function valida a assinatura utilizando `GITHUB_WEBHOOK_SECRET`.
3. A função mapeia o `installation_id` para identificar o Tenant correto (via tabela `github_installations`).
4. Os dados atualizados são gravados/atualizados nas tabelas correspondentes (`github_security_alerts`, `github_issues`, etc.).
5. As UI do sistema, que utilizam reatividade em tempo real, refletem as alterações instantaneamente (ou no próximo recarregamento).
