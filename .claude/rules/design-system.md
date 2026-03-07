---
paths:
  - "apps/web/src/**/*.{tsx,css}"
  - "apps/web/src/index.css"
---

# Design System — Leadgers Governance

## Filosofia

- **Mobile-first**: Todo CSS é escrito para mobile primeiro, expandido com breakpoints (`md:`, `lg:`).
- **Glassmorphism Premium**: Painéis com `backdrop-blur`, backgrounds semi-transparentes, bordas sutis.
- **Micro-interações**: Hover effects (`hover:-translate-y-1`), active feedback (`active:scale-95`), transitions suaves.
- **Hierarquia visual clara**: Cores, tamanhos e pesos de fonte comunicam importância.

## Paleta de Cores (HSL Tokens — Tailwind)

### Cor Primária (Marca Leadgers)

- `--primary: 24.6 95% 53.1%` — Laranja vibrante.
- `--primary-foreground: 0 0% 100%` — Branco puro para contraste.
- `--ring: 24.6 95% 53.1%` — Focus rings na cor primária.

### Modo Claro

- `--background: 220 14% 98%` — Off-white suave.
- `--foreground: 224 71% 4%` — Azul quase preto.
- `--card: 0 0% 100%` — Branco puro.
- `--muted: 220 14% 94%` — Cinza claro.
- `--muted-foreground: 220 10% 40%` — Texto secundário.
- `--border: 220 13% 80%` — Bordas definidas.
- `--destructive: 0 84% 60%` — Vermelho para ações destrutivas.

### Modo Escuro

- `--background: 222 20% 12%` — Cinza-azulado profundo.
- `--card: 222 20% 14%` — Superfícies elevadas.
- `--muted: 215 27.9% 16.9%` — Muted dark.
- `--muted-foreground: 217.9 10.6% 64.9%` — Texto secundário dark.
- `--border: 215 27.9% 16.9%` — Bordas dark.
- `--destructive: 0 62.8% 30.6%` — Vermelho adaptado para dark.

### Glassmorphism Tokens

- `--glass-bg: 0 0% 100% / 0.95` (light) | `222 47% 7% / 0.7` (dark)
- `--glass-border: 0 0% 0% / 0.15` (light) | `215 27.9% 16.9% / 0.5` (dark)

### Cores Proibidas ⛔

- **Roxo/Violeta**: Nunca usar como cor primária ou de destaque. Reservado para diferenciar de concorrentes.

## Tipografia

### Fontes (Google Fonts — 100% gratuitas)

| Fonte      | Uso                                           | Pesos              |
| ---------- | --------------------------------------------- | ------------------ |
| **Inter**  | Corpo, formulários, botões, labels, navegação | 400, 500, 600, 700 |
| **Outfit** | Títulos (h1-h6), Hero, branding, marketing    | 400, 500, 600, 700 |

```css
/* Corpo */
body {
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    sans-serif;
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
}

/* Títulos */
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Outfit", sans-serif;
  font-weight: 600;
  letter-spacing: -0.025em;
}
```

### Hierarquia Tipográfica

| Elemento        | Tamanho                    | Peso    | Font   |
| --------------- | -------------------------- | ------- | ------ |
| h1 (Hero)       | `text-5xl` a `text-[5rem]` | 700-800 | Outfit |
| h2 (Section)    | `text-3xl` a `text-5xl`    | 700     | Outfit |
| h3 (Card title) | `text-xl`                  | 700     | Outfit |
| Body            | `text-base`                | 400-500 | Inter  |
| Label/Caption   | `text-sm`                  | 500-600 | Inter  |
| Micro           | `text-xs`                  | 600     | Inter  |

## Geometria e Espaçamento

- **Border radius**: `--radius: 0.75rem` (12px) — Estilo macOS.
- **Soft shadows**: `box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08)` (light).
- **Seções**: Padding vertical `py-24` a `py-32` entre seções da landing page.
- **Max-width de conteúdo**: `max-w-7xl` (1280px) para layouts gerais.
- **Max-width de texto**: `max-w-2xl` ou `max-w-prose` para parágrafos longos.

## Componentes Visuais

### Glass Panel

```css
.glass-panel {
  background-color: hsl(var(--background) / 0.85);
  backdrop-filter: blur(24px);
  border: 1px solid hsl(var(--border) / 0.5);
}
```

### Glass Card

```css
.glass-card {
  background-color: hsl(var(--card) / 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid hsl(var(--border) / 0.4);
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.05),
    inset 0 1px 0 0 rgb(255 255 255 / 0.05);
}
```

### Figma Focus (Acessibilidade)

```css
.figma-focus {
  outline: none;
  box-shadow:
    0 0 0 2px hsl(var(--background)),
    0 0 0 4px hsl(var(--primary));
}
```

## Logos

| Contexto   | Arquivo                                     | Uso                            |
| ---------- | ------------------------------------------- | ------------------------------ |
| Dark mode  | `/images/logo-light.webp` (LOGOLEADGERSvaW) | Logo branca sobre fundo escuro |
| Light mode | `/images/logo-dark.webp` (LOGOLEADGERSvaDG) | Logo escura sobre fundo claro  |
| Favicon    | `/images/favicon.webp` (LeadgersFAV)        | Ícone do browser               |

Implementação:

```tsx
<img src="/images/logo-light.webp" alt="Leadgers" className="h-6 w-auto hidden dark:block" />
<img src="/images/logo-dark.webp" alt="Leadgers" className="h-6 w-auto block dark:hidden" />
```

## Animações (Framer Motion)

- **Scroll reveals**: `whileInView={{ opacity: 1, y: 0 }}` com `viewport={{ once: true }}`.
- **Hover lift**: `hover:-translate-y-1 hover:shadow-2xl transition-all`.
- **Active press**: `active:scale-95`.
- **Parallax hero**: `useScroll` + `useTransform` para efeito de profundidade.
- **Duração padrão**: 300ms para micro-interações, 600ms para reveals.

## Acessibilidade (a11y)

- Todos os elementos interativos precisam de `aria-label` descritivo.
- Contraste mínimo WCAG AA (4.5:1 para texto normal, 3:1 para texto grande).
- Focus rings visíveis (`.figma-focus`).
- Inputs com `label` associado ou `aria-label`.
- Images com `alt` descritivo — NUNCA vazio.
