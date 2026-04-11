# Contrato Mestre de APIs (API_CONTRACT.md)

> Modelagem padrão de Input e Output da OpenAPI do projeto Hono API.

## Convenção de Rotas REST

O App Web deve sempre realizar requisições no BackEnd padronizadas utilizando URLs de recurso nos formatos:
- `List / Collection:` `GET /api/v1/{domain}`
- `Read Detail:`      `GET /api/v1/{domain}/:id`
- `Create Action:`    `POST /api/v1/{domain}`
- `Update Field:`     `PATCH /api/v1/{domain}/:id`
- `Soft Delete:`      `DELETE /api/v1/{domain}/:id`

## Validation Layer (ZOD)
Toda Controller exposta DEVE assinar seu Contrato por ZOD. O Client SDK em si no front validará tipagens inferidas a partir do `z.infer`.

```typescript
// Exemplo Core (Input Zod via HonoValidator Middleware)
export const createContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  tags: z.array(z.string()).optional()
});
// A Requisição mal-formada retornará um Response estatico Code 400 Bad Request detalhado.
```

## Identidade e Header Isolado (Multi-Tenant Identifier)
- No `Hono` backend, todo Handler da v1 possui o Middleware global de check `authMiddleware` implementado. Ele abre o Header `Authorization: Bearer <token>`
- O Request passa pro passo dois `tenantMiddleware()`, a qual força via check interno que a requisição injete implicitamente qual é o Tenant Scope pelo payload JWT.
- Rotas isoladas sem Tenant (ex. Webhook Inngest Server-to-Server) exigem bypass autenticado via Signature Key (Inngest header check).
