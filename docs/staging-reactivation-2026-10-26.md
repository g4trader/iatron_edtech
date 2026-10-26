# Reativação e alinhamento de staging — 26 de outubro de 2026

## Recuperação inicial validada

- Repositório: `g4trader/iatron_edtech`.
- Commit: `9d813325752d97e506d5c08d8bf1424b08dc2d3d`.
- Frontend: `https://go.iatron.com.br`, deployment
  `dpl_2RwpZsswgyzSC2itnx3Py2wngaGe`, conta Vercel `iatronedtech-4883`.
- API: `https://iatron-api-staging-joadb4qnqa-uw.a.run.app`, projeto
  `stg1-512818`, região `us-west1`, revisão `iatron-api-staging-00002-jsd`.
- Conta operacional GCP: `doctoravatar.app@gmail.com`.
- Supabase: `dajdcecjaobdsgatubsb`, restaurado pelo proprietário e confirmado
  `ACTIVE_HEALTHY`, perfil CLI `iatron`.
- Contrato: `journey-v1`; baseline: `202607270002`.
- Gate oficial `scripts/assert-staging-alignment.mjs`: aprovado.
- Health e ready: HTTP 200. Rota `/v1/me` sem autenticação: HTTP 401.

## Build e deploy

A primeira migração copiou a imagem antiga sem reconstrução. O alinhamento
posterior construiu de fato a imagem do commit acima:

