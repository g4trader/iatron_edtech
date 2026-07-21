# Migrations remotas

`pnpm db:push:staging` liga o projeto explicitamente aprovado, executa dry-run e
aplica migrations. `pnpm db:seed:staging` usa conexão PostgreSQL somente pelo
ambiente do processo e um wrapper SQL que recusa execução fora de staging.
`pnpm db:test:staging` executa pgTAP no projeto ligado.

Tipos:

- `pnpm db:types:check:staging` gera em memória e falha se houver drift;
- `pnpm db:types:staging` atualiza atomicamente o snapshot para revisão/commit;
- uma falha nunca trunca o arquivo versionado.

Para comprovar migrations do zero, use preferencialmente Supabase Preview
Branch. Se Branching não estiver no plano, crie um projeto temporário dedicado,
aplique o mesmo pipeline e remova-o somente após registrar os resultados. Nunca
resete produção. Migrations são forward-only; correções usam nova migration.
