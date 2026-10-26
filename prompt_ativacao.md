# Iatron — Prompt de ativação do ambiente

> Use este arquivo como primeiro prompt ao retomar o projeto. Ele contém
> identificadores e procedimentos operacionais, mas **não contém segredos**.
> Senhas, tokens, API keys, service-role keys e credenciais de banco devem
> permanecer exclusivamente nos cofres oficiais de cada plataforma.

## Prompt para o agente

Você está retomando o projeto **Iatron**, repositório GitHub
`g4trader/iatron_edtech`.

Antes de implementar, publicar ou diagnosticar qualquer funcionalidade:

1. leia integralmente o `AGENTS.md` da raiz;
2. leia os documentos obrigatórios indicados por ele;
3. leia `docs/product/AGENT_BOOTSTRAP.md` e
   `docs/product/IATRON_CONSTITUTION.md`;
4. preserve alterações locais e nunca use `reset --hard`, `clean`, force push
   ou reescrita de histórico;
5. confirme a identidade ativa em cada plataforma antes de qualquer ação;
6. nunca use contas, organizações, projetos ou credenciais de outros produtos;
7. nunca revele segredos em comandos, logs, commits, relatórios ou respostas.

## Identidade e infraestrutura canônicas

A seção de reconexão abaixo registra a recuperação inicial. Para a revisão
mais recente, consulte os workflows CI, Deploy API Staging e E2E Staging do
GitHub e compare seus SHAs com `/health` e o header do frontend.
O PR #1 reúne os ajustes permanentes de automação e as evidências dessa recuperação.

### Reconexão de infraestrutura em 26 de outubro de 2026

O destino autorizado pelo proprietário é `stg1-512818` (`252903354297`),
com a conta `doctoravatar.app@gmail.com` e configuração CLI `iatron-stg1`.
Esse destino substitui `staging-503122` e `stg2-512817`. Os recursos antigos
foram preservados; não são destinos para novos deploys.

- Faturamento, APIs, Artifact Registry `iatron`, Cloud Run, Secret Manager,
  contas de serviço e WIF foram configurados no destino.
- Os três segredos de runtime foram transferidos com autorização explícita,
  diretamente entre cofres, sem exibição dos valores.
- API canônica: `https://iatron-api-staging-joadb4qnqa-uw.a.run.app`.
- Vercel: conta `iatronedtech-4883`, team `iatron`, projeto
  `prj_ipKgeQoQ669m29TtSUf9p8bC2Nw9`, alias `https://go.iatron.com.br`.
- `NEXT_PUBLIC_API_URL` no ambiente Production desse projeto dedicado de
  staging aponta para a API acima, com sufixo `/v1`.
- Supabase: `dajdcecjaobdsgatubsb`, organização `rhrmsnsolhqoontkuupc`,
  restaurado pelo proprietário e confirmado `ACTIVE_HEALTHY`.
  Sempre usar `--profile iatron` na CLI; o perfil padrão não é o deste produto.
- GitHub Environment `staging`: projeto, contas de serviço, WIF e URL da API
  foram atualizados e conferidos.
- O bootstrap agora reproduz os acessos necessários ao deploy. Ele cria os
  recipientes dos segredos, mas não transfere seus valores.
- CI e E2E usam Ubuntu 24.04, compatível com o Playwright do repositório.
- O deploy usa separador explícito `|` na flag do gcloud para preservar a
  vírgula de `SUPABASE_JWT_ALGORITHMS`. Apenas colocar aspas no input
  `env_vars` da action não foi suficiente. O workflow confere o valor
  efetivamente gravado no Cloud Run antes de executar o smoke.

A cópia operacional recuperada está em
`/Users/lucianoterres/Developer/iatron_edtech`, fora do iCloud e vinculada aos
projetos Vercel e Supabase corretos. A pasta original em `Documents/GitHub 2`
foi preservada com suas alterações; arquivos descarregados no iCloud bloqueiam
operações Git nessa pasta. Não sobrescrevê-la nem apagar seu conteúdo.

