# ADR 0009 — Isolamento de ambientes

Status: aceito.

Staging e produção usam projetos Supabase, serviços Cloud Run, projetos/ambientes
Vercel e credenciais distintos. Identificadores explícitos bloqueiam seed e E2E
quando o alvo não é staging aprovado.
