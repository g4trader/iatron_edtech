# ADR 0011 — E2E remoto

Status: aceito.

Playwright testa staging por URLs configuradas. Uma fixture server-side usa Admin
API apenas para confirmação, recuperação e limpeza dos usuários criados. A suíte
exige flag destrutiva e correspondência exata do project ref, e recusa produção.
