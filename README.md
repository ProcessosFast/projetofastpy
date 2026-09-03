# Portal Paraguai — FAST Sistemas Construtivos

App React (Vite + TypeScript) do painel de acompanhamento das 3 frentes da
expansão da FAST no Paraguai — Loja, Imobiliária e MaxSteel.

## Stack

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** — tokens de tema em `src/index.css`
- **shadcn/ui** — primitivos próprios em `src/components/ui/` (button, card,
  badge, progress, checkbox, dialog, separator), seguindo a convenção shadcn
  (Radix UI + `class-variance-authority` + `tailwind-merge`)
- **Recharts** — usado no Dashboard (`src/components/portal/Dashboard.tsx`):
  gauge radial de conclusão geral (`RadialBarChart`) e comparativo de
  progresso por frente (`BarChart`)

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de produção em dist/
```

## Estrutura

- `src/data/frentes.ts` — dados das 3 frentes, subfases e tarefas
- `src/hooks/useTasksStore.tsx` — estado global (checkboxes + escolhas),
  persistido em `localStorage`
- `src/components/portal/` — Sidebar, Dashboard, FrenteView, modais de
  informação (E.A.S. vs S.A., coworking, documentos dos sócios)
- `src/components/ui/` — primitivos shadcn/ui
