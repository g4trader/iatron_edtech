# Iatron — Operations Runbook

Execute na raiz do monorepo, salvo indicação. Os comandos abaixo existem nos
scripts/workflows do snapshot `8707348`; “verificado” significa conferido no
repositório, não necessariamente executado durante esta tarefa documental.

## Toolchain e validação

| Objetivo              | Comando                                | Pré-requisito / variáveis  | Efeito esperado             | Risco |
| --------------------- | -------------------------------------- | -------------------------- | --------------------------- | ----- |
| Node                  | `node --version`                       | Node `>=20.9.0`; CI usa 22 | mostra versão               | baixo |
| pnpm                  | `pnpm --version`                       | Corepack/pnpm `10.13.1`    | mostra `10.13.1`            | baixo |
| instalar              | `pnpm install --frozen-lockfile`       | rede/registry              | instala sem alterar lock    | baixo |
| lint                  | `pnpm lint`                            | dependências               | lint de todos os workspaces | baixo |
| tipos                 | `pnpm typecheck`                       | dependências               | TypeScript strict           | baixo |
| unitários/guards      | `pnpm test`                            | dependências               | Turbo tests + cloud guards  | baixo |
| contratos             | `pnpm --filter @iatron/contracts test` | dependências               | schemas/tipos               | baixo |
| build                 | `pnpm build`                           | env pública quando exigida | build de produção           | médio |
| formato, sem escrever | `pnpm format:check`                    | dependências               | valida Prettier             | baixo |

## Desenvolvimento local

Copie os `.env.example` para arquivos locais ignorados e use apenas credenciais
locais.

| Objetivo             | Comando              | Pré-requisito                         | Resultado                                           | Risco                             |
| -------------------- | -------------------- | ------------------------------------- | --------------------------------------------------- | --------------------------------- |
| todos os apps        | `pnpm dev`           | env + dependências                    | Turbo dev                                           | baixo                             |
| web                  | `pnpm dev:web`       | web env                               | porta Next local                                    | baixo                             |
| API                  | `pnpm dev:api`       | API env, Supabase                     | API em `PORT`                                       | baixo                             |
| Supabase             | `pnpm db:start`      | Docker + Supabase CLI                 | stack local                                         | médio                             |
| parar Supabase       | `pnpm db:stop`       | stack local                           | containers param; dados locais preservados pela CLI | médio                             |
| migrations pendentes | `pnpm db:migrate`    | Supabase local ativo                  | aplica novas migrations                             | alto                              |
| reset + seed         | `pnpm db:reset`      | Supabase local ativo                  | **apaga e recria dados locais**                     | alto                              |
| seed local           | `pnpm db:seed`       | Supabase local ativo                  | alias de reset; **destrutivo local**                | alto                              |
| tipos locais         | `pnpm db:types`      | Supabase CLI                          | atualiza tipos versionados                          | médio                             |
| pgTAP local          | `pnpm db:test`       | Supabase local migrado                | executa `supabase/tests/database`                   | médio                             |
| E2E mock             | `pnpm test:e2e:mock` | build/dev conforme Playwright         | fluxo sem serviços remotos                          | baixo                             |
| E2E auth local       | `pnpm test:e2e:auth` | Supabase local, web e API; Playwright | fluxo real local                                    | alto/destrutivo em dados de teste |

Instale o navegador quando necessário:

```bash
pnpm --filter @iatron/web exec playwright install chromium
```

## Staging: banco e E2E

Antes de qualquer comando, confira project ref e autorização destrutiva.

```bash
pnpm db:link:staging
pnpm db:push:staging
pnpm db:seed:staging
pnpm db:test:staging
pnpm db:types:check:staging
pnpm db:smoke:staging
```

- Diretório: raiz.
- Pré-requisitos: Supabase CLI autenticada; GitHub/local env com os nomes da
  seção de variáveis; `psql` para seed.
- `db:push:staging` faz link, dry-run e push.
- `db:seed:staging` altera dados técnicos de staging e exige
  `E2E_ALLOW_DESTRUCTIVE_TESTS=1`.
- `db:test:staging` executa pgTAP remoto.
- Risco: alto; o guard rejeita projeto de produção ou ref divergente.

E2E remoto:

```bash
pnpm test:e2e:auth
```

Com `E2E_WEB_BASE_URL` definido, o runner exige todas as variáveis E2E e guards
de projeto. Usa contas exclusivas de teste e pode destruir esses dados.

## Saúde e versão

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  https://iatron-api-staging-sjbe4ymhya-uw.a.run.app/health
curl -sS -o /dev/null -w '%{http_code}\n' \
  https://iatron-api-staging-sjbe4ymhya-uw.a.run.app/ready
curl -sS \
  https://iatron-api-staging-sjbe4ymhya-uw.a.run.app/v1/meta
