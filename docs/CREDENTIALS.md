# 🔐 Guia de Credenciais e Configuração de Ambiente

Este documento descreve detalhadamente todas as credenciais necessárias para executar o projeto **Cogitari Governance Platform**, tanto localmente quanto nos ambientes Beta e Produção.

> **⚠️ IMPORTANTE**: Nunca commite arquivos `.env` reais no Git. Use apenas `.env.example` como modelo.

---

## 1. Supabase (Backend & Database)

O Supabase fornece o banco de dados PostgreSQL, autenticação e APIs em tempo real.

### Credenciais Necessárias

| Variável                    | Descrição                              | Onde encontrar?                                           |
| --------------------------- | -------------------------------------- | --------------------------------------------------------- |
| `VITE_SUPABASE_URL`         | URL pública da API REST                | Dashboard > Settings > API > Project URL                  |
| `VITE_SUPABASE_ANON_KEY`    | Chave pública (segura para Frontend)   | Dashboard > Settings > API > `anon` public                |
| `SUPABASE_SERVICE_ROLE_KEY` | **SECRETA**: Acesso admin (ignora RLS) | Dashboard > Settings > API > `service_role` secret        |
| `MCP_SERVER_POSTGRES_DSN`   | String de conexão direta com DB        | Dashboard > Settings > Database > Connection String > URI |

### Como obter:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard).
2. Selecione o projeto (Beta: `audit-tool-beta`, Prod: `audit-tool-prod`).
3. Vá para **Project Settings** (ícone de engrenagem).
4. Para chaves de API: Clique em **API**.
5. Para Banco de Dados: Clique em **Database** → **Connection String**.

> **Nota para MCP**: O `SUPABASE_SERVICE_ROLE_KEY` é muitas vezes necessário para ferramentas de IA/MCP que precisam administrar o banco ou ignorar políticas de segurança para manutenção.

---

## 2. GitHub

Necessário para que ferramentas de automação (MCP) e scripts interajam com o repositório.

### Credenciais Necessárias

| Variável       | Descrição                     | Onde encontrar?                        |
| -------------- | ----------------------------- | -------------------------------------- |
| `GITHUB_TOKEN` | Personal Access Token (PAT)   | GitHub > Settings > Developer settings |
| `GITHUB_ACTOR` | Seu nome de usuário do GitHub | Seu perfil                             |

### Como obter o `GITHUB_TOKEN` (Passo a Passo):

Recomendamos um **Classic Token** para maior compatibilidade com ferramentas de CLI antigas, ou **Fine-grained** para segurança.

#### Opção A: Token Clássico (Mais compatível)

1. Vá para [Developer Settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens).
2. Clique em **Generate new token (classic)**.
3. **Note**: Dê um nome descritivo (ex: "Cogitari Governance MCP").
4. **Expiration**: Defina para 30 ou 90 dias (ou "No expiration" se for para máquina segura).
5. **Scopes (Permissões)** - Marque estas caixas:
   - [x] `repo` (Acesso total a repositórios privados)
   - [x] `workflow` (Para acionar GitHub Actions)
   - [x] `read:user`
   - [x] `project` (Se usar GitHub Projects)
6. Clique em **Generate token**.
7. **COPIE IMEDIATAMENTE**. Você não verá esse token novamente.

#### Opção B: Fine-grained Token (Mais seguro)

