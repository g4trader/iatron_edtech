# Supabase local

Pré-requisitos: Node 20+, pnpm e Docker Desktop (ou runtime compatível) em execução.

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
pnpm install
pnpm db:start
pnpm db:reset
pnpm db:test
pnpm db:types
pnpm dev
```

O Studio fica em `http://127.0.0.1:54323` e o capturador Mailpit em `http://127.0.0.1:54324`. Substitua as chaves de exemplo pelas chaves publicáveis exibidas por `supabase status`. Não versionar arquivos `.env`. Consulte o [checklist de aceite](phase-4-acceptance.md) para reset, pgTAP, geração de tipos, reinício e E2E real.
