# ADR 0008 — Desenvolvimento cloud-first

Status: aceito.

Docker Desktop e Supabase local deixam de ser requisitos. CI e aceite usam
ambientes cloud isolados; execução local permanece opcional. Isso remove a
dependência de runtime local, mas exige guardas contra produção e gestão rigorosa
de custo/segredos.
