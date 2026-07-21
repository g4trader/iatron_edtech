# Arquitetura cloud-first

```mermaid
flowchart LR
  GH[GitHub + Actions] -->|migrations e pgTAP| SS[(Supabase Staging)]
  GH -->|OIDC e imagem imutável| CR[Cloud Run Staging]
  GH -->|integração Git| VE[Vercel Preview/Staging]
  VE -->|REST /v1 + JWT| CR
  VE -->|Auth SSR + RLS| SS
  CR -->|JWT do usuário + RLS| SS
  SM[Secret Manager] --> CR
  GH --> E2E[E2E cloud]
  E2E --> VE
  E2E --> CR
  E2E --> SS
```

Staging e produção usam projetos, serviços e credenciais diferentes. O projeto
Supabase `dajdcecjaobdsgatubsb` é o candidato informado para staging; ele só é
usado depois de confirmado como vazio de dados reais. Produção não é criada nem
alterada nesta fase.

Docker Desktop e Supabase local permanecem opcionais para depuração, nunca como
pré-requisito de CI ou aceite. A ordem segura é migration → testes de banco → API
→ frontend → smoke/E2E.
