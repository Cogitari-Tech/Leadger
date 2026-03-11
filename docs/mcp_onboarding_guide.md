# Guia de Onboarding para Desenvolvedores - Leadgers Governance

Este documento descreve como configurar o ambiente de desenvolvimento local, incluindo os MCPs (Model Context Protocol) necessários para a automação de IA durante o processo de "Vibe Coding".

## 🚀 Início Rápido

1. Clone o repositório.
2. Copie o arquivo `mcp_config.example.json` para a pasta de configuração do seu agente de IA (ex: `.gemini/` ou `.claude/` conforme o caso).
3. Preencha as chaves de API necessárias no arquivo de configuração final.

## 🛠️ MCPs Configurados

O projeto utiliza uma série de MCPs para estender as capacidades do agente de IA. Abaixo estão as instruções exatas de onde obter cada chave e como configurar.

### 1. GitHub MCP (`server-github`)
- **Finalidade:** Permite que a IA realize operações de branch, commits, pull requests e auditoria de código diretamente.
- **Configuração:**
  - Gere um **Personal Access Token (PAT)** em [GitHub Settings > Tokens](https://github.com/settings/tokens).
  - Escopos necessários: `repo`, `admin:repo_hook`, `project`.
  - **Onde colar:** No campo `GITHUB_PERSONAL_ACCESS_TOKEN` no seu `mcp_config.json`.

### 2. Supabase MCP (`supabase-mcp-server`)
- **Finalidade:** Auditoria de banco de dados, comparação de schemas e execuções de SQL.
- **Configuração:**
  - Gere um **Supabase Access Token** em [Supabase Dashboard > Account Settings > Access Tokens](https://supabase.com/dashboard/account/tokens).
  - **Onde colar:** No argumento `--access-token` do servidor `supabase-mcp-server`.

### 3. StitchMCP (Stitch API)
- **Finalidade:** Geração de telas UI e design de alta fidelidade via IA.
- **Configuração:**
  - Solicite a `X-Goog-Api-Key` à equipe técnica ou gere no console do Google Cloud (se tiver permissão).
  - **Onde colar:** No header `X-Goog-Api-Key`.

### 4. Prisma e Redis
- **Prisma:** Já configurado para ler o arquivo `schema.prisma` local.
- **Redis:** Requer uma `REDIS_URL`. Recomendamos o [Upstash](https://upstash.com/) para desenvolvimento.

---

## 🔑 Gerenciamento de Segredos

> [!CAUTION]
> **NUNCA** faça commit do seu arquivo `mcp_config.json` ou de qualquer arquivo que contenha chaves reais. Estes arquivos estão no `.gitignore` por padrão.

### Estrutura de Placeholder para Novos Devs

Ao configurar um novo ambiente para um desenvolvedor, forneça apenas o arquivo `mcp_config.example.json`. O desenvolvedor deve:
1. Instalar as dependências globais via `npm install`.
2. Perguntar à equipe se há uma conta compartilhada ou se deve criar a sua própria para os serviços externos (GitHub, Supabase, etc.).

## 🤖 Como Pedir ao Agente para Configurar

Você pode colar o conteúdo do `mcp_config.example.json` no chat com o seu agente de IA e dar o seguinte prompt:

> "Configure meus MCPs de acordo com este template. Eu completarei as chaves de API manualmente nos placeholders indicados."

---

## 📅 Auditoria de Ambientes

O projeto mantém dois ambientes principais no Supabase:
- **Audit-Tool-Beta:** Ambiente de testes e novas features.
- **Audit-Tool-Prod:** Ambiente de produção com dados reais de clientes.

Utilize o MCP do Supabase para garantir que as migrações em `beta` estão prontas para subir para `prod` através da branch `main`.