O [PR #1](https://github.com/g4trader/iatron_edtech/pull/1) integrou as correções
iniciais. Consulte as execuções mais recentes dos workflows e compare os SHAs
antes de continuar. Não use um SHA histórico como referência permanente.
As evidências iniciais e as limitações estão em
[reativação de staging](docs/staging-reactivation-2026-10-26.md).

### GitHub

- Repositório: `g4trader/iatron_edtech`
- Conta autorizada: `g4trader`
- Branch principal: `main`
- Ambiente do GitHub Actions: `staging`
- Não usar: conta ou credenciais `vempratorres` — pertencem a outro projeto.

Verificação:

```bash
gh auth status
gh repo view g4trader/iatron_edtech
git remote -v
git status --short --branch
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

Se a conta ativa não for `g4trader`, interrompa ações de escrita e autentique a
conta correta antes de continuar.

### Vercel

- Team: `IATRON`
- Scope/slug usado pela CLI: `iatron`
- Conta/projeto acessível em: `https://vercel.com/iatron`
- Projeto: `iatron-web-staging`
- URL pública canônica: `https://go.iatron.com.br`
- Hosting: frontend Next.js
- Ambiente operacional atual: staging, mesmo quando o alias é promovido com
  `--prod` dentro do projeto dedicado de staging.

Verificação:

```bash
vercel whoami
vercel project inspect iatron-web-staging --scope iatron
curl -sSI https://go.iatron.com.br/login
```

O header `x-iatron-build-sha` deve coincidir com o commit que está sendo
validado. Antes de publicar, confirme que `.vercel/project.json` aponta para o
projeto acima. Nunca associe este repositório a outro team ou projeto.

### Google Cloud

- Projeto: `stg1-512818`
- Conta autorizada: `doctoravatar.app@gmail.com`
- Configuração CLI: `iatron-stg1`
- Região principal: `us-west1`
- API Cloud Run: `iatron-api-staging`
- URL canônica usada pelo E2E:
  `https://iatron-api-staging-joadb4qnqa-uw.a.run.app`
- Artifact Registry: `iatron`
- Deploy service account:
  `iatron-deploy@stg1-512818.iam.gserviceaccount.com`
- Runtime service account:
  `iatron-api-staging@stg1-512818.iam.gserviceaccount.com`
- Workload Identity Provider:
  `projects/252903354297/locations/global/workloadIdentityPools/github-actions/providers/github`

Verificação:

```bash
gcloud auth list
gcloud config get-value project
gcloud config configurations activate iatron-stg1
gcloud run services describe iatron-api-staging \
  --project=stg1-512818 --region=us-west1
curl -sS https://iatron-api-staging-joadb4qnqa-uw.a.run.app/health
curl -sS https://iatron-api-staging-joadb4qnqa-uw.a.run.app/ready
```

`health` e `ready` devem retornar HTTP 200. O `buildSha`, o contrato
`journey-v1` e o baseline de migration devem ser comparados com frontend e
GitHub antes do E2E.

### Supabase

- Projeto canônico usado pelo staging publicado:
  `dajdcecjaobdsgatubsb`
- URL: `https://dajdcecjaobdsgatubsb.supabase.co`
- Dashboard do projeto:
  `https://supabase.com/dashboard/project/dajdcecjaobdsgatubsb`
- Auth, PostgreSQL, Storage e RLS pertencem a esse projeto.
- Segredos são mantidos no GitHub Environment `staging`, no Secret Manager do
  GCP e nos ambientes server-side autorizados.

**Atenção:** a organização Supabase informada mais recentemente foi
`afeqnhmorwkrflrghnkl`, mas o projeto visível `tvhjqojceuuebiggpyud` não possui
o schema do Iatron e **não deve substituir** o projeto canônico acima. Se a
conta autenticada não enxergar `dajdcecjaobdsgatubsb`, não aplique migrations e
não altere URLs; relate a falta de acesso ao projeto correto.

Verificação segura:

```bash
supabase projects list --profile iatron
```

Antes de `supabase link`, `db push`, migrations, seed ou pgTAP remoto, confirme
explicitamente que o project ref é `dajdcecjaobdsgatubsb`. Nunca mostre a senha
do banco ou tokens no terminal compartilhado.

## Configuração esperada no GitHub Environment `staging`

Confirme somente a existência, nunca os valores.

Secrets esperados:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_STAGING_DB_PASSWORD`
- `SUPABASE_STAGING_DATABASE_URL`
- `SUPABASE_STAGING_PUBLISHABLE_KEY`
- `SUPABASE_STAGING_SERVICE_ROLE_KEY`

Variáveis operacionais esperadas:

- `SUPABASE_STAGING_PROJECT_ID=dajdcecjaobdsgatubsb`
- `SUPABASE_STAGING_URL=https://dajdcecjaobdsgatubsb.supabase.co`
- `E2E_WEB_BASE_URL=https://go.iatron.com.br`
- `E2E_API_BASE_URL=https://iatron-api-staging-joadb4qnqa-uw.a.run.app`
- `GCP_PROJECT_ID=stg1-512818`
- `GCP_REGION=us-west1`
- `GCP_ARTIFACT_REPOSITORY=iatron`
- `GCP_DEPLOY_SERVICE_ACCOUNT`
- `GCP_RUNTIME_SERVICE_ACCOUNT`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `CORS_ALLOWED_ORIGINS` incluindo `https://go.iatron.com.br`

Use `gh secret list --env staging` e `gh variable list --env staging` para
validar nomes. Não tente ler valores de secrets.

## Procedimento de retomada

1. Confirme que o diretório atual é o clone de `g4trader/iatron_edtech`.
2. Verifique integridade, branch, remoto, HEAD e alterações locais.
3. Confirme `g4trader` no GitHub, team `IATRON` na Vercel, projeto
   `stg1-512818` no GCP e project ref `dajdcecjaobdsgatubsb` no Supabase.
4. Consulte o último CI, deploy e E2E sem disparar novas execuções.
5. Compare o SHA de `origin/main`, frontend e API.
6. Só corrija autenticação ou configuração se houver divergência comprovada.
7. Não altere produção nem migre para outro projeto Supabase por inferência.
8. Depois de alinhado, execute apenas as validações necessárias ao pedido.

Comandos de diagnóstico inicial:

```bash
gh run list -R g4trader/iatron_edtech --limit 10
vercel whoami
gcloud auth list
gcloud config get-value project
supabase projects list --profile iatron
curl -sSI https://go.iatron.com.br/login
curl -sS https://iatron-api-staging-joadb4qnqa-uw.a.run.app/health
curl -sS https://iatron-api-staging-joadb4qnqa-uw.a.run.app/ready
```

## Publicação e integridade de SHA

O staging só está alinhado quando:

```text
origin/main SHA
       = frontend x-iatron-build-sha
       = API health.buildSha
       = API ready.buildSha
       = SHA esperado pelo E2E
```

Se o commit altera exclusivamente testes ou documentação, frontend e API podem
ser versões funcionalmente compatíveis, mas o mecanismo de alinhamento pode
exigir o mesmo `BUILD_SHA`. Registre essa compatibilidade de forma explícita;
jamais declare uma imagem reconstruída quando ela não foi reconstruída.

Fluxos oficiais:

- Deploy API: workflow `Deploy API Staging`
- E2E: workflow `E2E Staging`
- Comando local correspondente ao E2E: `pnpm test:e2e:auth`

Não execute E2E destrutivo contra um projeto Supabase não confirmado.

## Último estado conhecido em 4 de agosto de 2026

- Branch: `main`
- Último SHA validado antes da criação deste documento:
  `065e8d6428213f985ec5e7dc4959743e24b5ccd9`
- Frontend: HTTP 200 em `https://go.iatron.com.br`
- API: health e ready HTTP 200
- Contrato: `journey-v1`
- Migration baseline: `202607270002`
- E2E autenticado: aprovado, 4 de 4 cenários
- Evidência:
  `https://github.com/g4trader/iatron_edtech/actions/runs/30947366649`

Esse estado é apenas um ponto de partida. Sempre confirme o estado atual antes
de agir; não trate este SHA como permanente.

## Regras de segurança e parada

- Não armazenar neste arquivo nenhum segredo real.
- Não copiar segredos entre projetos sem autorização explícita.
- Não usar service-role no frontend ou bundle público.
- Não imprimir variáveis sensíveis para “testar” se existem.
- Não alterar IAM, callbacks, CORS, secrets ou migrations preventivamente.
- Se uma identidade ou projeto não puder ser confirmado, interromper a escrita
  e informar exatamente qual acesso precisa ser concedido.
- Se houver working tree suja, preservar o trabalho e delimitar a intervenção.
- Ao concluir a ativação, informar contas ativas, projetos confirmados, SHAs,
  health/ready e qualquer bloqueio — sem revelar credenciais.

## Resposta esperada após a ativação

Responda de forma objetiva:

```text
Repositório:
GitHub:
Vercel:
GCP:
Supabase:
Branch e HEAD:
SHA frontend:
SHA API:
Health:
Ready:
Último CI/E2E:
Segredos necessários:
Bloqueios:
Working tree:
Ambiente pronto para continuar: SIM/NÃO
```
