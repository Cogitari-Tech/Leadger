# Configuração do Context 7 MCP no Leadgers Platform

O **Context 7 MCP** (`mcp-context7`) atua como uma ferramenta focada em **documentação atualizada**. Diferente de um sistema de "memória de longo prazo do projeto" (como o Mem0), ele é desenhado para ajudar a IA a ler frameworks externos atualizados (como React, Prisma, Tailwind, Supabase), não armazenando contextos fechados dos seus arquivos.

## 🔒 Princípios de Segurança e Isolamento

Por ser focado em ferramentas externas e documentação de bibliotecas:
1. Ele não precisa e nem possui um conceito de "Workspace" que isole escopo entre o Amuri e o Leadgers, pois seu banco de dados é puramente ferramental.
2. Apenas a `CONTEXT7_API_KEY` deve ser mapeada no arquivo `.env` para a IA ter o direito de fazer as consultas (evitando que a IDE exija de forma global).

## ⚙️ Configuração no Cursor / Claude Desktop (Locais ao Projeto)

### Passo 1: Obter a Chave (Apenas 1 Variável Necessária!)
1. Acesse o portal do [Context 7](https://context7.com/).
2. Faça login e acesse sua aba de contas e configurações (`Settings` > `Tokens/API Keys`).
3. Gere uma nova API Key (Pode ser nomeada: `Acesso_Docs_Leadgers`).

### Passo 2: Atualizar o arquivo `.env`
No seu arquivo `.env`, preencha o campo de chave:
```env
# --- CONTEXT 7 MCP ---
# Focado em fornecer documentações atualizadas. Dispensa restrição de Workspace.
CONTEXT7_API_KEY=sua_api_key_aqui
```

### Passo 3: Adicionar Ferramenta MCP (No Cursor)
Vá nas **Configurações do Cursor** (Features > MCP) e configure a ferramenta:

- **Name:** `Leadgers-Context7`
- **Type:** `command`
- **Command:** `npx -y @context7/mcp`
*(O NPX tentará ler as credenciais localmente se o projeto permitir. Como a chave foi mapeada no `.env` do projeto atual, a ferramenta conseguirá ser ativada).*

---

## 🚀 Ferramentas Disponíveis pelo Context 7
Uma vez online, ele desbloqueará:
- **`query-docs`**: Pesquisa nos documentos oficiais de várias linguagens diretamente de suas versões exatas.
- **`resolve-library-id`**: Resolve as documentações pedidas se a IA citar uma tecnologia que precisa estudar para codar certo.