- [Cloud Build](https://console.cloud.google.com/cloud-build/builds/feae9b9f-07e3-459c-ab61-ffe2fbddeed3?project=stg1-512818): sucesso.
- Digest: `sha256:9a7ebf6a2ff452b5b26e5030709c712b3f515ca79857283015bbad9576f53281`.
- [Workflow de deploy](https://github.com/g4trader/iatron_edtech/actions/runs/40379608017):
  build aprovado, publicação recusada por permissão de leitura no Artifact
  Registry. Não declarar esse workflow como aprovado.
- A permissão foi corrigida. A publicação final foi feita pela CLI com o digest
  construído, preservando configuração e segredos e atualizando SHA/timestamp.
- O workflow também separava `ES256,RS256` em duas variáveis. A correção
  coloca o valor entre aspas, conforme a documentação da action.
- [PR #1](https://github.com/g4trader/iatron_edtech/pull/1), em rascunho:
  corrige o valor citado, fixa `ubuntu-24.04` nos workflows CI/E2E e corrige os
  seletores do teste editorial. Último commit `533e335`; não houve merge nem
  alteração do release.

## Permissões complementares aplicadas

O bootstrap original não configurava todos os acessos necessários à automação.
As seguintes permissões foram aplicadas no projeto de destino:

- Deploy: `roles/serviceusage.serviceUsageConsumer` e
  `roles/storage.bucketViewer` no projeto. O SDK verifica a propriedade do
  bucket por `storage.buckets.list`.
- Bucket exclusivo `stg1-512818_cloudbuild`, em `us-west1`, com acesso uniforme:
  deploy recebe `roles/storage.objectCreator` e `roles/storage.legacyBucketReader`;
  conta de build recebe `roles/storage.objectViewer`.
- Deploy recebe `roles/iam.serviceAccountUser` na conta de build
  `252903354297-compute@developer.gserviceaccount.com`.
- Deploy recebe `roles/artifactregistry.reader` somente no repositório `iatron`.
- Conta de build recebe `roles/logging.logWriter` e escrita no registro;
  runtime acessa somente os segredos necessários à API.

Nenhum valor secreto foi incluído nesta evidência. A transferência dos três
segredos entre cofres foi autorizada explicitamente pelo proprietário.

## Validação

Foi usado um clone isolado do commit remoto em
`/tmp/iatron-release-stg1-20261026`, preservando o checkout original.

- `pnpm install --frozen-lockfile`: aprovado.
- `pnpm lint`: aprovado.
- `pnpm typecheck`: aprovado.
- `pnpm test`: aprovado; 151 testes da API, 97 do frontend, 25 de contratos,
  6 de IA e 9 verificações de proteção cloud/importação.
- `pnpm build`: aprovado.
- `pnpm test:e2e:mock`: 108 aprovados, 22 ignorados pelas condições dos projetos;
  desktop, iPhone SE, iPhone 13, Pixel 7 e tablet.
- Formatação e `git diff --check` das alterações locais: aprovados.
- [E2E autenticado no GitHub](https://github.com/g4trader/iatron_edtech/actions/runs/40381159058):
  falhou antes dos cenários, pois Playwright 1.55 não suporta Ubuntu 26.04,
  então oferecido por `ubuntu-latest`.
- Suíte autenticada local contra staging: três cenários passaram na primeira
  execução; o editorial excedeu o timeout ao procurar o UUID removido
  intencionalmente do título pela interface. Não era falha da infraestrutura.
- Corrigidos os seletores editoriais para o ID da versão nos formulários e no
  link de revisão. A transição `awaiting_mentor_review` é verificada para essa
  mesma versão no banco, além da mensagem humana da interface. Aprovação,
  publicação, auditoria e acesso do aluno continuam sendo verificados.
- Repetição direcionada do editorial: aprovada em 1,8 minuto. Resultado dos
  quatro cenários: aprovados, considerando a repetição. Não houve segunda
  execução integral da suíte após a correção apenas dos seletores.
- Credenciais carregadas em memória e traces desativados somente nessas
  execuções; a configuração original de trace foi restaurada depois.

Warnings observados: outputs ausentes em tarefas do Turborepo, aviso de
`NO_COLOR`/`FORCE_COLOR`, depreciação de `url.parse()` e scripts de instalação
ignorados pelo pnpm. As validações descritas acima passaram apesar desses avisos.

O CI histórico do main falhou por indisponibilidade de runner. O GitHub recusou
a repetição por ter mais de um mês. O
[novo CI no PR](https://github.com/g4trader/iatron_edtech/actions/runs/40381735129)
passou integralmente no commit `47c7012`, incluindo pgTAP, build e E2E
demonstrativo. A revisão posterior `533e335`, que adiciona o seletor editorial
validado localmente contra staging, ainda aguarda confirmação do seu próprio CI.
Não apresentar o resultado anterior como aprovação desse novo commit.
Nenhuma migration ou seed foi
executada contra o Supabase remoto nesta retomada; as fixtures previstas pelo
E2E autenticado criam dados de teste em staging.

## Rollback e limites

A revisão `iatron-api-staging-00001-xhd` permanece disponível para rollback da
API no mesmo projeto. O deployment Vercel anterior é
`dpl_AJkYqeDtPiLQ4vVLm3qj5Mdrb7W1`, mas usa a URL GCP antiga: não promovê-lo sem
restabelecer uma API saudável nesse endereço ou reconstruí-lo com a URL atual.

Não houve validação manual da jornada autenticada. O arquivo gerado pelo build
e a configuração temporária de trace foram restaurados no checkout isolado;
a correção do teste permanece na branch do PR. O checkout original contém as
alterações de documentação e workflow desta sessão, ainda sem commit local.

## Fechamento da automação

O PR #1 também incorpora ao bootstrap os acessos de upload, leitura de imagem,
logs, impersonação da conta de build e acesso do runtime aos três segredos,
que foram necessários na recuperação. O bootstrap cria somente os recipientes
no Secret Manager; não copia valores entre projetos.
O timestamp publicado pela API passa a representar a conclusão do build no
workflow, em vez da data de atualização do repositório.

Os resultados acima são evidências históricas, anteriores ao merge. A validação
final deve ser consultada nas execuções do commit integrado:

- [CI](https://github.com/g4trader/iatron_edtech/actions/workflows/ci.yml)
- [Deploy API Staging](https://github.com/g4trader/iatron_edtech/actions/workflows/deploy-api-staging.yml)
- [E2E Staging](https://github.com/g4trader/iatron_edtech/actions/workflows/e2e-staging.yml)

Antes de desenvolver, comparar o SHA desses workflows, `origin/main`, o header
`x-iatron-build-sha` do frontend e `/health` e `/ready` da API. O checkout
original foi preservado; a integração usa uma branch isolada para evitar
sobrescrever alterações preexistentes.