1. Vá para [Personal access tokens > Fine-grained tokens](https://github.com/settings/tokens?type=beta).
2. **Resource owner**: Sua conta ou organização (Cogitari-Tech).
3. **Repository access**: "All repositories" ou selecione `Amuri-Audit`.
4. **Permissions**:
   - `Contents`: Read and Write
   - `Metadata`: Read-only
   - `Actions`: Read and Write (se precisar rodar workflows)
   - `Pull Requests`: Read and Write

## 3. Google Cloud (Em breve)

**Status:** Programado (Pós-MVP).
Em breve teremos a funcionalidade de **salvar os relatórios gerados diretamente no Google Drive**.
Isto implicará possivelmente no uso de novas variáveis de ambiente, tais como `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` (se usarmos um repositório centralizado da empresa) ou a adição de escopos extras ao Supabase (se usarmos o Drive do próprio auditor).

> Para detalhes de configuração dos Aplicativos de Login Social (OAuth) atuais, consulte o arquivo `oauth-2fa-setup.md`.

---

## 4. Estrutura dos Arquivos `.env`

Cada arquivo deve seguir este padrão. Copie do `.env.example` e preencha.

### `.env.beta` / `.env.production`

Arquivos mestres que guardam as credenciais reais de cada ambiente (MANTENHA SEGURO).

```ini
# Supabase - Frontend
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Backend / Ferramentas MCP
SUPABASE_URL=...             # (Igual ao VITE_SUPABASE_URL)
SUPABASE_ANON_KEY=...        # (Igual ao VITE_SUPABASE_ANON_KEY)
SUPABASE_SERVICE_ROLE_KEY=... # (Opcional para Dev, Obrigatório para Admin)

# GitHub
GITHUB_TOKEN=ghp_...
GITHUB_ACTOR=seu-usuario
```

### `apps/web/.env`

Arquivo usado pelo Frontend (`npm run dev`). Deve conter APENAS as chaves públicas `VITE_`.

---

## 5. Model Context Protocol (MCP) e Agentes de IA

Para manter a consistência entre todos os desenvolvedores e evitar a poluição de variáveis de ambiente no `.env`, todas as configurações, comandos e credenciais para os servidores MCPs foram unificadas.

**Atenção:** As chaves de acesso paras as IAs não devem ser postas no arquivo `.env` raiz do projeto.

1. Consulte o arquivo `mcp_config.example.json` na raiz do repositório.
2. Siga as instruções no **"Guia de Onboarding IA"** presente no `README.md`.
3. Projete as API Keys (Supabase Token, Github PAT, Google X-Goog-Api-Key) exclusivamente na UI/Settings da sua própria IDE ou cliente MCP (Cursor, Gemini CLI, Claude Desktop).

## 6. Onde configurar cada variável? (Resumo Didático)

Para manter a segurança e a arquitetura limpa, é vital saber o destino correto de cada chave. Use esta tabela como guia definitivo separando o que vai para a nuvem da Vercel, o que vai para o Supabase e o que fica na sua máquina (arquivos `.env`).

| Variável / Credencial                                               | Onde Salvar?                                    | Segurança             | Ambiente                                     | Descrição e Motivo                                                                                                                          |
| :------------------------------------------------------------------ | :---------------------------------------------- | :-------------------- | :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **`VITE_SUPABASE_URL`**                                             | Vercel e `.env`                                 | 🟢 Pública            | **Separado** (Preview e Prod)                | URL do projeto Supabase para que o site consiga encontrar o banco de dados.                                                                 |
| **`VITE_SUPABASE_ANON_KEY`**                                        | Vercel e `.env`                                 | 🟢 Pública            | **Separado** (Preview e Prod)                | Chave base pública. Permite que o React faça requisições limitadas pelo RLS.                                                                |
| **`APP_URL`**                                                       | Vercel e `.env`                                 | 🟢 Pública            | **Separado** (Preview e Prod)                | Ex: `https://app.cogitari...` Usada pelas Edge Functions para saber redirecionar links em e-mails.                                          |
| **OAuth Client IDs e Secrets** (Google/GitHub para Sign-in)         | **Apenas no Supabase** (Dashboard > Auth)       | 🔴 Secrets Protegidos | **Separado** (Dev e Prod independentes)      | Obrigatórios para permitir Login via Social. Quem lida com os provedores é a Supabase, **portanto NÃO adicione eles na Vercel**.            |
| **Chaves de APIs de Terceiros** (Ex: Google Drive p/ salvar laudos) | **Apenas no Supabase** (Edge Functions Secrets) | 🔴 Secrets Protegidos | **Separado** (Cofre isolado em cada projeto) | Segredos usados pelos scripts de Edge Functions. Elas devem viver nos cofres do backend, longe do frontend da Vercel.                       |
| **`SUPABASE_SERVICE_ROLE_KEY`**                                     | Apenas no `.env` corporativo                    | 🔴 Máxima (Sensitive) | **Separado** (Não misture chaves)            | Chave-Mestre de Administração que ignora barreiras de segurança (RLS). **Não adicione na Vercel** (a menos que crie um micro-backend lá).   |
| **`GITHUB_TOKEN`** (Para Scripts Locais Genuínos)| Apenas no `.env` local                          | 🔴 Sensitive          | **Global** (Da sua conta pessoal)            | Token para rodar scripts locais criados em node (se necessário, fora da IA). O Token usado pela IA é setado nas configs da IDE.             |
| **`MCP_SERVER_POSTGRES_DSN`**                                       | (Obsoleto)                                      | 🔴 Máxima             | N/A                                          | *(Obsoleto)* O Agente fará isso conectando-se pelo app `npx supabase` local e MCP Server Supabase Oficial nativo injetado da nuvem.         |
| **`VITE_TURNSTILE_SITE_KEY`**                                       | Vercel e `.env` local/apps                      | 🟢 Pública            | **Separado** (Desenvolvimento e Prod)        | Chave do site do Cloudflare Turnstile. Usada no Frontend para instanciar o widget contra bots. Deve ser distinta para testes locais e Prod. |

### Passo a Passo

1. Acesse o projeto na **Vercel**.
2. Vá em **Settings** > **Environment Variables**.
3. Adicione as variáveis:
   - **Para Produção**:
     - Copie do arquivo `.env.production`.
     - Desmarque "Preview" e "Development". Mantenha apenas **Production**.
   - **Para Beta (Preview)**:
     - Copie do arquivo `.env.beta`.
     - Desmarque "Production". Mantenha **Preview** (e Development se desejar usar o base de beta localmente).

---

## 7. Cloudflare Turnstile e Testes Automatizados (Bypass E2E)

Nosso sistema utiliza o **Cloudflare Turnstile** para proteção anti-bot. Por padrão, em Produção, ele roda no modo "**Managed**", o que significa que o selo de sucesso (Check verde) apenas será concedido de forma interativa ou transparente dependendo do risco do visitante.

Durante o desenvolvimento ou execução de testes E2E (Playwright), os scripts automatizados podem ser bloqueados porque eles disparam desafios do Captcha que os robôs não conseguem resolver.

Para permitir **Bypass** e que assistentes de Inteligência Artificial e Testes E2E rodem sem barreira visual de rede local, siga esta diretriz:

1. **Alterar no Ambiente (`apps/web/.env`)**
   Substitua sempre no Frontend Local sua chave verdadeira (se estiver testando login localmente com AI ou Playwright) pela Dummy Site Key do Cloudflare que concede _sempre_ acesso:
   \`\`\`env

# Chave Especial para bypass de testes

VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
\`\`\`

> **⚠️ CUIDADO:** Nunca permita que a chave de Teste (`1x...AA`) faça o commit até o Preview ou Main do `.env.production`. Caso contrário o Captcha ficará nulo e deixará bots passarem.

2. **Bypass Via Storage (`localStorage`)**
   Para automações complexas nas telas de Auth, o sistema detecta preferencialmente a navegação persistente caso a variável local exista no browser automatizado. Certas rotinas de Login automatizado só prosseguem sem timeout se você configurar antes (no setup stage via injeção JavaScript E2E) chaves contendo `amuri_session_type` etc. Caso seja necessário, verifique em `.testing.credentials.md` (no root) atalhos e usuários dummy recomendados.
