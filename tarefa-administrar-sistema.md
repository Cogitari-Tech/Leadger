# Tarefa: Revisão da Categoria "Administrar Sistema" e Correção 2FA

🤖 **Aplicando conhecimentos de `@project-planner` e `orchestrator`**

## 1. Visão Geral

A categoria "Administrar Sistema" possui inconsistências no seu design (uso misto de cores raw do Tailwind como `slate`, `brand` e `cyan` na contramão do padrão _Glassmorphism_ usando variáveis globais e opacidade do restante do painel).

Além disso, há um bug reportado em **"Conectar 2FA"** através da navegação ou carregamento (provável que envolva a rota e/ou comportamento de carregamento de segurança).

## 2. Escopo do Plano (4-Phase)

### 🔴 PHASE 1: Análise e Troubleshooting (Bug do 2FA)

1. **Analise Inicial:** A página `/auth/mfa-setup` tem uma UI `slate` codificada estaticamente e é protegida por `AuthGuard`. No `ProfilePage`, a chamada para configurar vai para esta página pela URL.
2. **Diagnóstico esperado:** O erro reportado pode ser causado por redirecionamentos no `AuthGuard` interceptando a navegação, ou o componente `TwoFactorSetup` apresentando erro em tela devido a não-ativação do Provider no Supabase (embora a mensagem devia ser tratada elegantemente). No `AuthGuard`, se não houver um fator registrado `nextLevel` pode estar batendo `aal1`, impedindo loops se não tiver os "strictRoles".
3. **Resolução:** Refatorar a UI da página e corrigir a mecânica do `navigate` ou renderização no componente para ser livre de erros ou redirecionamentos infinitos.

### 🟡 PHASE 2: Padronização do Design (UI/UX)

Atualizar as páginas do menu de `Administrar Sistema` do formato "Solid Slate/Brand/Cyan" para o formato "Glassmorphism HSL":

- `RoleManagement.tsx`
- `TenantSettings.tsx`
- `ProjectsListPage.tsx`
- `TwoFactorSetup.tsx` e `mfa-setup` (Rota)

_Diretrizes:_

- Modificar textinhos, borders e boxes para utilizar `hsl(var(--background))`, `bg-background/50`.
- Utilizar `text-foreground`, `border-border/40`.
- Alterar botões para usar a cor primária `primary` (`bg-primary text-primary-foreground`) e ícones e labels padronizados.
- Retirar referências pesadas e fixas em `brand-500`, `slate-900`, etc.

### 🟢 PHASE 3: Revisão de Fluxos e Funcionalidade

Garantir a inter-relação entre as áreas sem causar bugs:

- Checar as dependências de permissões em `TeamManagement` vs `RoleManagement`.
- Checar se a atualização de nome/slug no `TenantSettings` não quebra outras requisições (funciona através do supabase update no `id`).
- Verificar botões do `ProjectsListPage.tsx` para garantir fluxo correto na edição/criação.

### 🔵 PHASE 4: Implementação

Proceder com edição paralela de arquivos pelo `orchestrator`:

1. Atualizar UI de autenticação do `TwoFactorSetup`.
2. Atualizar UI do `RoleManagement`.
3. Atualizar UI do `TenantSettings`.
4. Atualizar UI do `ProjectsListPage`.
5. Validação final manual dos fluxos modificados.

---

**Status da Tarefa**: 📅 Em Progresso
