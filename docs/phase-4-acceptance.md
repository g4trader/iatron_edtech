# Checklist de aceite da fundação Supabase

Execute somente em ambiente local. A suíte real cria usuários descartáveis e não deve apontar para produção.

## 1. Segurança antes da execução

```bash
git status --short
git log --all --full-history -- secrets.md
git rev-list --objects --all | grep secrets.md
git ls-files
```

- Confirme que o tree está limpo e `secrets.md` não existe no workspace ou histórico.
- Faça uma varredura de credenciais sem copiar valores para logs ou relatórios.
- Confirme externamente que toda credencial possivelmente exposta foi revogada/rotacionada.
- Depois de uma exposição, rotacione no provedor, encerre sessões relevantes, atualize o Secret Manager/Vercel e verifique logs de acesso. Limpeza de histórico exige autorização específica e não substitui a rotação.

## 2. Banco reproduzível

Docker Desktop deve estar ativo e com espaço/armazenamento saudável.

```bash
pnpm install --frozen-lockfile
pnpm db:start
pnpm db:reset
pnpm db:test
pnpm db:types
pnpm db:stop
pnpm db:start
```

Confirme migrations do zero, seed, 45 asserções pgTAP, tipos sem diff inesperado e persistência após reinício. O seed usa IDs determinísticos e `ON CONFLICT`, portanto pode ser reaplicado sem duplicar catálogos.

## 3. Aplicação e autenticação real

O Mailpit local fica em `http://127.0.0.1:54324`. Acesse-o para inspecionar confirmação e recuperação sem enviar mensagens reais.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e:mock
pnpm test:e2e:auth
```

`test:e2e:auth` obtém URL e chave publicável da CLI somente em memória. A suíte cria e-mails únicos, confirma pelo Mailpit, usa JWT real, conclui onboarding, testa logout/recuperação e comprova isolamento do segundo usuário pela API e RLS.

## Troubleshooting

- JWKS: confirme que `SUPABASE_JWT_ISSUER` termina em `/auth/v1`, que `/.well-known/jwks.json` responde e que os algoritmos configurados são `ES256,RS256`. Não registre o bearer para depurar.
- Docker `meta.db`/I/O: reinicie o Docker Desktop e verifique espaço em disco. Não use prune ou remova volumes sem avaliar perda de dados.
- Registry 429: aguarde e tente novamente; downloads parciais são reutilizados.
- Tipos com drift: execute `pnpm db:reset` antes de `pnpm db:types` e revise somente mudanças compatíveis com as migrations.

A fase só pode ser marcada como aceita quando todos os itens forem comprovados e a rotação da credencial for confirmada.
