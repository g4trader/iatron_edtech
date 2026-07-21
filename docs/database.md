# Banco de dados

As migrations versionadas em `supabase/migrations` criam identidade acadêmica, disponibilidade, catálogo de instituições/provas e provas-alvo. Todos os identificadores são UUID, datas operacionais usam `timestamptz` em UTC e as relações possuem constraints e índices.

O trigger `handle_new_user` cria `profiles` e `student_profiles` na mesma transação da criação em `auth.users`. A função `save_onboarding` usa `security invoker` e salva cada etapa; a conclusão e seus dados são confirmados em uma única transação.

Comandos principais:

```bash
pnpm db:start
pnpm db:reset
pnpm db:test
pnpm db:types
pnpm db:stop
```

O fluxo obrigatório usa `db:push:staging`, `db:seed:staging`,
`db:test:staging` e `db:types:check:staging`; consulte
[cloud-database-migrations.md](cloud-database-migrations.md). Os comandos locais
acima são opcionais.

`database.types.ts` é um snapshot compatível com o schema. Após iniciar/resetar o Supabase, `pnpm db:types` deve regenerá-lo a partir do banco aplicado.
