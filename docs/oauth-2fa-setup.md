# Configuração OAuth & 2FA — Guia de Setup

> Este documento descreve como configurar Google OAuth, GitHub OAuth e 2FA (TOTP) no Supabase para o sistema Amuri-Audit.

---

## 1. Google OAuth

### Pré-requisitos

- Conta no [Google Cloud Console](https://console.cloud.google.com)
- Projeto Google Cloud criado

### Passo a passo

#### 1.1 Configurar Tela de Consentimento (OAuth Consent Screen)

Antes de criar as credenciais, o Google exige a configuração da tela que será apresentada aos usuários no momento do login:

1. Acesse **APIs & Services → OAuth consent screen** no Google Cloud Console
2. Selecione **External** (ou **Internal** se todos os usuários pertencerem ao seu Google Workspace corporativo) e clique em **Create**
3. Na etapa **OAuth consent screen**:
   - **App name**: `Cogitari Management`
   - **User support email**: Selecione o seu e-mail
   - **App logo**: (Opcional) Faça upload do logo do Cogitari Governance
   - **Authorized domains**: Adicione `cogitari.com.br` e `supabase.co` (para os callbacks)
   - **Developer contact information**: Seu e-mail ou e-mail da equipe
4. Na etapa **Scopes**, clique em **Add or Remove Scopes**.
   - Para o login: adicione `.../auth/userinfo.email`, `.../auth/userinfo.profile` e `openid`
   - **Para salvar relatórios (Futuro Breve):** adicione `https://www.googleapis.com/auth/drive.file` (diferente de `drive.readonly` ou `drive`, este escopo permite apenas que o aplicativo acesse arquivos _criados_ por ele, sendo o mais seguro para nossa necessidade).
   - Salve e continue.
5. Na etapa **Test users**, adicione e-mails específicos (se o app estiver em modo 'Testing') ou pule se for publicar o app.
6. Clique em **Back to Dashboard**. Se o app for `External` e estiver em modo `Testing`, lembre-se de clicar em **Publish App** antes de usar as credenciais em produção!

#### 1.2 Criar credenciais OAuth no Google Cloud

> [!IMPORTANT]
> **Ambientes Separados:** É obrigatório criar **dois OAuth Apps (Client IDs) distintos** — um para testes (Desenvolvimento) e outro para Produção. Não utilize um Client ID unificado. Isso garante que testes locais não exponham brechas na produção e mantém as URIs de redirecionamento rigorosamente isoladas por ambiente.

Para criar as credenciais, repita os passos abaixo para cada ambiente (Dev e Prod):

1. Acesse **APIs & Services → Credentials** no Google Cloud Console
2. Clique em **Create Credentials → OAuth Client ID**
3. Selecione **Web application**
4. Preencha os campos de acordo com o ambiente:
   - **Name**: Ex: `Cogitari Management - Supabase Auth (Prod)` ou `(Dev)`
   - **Authorized JavaScript origins**:
     - _Prod:_ `https://app.cogitari.com.br`
     - _Dev:_ `http://localhost:5173` (e URLs de Preview da Vercel, se aplicável)
   - **Authorized redirect URIs**:
     - _Prod:_ `https://yuldkgknnvvtmlpkqsji.supabase.co/auth/v1/callback`
     - _Dev:_ `https://grqhnhftseisxsobamju.supabase.co/auth/v1/callback`
5. Copie o **Client ID** e **Client Secret** de cada um dos apps criados.

#### 1.3 Configurar no Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard) do respectivo ambiente (audit-tool-beta ou audit-tool-prod).
2. Vá em **Authentication → Providers → Google**
3. Ative o toggle **Enable Sign in with Google**
4. Cole o **Client ID** e **Client Secret** correspondentes ao ambiente.
5. Salve.

---

## 2. GitHub OAuth

### Pré-requisitos

- Conta GitHub com acesso a [Developer Settings](https://github.com/settings/developers)

### Passo a passo

#### 2.1 Criar OAuth App no GitHub

> [!IMPORTANT]
> **Ambientes Separados:** Assim como no Google, crie **dois OAuth Apps distintos** no GitHub (ex: `Cogitari Management - GitHub Auth (Prod)` e `Cogitari Management - GitHub Auth (Dev)`). A separação garante um ambiente de testes limpo e previne o vazamento de chaves de produção.

Repita os passos para criar os dois apps independentemente:

1. Acesse **GitHub → Settings → Developer Settings → OAuth Apps**
2. Clique em **New OAuth App**
3. Preencha de acordo com o ambiente (Exemplo para Prod):
   - **Application name**: `Cogitari Management - Prod`
   - **Homepage URL**: `https://app.cogitari.com.br` (use 'http://localhost:5173' para o app dev)
   - **Application description**: `Autenticação OAuth para o sistema Cogitari Management.`
   - **Authorization callback URL**:
     - _Prod:_ `https://yuldkgknnvvtmlpkqsji.supabase.co/auth/v1/callback`
     - _Dev:_ `https://grqhnhftseisxsobamju.supabase.co/auth/v1/callback` (no app de dev)
   - **Enable Device Flow**: Deixe **desmarcado** (usado apenas em dispositivos sem navegador, o que não é o nosso caso).
4. Clique em **Register application**
5. Gere um **Client Secret** e copie ambos (Client ID e Secret) de cada ambiente.

#### 2.2 Configurar no Supabase Dashboard

1. No Supabase Dashboard, acesse o projeto correspondente (audit-tool-beta ou audit-tool-prod).
2. Vá em **Authentication → Providers → GitHub**
3. Ative **Enable Sign in with GitHub**
4. Cole o **Client ID** e **Client Secret** respectivo daquele ambiente.
5. Salve.

---

## 3. 2FA (Autenticação de Dois Fatores - TOTP)

### Como funciona

O Supabase Auth suporta nativamente o **TOTP (Time-based One-Time Password)**, que é o padrão usado por apps como Google Authenticator, Authy e 1Password.

### Fluxo do usuário

```
1. Usuário acessa Configurações → Segurança
2. Clica em "Ativar 2FA"
3. Supabase gera uma chave secreta e um QR Code
4. Usuário escaneia o QR com o app de autenticação
5. Usuário digita o código de 6 dígitos para confirmar
6. 2FA ativado — próximos logins exigem o código
```

### Implementação técnica

#### 3.1 Enrollment (ativação)

```typescript
// Iniciar enrollment de MFA
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: "totp",
  friendlyName: "Authenticator App",
});

// data.totp contém:
// - qr_code: string (data URL do QR code)
// - secret: string (chave TOTP para inserção manual)
// - uri: string (otpauth:// URI)
```

#### 3.2 Verificação (confirmação do enrollment)

```typescript
// Criar challenge
const { data: challenge } = await supabase.auth.mfa.challenge({
  factorId: data.id,
});

// Verificar com o código do app
const { data: verify } = await supabase.auth.mfa.verify({
  factorId: data.id,
  challengeId: challenge.id,
  code: "123456", // código do app
});
```

#### 3.3 Login com 2FA

```typescript
// Após signInWithPassword, verificar se MFA é necessário
const { data: factors } = await supabase.auth.mfa.listFactors();

if (factors.totp.length > 0) {
  // Criar challenge para o fator TOTP
  const { data: challenge } = await supabase.auth.mfa.challenge({
    factorId: factors.totp[0].id,
  });

  // Pedir código ao usuário e verificar
  const { data: verify } = await supabase.auth.mfa.verify({
    factorId: factors.totp[0].id,
    challengeId: challenge.id,
    code: userInputCode,
  });
}
```

### Política de Enforcement

| Role             | 2FA Obrigatório? | Justificativa               |
| ---------------- | :--------------: | --------------------------- |
| Admin / C-Level  |      ✅ Sim      | Acesso total ao sistema     |
| Financeiro / CFO |      ✅ Sim      | Dados financeiros sensíveis |
| Auditor          |      ✅ Sim      | Logs e compliance           |
| Gerente / PO     |  ⚠️ Recomendado  | Acesso a aprovações         |
| Contador         |  ⚠️ Recomendado  | Relatórios financeiros      |
| Engenharia       |  ⚠️ Recomendado  | API keys e infra            |
| QA               |   ❌ Opcional    | Acesso limitado             |
| Marketing        |   ❌ Opcional    | Acesso limitado             |

> [!WARNING]
> A obrigatoriedade do 2FA deve ser implementada no `AuthGuard` ou `AuthContext`, verificando `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`. Se o nível retornado for `aal1` e a role exigir `aal2`, redirecionar para a tela de verificação MFA.

### Checklist de implementação 2FA

- [ ] Criar componente `TwoFactorSetup.tsx` com QR code e input de verificação
- [ ] Criar componente `TwoFactorChallenge.tsx` para tela de verificação no login
- [ ] Adicionar verificação AAL no `AuthGuard` para roles obrigatórias
- [ ] Adicionar opção "Desativar 2FA" nas configurações do usuário

---

## 4. Variáveis de Ambiente na Vercel e .env

Um questionamento comum na configuração é onde os tokens gerados devem ser armazenados (Vercel, `.env` locais, etc). Abaixo estão as diretrizes da arquitetura adotada explicadas passo a passo:

### Para o fluxo de Autenticação Padrão (Supabase Auth)

> [!IMPORTANT]
> **NÃO adicione** o Client ID ou Client Secret do Google/GitHub na Vercel nem nos arquivos `.env` locais. Eles **não** são necessários no código-fonte para o login funcionar.

Como estamos utilizando o ecossistema do **Supabase Auth** para gerenciar a autenticação, a Supabase age como intermediário exclusivo entre a aplicação e os provedores (Google e GitHub). Portanto:

- As credenciais devem ser inseridas **exclusivamente no Supabase Dashboard** (conforme configurado nas sessões anteriores).
- O front-end (implantado na Vercel ou executado no PC localmente) não possui, nem precisa possuir, essas credenciais sensíveis. Ele apenas avisa ao Supabase que o usuário quer logar, e o Supabase cuida da troca de segredos com segurança no servidor deles.
- As únicas variáveis que seu sistema (na Vercel e no `.env` local) precisa conhecer para conversar com o Supabase são as chaves públicas: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

---

### Caso o sistema precise consumir as APIs do Google/GitHub no futuro (Server-side)

Se em integrações futuras (como a **em breve** necessidade de **salvar os relatórios gerados no Google Drive**) a aplicação precisar consumir diretamente as APIs do Google a partir do nosso backend (ex: Endpoints locais ou Server Actions da Vercel) **independentemente do fluxo de login do Supabase**, precisaremos guardar credenciais específicas na configuração da Vercel.

> **Atenção (Integração Google Drive):** Quando lançarmos essa feature, se a intenção for salvar o arquivo _na conta do próprio usuário_, o token de acesso (access token) devolvido pelo Supabase Auth durante o login do usuário contendo o escopo do Drive servirá (isso dispensa Client Secrets novos backend-side). Porém, se a intenção for salvar o arquivo em um _Drive Central (Conta de Serviço)_ da própria Cogitari, a integração **exigirá** uma **Service Account Key** armazenada estritamente via Vercel como variável de ambiente (ex: `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`), separada por ambiente.

Nesse cenário de integração Server-Side as políticas que deverão ser seguidas na Vercel são rigorosas e baseadas no isolamento:

1. **Separadas por Ambiente:** Você não deve usar a mesma configuração globalmente. As variáveis da Vercel devem ser injetadas especificamente para o ambiente de `Production` (usando as chaves criadas para o OAuth App de prod) e configuradas à parte para ambientes de `Preview` e `Development` (usando as chaves do OAuth App de dev).
2. **Client ID (Público):** O `Client ID` não é sigiloso. Ele poderia ser cadastrado na Vercel como texto simples (não _sensitive_). Todavia, caso o frontend precise lê-lo, ele deve possuir o prefixo `VITE_` (ou `NEXT_PUBLIC_` usando Next.js).
3. **Client Secret (Confidencial):** O `Client Secret` é estritamente protegível por lei de dados corporativos. Na integração com a Vercel, ele **DEVE** ser marcado com a flag **Sensitive** (para que não fique legível nem para desenvolvedores do time Vercel) e **nunca** deve conter prefixos públicos, a fim de garantir que não vaze no código da página ao usuário.

---

### Entendendo as Edge Functions do Supabase

> **O que são e para que servem?**
> Edge Functions são scripts de backend (escritos em TypeScript/Deno) que rodam **dentro da infraestrutura da Supabase**, respondendo do lado do servidor (Server-Side). Elas servem para executar lógicas sensíveis e corporativas sem onerar o front-end, por exemplo:
>
> - Processamentos pesados (como geração de PDFs ou relatórios que logo iremos integrar).
> - Webhooks blindados (como Stripe para pagamentos).
> - Disparo de e-mails em massa e links customizados de convites.

**As credenciais das Edge Functions DEVEM ir para a Vercel?**
**NÃO!** Absolutamente não. As varíaveis e segredos que as Edge Functions usam (como chaves de APIs para disparo de e-mails ou senhas do Google Drive no futuro) vivem **exclusivamente na conta do Supabase**. Injetar credenciais exclusivas de Edge Functions dentro do painel da Vercel é um desvio arquitetural grave que acarreta riscos de exposição.

Onde elas ficam? Elas ficam armazenadas no cofre **Secrets** do painel da Supabase. Quando uma Edge roda, ela puxa esses segredos diretamente de lá. Algumas variáveis já são nativas, logo você não precisa configurá-las:

- `SUPABASE_URL` — Endereço base interno
- `SUPABASE_ANON_KEY` — Chave pública
- `SUPABASE_SERVICE_ROLE_KEY` — Chave Master capaz de burlar restrições RLS

> [!NOTE]
> **Como eu coloco credenciais separadas por projeto (Beta vs Prod)?**
> **Edge Functions NÃO são compartilhadas entre ambientes.** Como você possui projetos apartados para `audit-tool-beta` (Homologação) e `audit-tool-prod` (Produção), **cada banco tem seu próprio servidor e seu próprio cofre de Segredos separadamente**.
>
> **Passo a Passo (Configurando Limites):**
>
> 1. Para seu ambiente de **Testes (Beta)**: Acesse o Dashboard do `audit-tool-beta` > Edge Functions > Secrets. Insira ali seus tokens _Fake_ ou limitados para não afetar clientes reais.
> 2. Para seu ambiente de **Produção**: Acesse o Dashboard do `audit-tool-prod` > Edge Functions > Secrets. Lá, insira apenas chaves de APIs corporativas reais e vitais para faturamento/produção.
> 3. Na hora de efetuar o _Deploy_, você utilizará a CLI do Supabase enviando a rotina separadamente por meio de Flags diferentes, empurrando primeiramente o código para o servidor do Beta, homologando, e só então empurrando em um comando separado a versão para a Produção.

### Variável de E-mails de Convite (Vercel/.env)

```env
APP_URL=https://app.cogitari.com.br
```

> Esta variável deve ser inserida tanto no seu arquivo `.env` local (onde o valor será `http://localhost:5173`) quanto no painel de ambiente produtivo da Vercel (`https://app.cogitari.com.br`). Ela serve para o Frontend referenciar seu próprio endereço global, sendo usada principalmente pela Edge Function corporativa de `send-invitation` para assinar explicitamente links nos botões de e-mail e garantir redirecionamentos adequados ao usuário final. Caso você esqueça de preenchê-la, o sistema poderá redirecionar links malformados baseados no fallback de IP originário.

---

## 5. Automação via Google CLI (gcloud)

Embora scripts de automação possam habilitar as APIs necessárias (ex: `gcloud services enable oauth2.googleapis.com`), a **Criação da Tela de Consentimento OAuth** e do **Client ID Web** exige iteração manual, pois o Google exige validação de domínio e e-mail de suporte (que, via terminal, frequentemente bloqueia por necessidade de verificação CAPTCHA ou login no navegador).
Recomendamos a criação via Google Cloud Console (passos na seção 1).

---

## Resumo de ações manuais necessárias

| Ação                                     | Onde                                          | Prioridade |
| ---------------------------------------- | --------------------------------------------- | :--------: |
| Criar OAuth App Google                   | Google Cloud Console                          |  🔴 Alta   |
| Criar OAuth App GitHub                   | GitHub Developer Settings                     |  🔴 Alta   |
| Configurar Google Provider no Supabase   | Supabase Dashboard (dev + prod)               |  🔴 Alta   |
| Configurar GitHub Provider no Supabase   | Supabase Dashboard (dev + prod)               |  🔴 Alta   |
| Implementar componente TwoFactorSetup    | Código frontend                               |  🟡 Média  |
| Implementar verificação AAL no AuthGuard | Código frontend                               |  🟡 Média  |
| Definir `APP_URL` nas Edge Functions     | Supabase Dashboard → Edge Functions → Secrets |  🟢 Baixa  |
