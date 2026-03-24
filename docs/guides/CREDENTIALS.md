# Credentials & Security Configuration

This document lists the required environment variables and security tokens for the Leadgers Platform.

## 1. GitHub Integration

Para que as automações de Auditoria de Código funcionem (análise de commits, PRs e issues):

1. **GITHUB_TOKEN**: Um Personal Access Token (PAT) ou token de GitHub App.
2. **Permissions**: O token deve ter permissões de `repo`, `workflow` e `admin:repo_hook`.
3. **Repository access**: "All repositories" ou selecione `Leadgers-Platform`.

## 2. Supabase / Database

Configurações centrais do banco de dados e autenticação:

- **NEXT_PUBLIC_SUPABASE_URL**: URL do projeto Supabase.
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Chave pública anônima.
- **SUPABASE_SERVICE_ROLE_KEY**: Chave de serviço (Backend/Edge Functions apenas).
- **DATABASE_URL**: String de conexão direta (PostgreSQL).

## 3. E2E & Testing Bypasses

Para automações complexas nas telas de Auth, o sistema detecta preferencialmente a navegação persistente caso a variável local exista no browser automatizado. Certas rotinas de Login automatizado só prosseguem sem timeout se você configurar antes (no setup stage via injeção JavaScript E2E) chaves contendo `leadgers_session_type` etc. Caso seja necessário, verifique em `.testing.credentials.md` (no root) atalhos e usuários dummy recomendados.