```

Esperado: 200, 200 e JSON sem segredos com ambiente, SHA, baseline e revisão.

## Publicação

Fluxo oficial:

1. push em `main` publica o frontend pela integração Git da Vercel;
2. push em `staging` inicia banco e, se verde, API e E2E;
3. produção é exclusivamente `workflow_dispatch` com confirmação.

Reexecutar Actions:

```bash
gh workflow run "Deploy Supabase Staging" --ref staging
gh run list --workflow ci.yml --limit 10
gh run watch RUN_ID
```

API manual somente com autorização operacional e imagem imutável:

```bash
gcloud builds submit --project=staging-503122 \
  --config=infra/gcp/cloudbuild-api.yaml \
  --substitutions=_IMAGE=IMAGE_IMUTAVEL .
gcloud run deploy iatron-api-staging --project=staging-503122 \
  --region=us-west1 --image=IMAGE_IMUTAVEL
```

Não use tag mutável nem injete segredo na linha de comando. Prefira o workflow,
que configura WIF, variáveis e Secret Manager.

Frontend:

```bash
git push origin main
vercel inspect DEPLOYMENT_URL
```

O projeto Vercel deve ter root `apps/web`, build `pnpm build`, acesso aos
workspaces externos e branch de produção `main`. Não use `vercel --prod` sem
autorização explícita e confirmação do projeto/equipe.

Verificações:

```bash
gcloud run services describe iatron-api-staging \
  --project=staging-503122 --region=us-west1
gcloud run revisions list --service=iatron-api-staging \
  --project=staging-503122 --region=us-west1
vercel inspect https://go.iatron.com.br
```

## Rollback

Frontend: promova no painel/CLI um deployment Vercel anterior já validado ou
reverta o commit e deixe a integração Git publicar. Confirme SHA depois.

API:

```bash
gcloud run services update-traffic iatron-api-staging \
  --project=staging-503122 --region=us-west1 \
  --to-revisions=REVISAO_ANTERIOR=100
```

Banco: não execute down migration destrutiva automática. Faça correção
forward-only. PITR/restore exige análise de perda e aprovação do proprietário.
Rollback de app não desfaz schema.

## Limpeza segura

- Use `pnpm db:stop` para parar Supabase local.
- Remova apenas artefatos regeneráveis e alvos explícitos, após `git status`.
- Nunca use `git clean`, `git reset --hard`, glob amplo ou remova a raiz.
- Não apague volumes/dados locais se ainda forem necessários ao diagnóstico.
- A cópia local original possui alterações do usuário conhecidas: preserve-as.

## Variáveis por fronteira

Somente nomes; nunca valores.

**Local web:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, opcional `NEXT_PUBLIC_BUILD_SHA`.

**Local/API ou Cloud Run config:** `NODE_ENV`, `APP_ENV`, `HOST`, `PORT`,
`LOG_LEVEL`, `ENABLE_API_DOCS`, `BUILD_SHA`, `BUILD_TIMESTAMP`,
`MIGRATION_BASELINE`, `SUPABASE_URL`, `SUPABASE_JWT_ISSUER`,
`SUPABASE_JWT_AUDIENCE`, `SUPABASE_JWT_ALGORITHMS`,
`CORS_ALLOWED_ORIGINS`, `OPENAI_MODEL`, `OPENAI_MAX_OUTPUT_TOKENS`,
`OPENAI_REQUEST_TIMEOUT_MS`.

**Secret Manager → Cloud Run:** `SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`.

**Vercel:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; SHA é fornecido por
`VERCEL_GIT_COMMIT_SHA`.

**GitHub Environment staging — secrets:** `SUPABASE_ACCESS_TOKEN`,
`SUPABASE_STAGING_DB_PASSWORD`, `SUPABASE_STAGING_DATABASE_URL`,
`SUPABASE_STAGING_PUBLISHABLE_KEY`, `SUPABASE_STAGING_SERVICE_ROLE_KEY`.

**GitHub Environment staging — variables:**
`SUPABASE_STAGING_PROJECT_ID`, `SUPABASE_PRODUCTION_PROJECT_ID`,
`SUPABASE_STAGING_URL`, `GCP_PROJECT_ID`, `GCP_REGION`,
`GCP_ARTIFACT_REPOSITORY`, `GCP_WORKLOAD_IDENTITY_PROVIDER`,
`GCP_DEPLOY_SERVICE_ACCOUNT`, `GCP_RUNTIME_SERVICE_ACCOUNT`,
`CORS_ALLOWED_ORIGINS`, `E2E_WEB_BASE_URL`, `E2E_API_BASE_URL`.

**E2E remoto local/runner:** `E2E_ALLOW_DESTRUCTIVE_TESTS`,
`E2E_WEB_BASE_URL`, `E2E_API_BASE_URL`, `E2E_SUPABASE_URL`,
`E2E_SUPABASE_PUBLISHABLE_KEY`, `E2E_SUPABASE_SERVICE_ROLE_KEY`,
`EXPECTED_BUILD_SHA`, `EXPECTED_MIGRATION_BASELINE`.
