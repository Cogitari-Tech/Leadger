# Vercel MCP Server

O servidor Vercel MCP permite que a IA gerencie projetos, implantações, logs e ambientes da Vercel diretamente pelo chat.

## ⚙️ Configuração Correta no Cursor/IDE
Diferente dos outros MCPs locais que rodam comandos no seu terminal, a Vercel tomou a decisão de **hospedar** o servidor na própria nuvem deles usando SSE (Server-Sent Events). 

Portanto, **NUNCA** tente instalar com `npx @vercel/mcp` (isso cracha a IDE!).

### Modo Automático (Recomendado):
Execute o seguinte comando no terminal na raiz do projeto (ele acha o Cursor/Claude sozinho e injeta):
```bash
npx add-mcp https://mcp.vercel.com
```

### Modo Manual (Pela GUI da IDE):
1. Vá nas **Settings > MCP**.
2. Clique de adicionar um novo Módulo.
3. Escolha o tipo como **SSE** (e *NÃO Command*).
4. Em URL, coloque: `https://mcp.vercel.com`.

Após fazer isso, as credenciais no seu `.env` (`VERCEL_ACCESS_TOKEN`, `VERCEL_PROJECT_ID`) vão passar a ser respeitadas.

---
## Available Tools

### Project Management
- **list_teams**: Lists all teams the authenticated user is a member of.
- **list_projects**: Lists all projects available to the user or a specific team.
  - Parameters: `teamId` (optional)
- **get_project**: Retrieves detailed information about a specific project.
  - Parameters: `projectId`, `teamId` (optional)

### Deployment Management
- **list_deployments**: Lists deployments for a specific project.
  - Parameters: `projectId`, `teamId` (optional), `since` (optional), `until` (optional)
- **get_deployment**: Retrieves detailed information about a specific deployment.
  - Parameters: `idOrUrl`, `teamId` (optional)
- **get_deployment_build_logs**: Retrieves build logs for a deployment.
  - Parameters: `idOrUrl`, `teamId` (optional), `limit` (optional)
- **get_runtime_logs**: Retrieves runtime logs for a project or specific deployment.
  - Parameters: `projectId`, `teamId` (optional), `deploymentId` (optional), `environment` (optional), `level` (optional)

### Domain Management
- **check_domain_availability_and_price**: Checks if a domain is available for purchase and its price.
  - Parameters: `name`, `teamId` (optional)
- **buy_domain**: Purchases a domain.
  - Parameters: `name`, `teamId` (optional), `expectedPrice`, `renew` (optional)

### Deployment & CLI
- **deploy_to_vercel**: Deploys the current project directory to Vercel.
- **use_vercel_cli**: Executes Vercel CLI commands. This is useful for advanced operations not covered by specific tools.
  - Parameters: `command`, `action`

### Access & Fetching
- **get_access_to_vercel_url**: Generates a shareable URL to bypass deployment protection.
  - Parameters: `url`
- **web_fetch_vercel_url**: Fetches the content of a Vercel-hosted URL, including those with authentication requirements.
  - Parameters: `url`

### Documentation
- **search_documentation**: Searches Vercel's official documentation for help on topics.
  - Parameters: `query`

## Common Workflows

### 1. Investigating Deployment Failures
1. Use `list_deployments` to find the failed deployment ID.
2. Use `get_deployment_build_logs` with the deployment ID to see what went wrong during the build process.
3. If the build succeeded but the application is failing at runtime, use `get_runtime_logs`.

### 2. Managing Multiple Teams
1. Use `list_teams` to identify the `teamId`.
2. Most other tools accept this `teamId` as an optional parameter to scope the action to that team.

### 3. Deploying a New Version
1. Ensure your project is configured correctly (e.g., `vercel.json`).
2. Run `deploy_to_vercel` to trigger a new deployment.
3. Monitor the status using `get_deployment`.
