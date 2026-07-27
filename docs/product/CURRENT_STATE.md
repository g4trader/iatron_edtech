# Iatron — Current State

Snapshot em **2026-07-27**, produzido a partir da `main` remota, workflows e
ambiente staging acessível.

## Identidade do snapshot

| Item                 | Estado                                                              | Evidência                                                |
| -------------------- | ------------------------------------------------------------------- | -------------------------------------------------------- |
| Branch documentada   | `main`                                                              | clone limpo da remota                                    |
| Base Git auditada    | `0cf86553a595be7b4c365ad7568cd16a90864750`                          | handoff anterior na `main`                               |
| Frontend publicado   | `8707348`                                                           | deployment Vercel da branch `main`                       |
| API publicada        | `7d67d78`                                                           | `GET /v1/meta`                                           |
| Compatibilidade      | compatíveis neste snapshot                                          | commits entre `7d67d78` e `8707348` alteram documentação |
| Cloud Run            | `iatron-api-staging-00040-hqr`, 100% do tráfego                     | serviço staging                                          |
| Vercel               | `dpl_3nfHB8PrESD52EjzyLAq1au6JGWj`, Ready                           | projeto `iatron-web-staging`                             |
| URL oficial          | `https://go.iatron.com.br`                                          | staging oficial                                          |
| API                  | `https://iatron-api-staging-sjbe4ymhya-uw.a.run.app`                | Cloud Run                                                |
| Supabase project ref | `dajdcecjaobdsgatubsb`                                              | configuração staging                                     |
| Baseline da API      | `202607270002`                                                      | `/v1/meta`                                               |
| Migrations no código | 30; última `202607270002_knowledge_library_duplicate_decisions.sql` | `supabase/migrations`                                    |

## Confirmado no ambiente

- `GET /health`: HTTP 200.
- `GET /ready`: HTTP 200.
- `GET /v1/meta`: ambiente `staging`, API SHA `7d67d78`, schema
  `202607270002`, revisão `iatron-api-staging-00040-hqr`.
- Frontend oficial resolve para deployment Vercel Ready da `main` em `8707348`.
- O frontend e a API não usam o mesmo SHA, mas a diferença observada é somente
  documental. Uma próxima mudança de código deve restabelecer alinhamento.

## Confirmado em CI

- CI completa (install, lint, typecheck, unitários, Supabase local, pgTAP local,
  build e E2E mock) estava verde em `7d67d78`.
- CI de `8707348` estava em andamento no instante do snapshot; não é correto
  declará-la verde neste documento.
- `Deploy Supabase Staging` de `7d67d78` falhou após migrations atualizadas, no
  seed remoto: o runner não alcançou o host de banco via IPv6
  (`Network is unreachable`).
- Por causa dessa falha, pgTAP remoto e os workflows dependentes de deploy da
  API/E2E foram ignorados nessa cadeia.

## Testes

| Verificação                                     | Estado                                         |
| ----------------------------------------------- | ---------------------------------------------- |
| Lint/typecheck/unitários/build                  | confirmado em CI no SHA `7d67d78`              |
| pgTAP local                                     | confirmado em CI no SHA `7d67d78`              |
| E2E mock                                        | confirmado em CI no SHA `7d67d78`              |
| pgTAP remoto                                    | pendente; etapa não alcançada na última cadeia |
| E2E autenticado staging                         | pendente na cadeia atual; workflow ignorado    |
| Validação manual dos quatro perfis no SHA atual | não repetida neste snapshot                    |

## Confirmado no código

Concluído/implementado no repositório:

- monorepo, web Next.js, API Fastify, Supabase e contratos compartilhados;
- autenticação, sessão SSR, RBAC e quatro experiências separadas:
  Student `/app`, Mentor `/review`, Editorial `/editorial`, Admin `/admin`;
- domínio acadêmico, competência central, especialidade e ownership científico;
- Learning Engine, diagnóstico 3.0, plano determinístico e Tutor contextual;
- Content/Exam Intelligence AMRIGS, editorial e biblioteca de conhecimento;
- health, ready, meta, logs estruturados e rastreabilidade administrativa;
- migrations, RLS, pgTAP, E2E mock e E2E autenticado no repositório.

Parcial ou limitado:

- simulados: existe entrada de jornada como `upcoming`, sem fluxo integrado;
- conteúdo: pipeline e recorte AMRIGS existem, mas o conjunto é piloto, não
  suficiente para escala de beta;
- política de aptidão: há elegibilidade editorial de questões para diagnóstico,
  mas não foi localizada uma política configurável de aptidão do MVP;
- validação remota: pgTAP e E2E autenticado não fecharam na última cadeia
  automática por bloqueio de conectividade do seed.

Ocultado/indisponível:

- página interna do design system retorna `notFound()` em produção;
- simulados aparecem apenas como etapa futura da jornada;
- conteúdo não publicado é protegido pelas rotas/workspaces editoriais.

## Working trees

- Clone usado para este snapshot: limpo antes da criação do pacote.
- Cópia local original em
  `/Users/lucianoterres/Documents/GitHub 2/iatron_edtech`: branch local em
  `0b25256`, `origin/main` local desatualizada e alterações do usuário
  preservadas.
- Alterações rastreadas conhecidas na cópia original:
  `apps/web/src/app/(public)/auth/actions.ts`,
  `apps/web/src/lib/auth.test.ts`, `apps/web/src/lib/auth.ts`.
- Não rastreados conhecidos: cinco arquivos duplicados terminados em
  `page 2.tsx`/`adaptive-page 2.tsx` nas rotas de assessment.
- Não limpar, resetar, sobrescrever ou incorporar esses arquivos sem revisão do
  proprietário.

## Bloqueios e limitações

1. A cadeia remota de banco falha no seed por conectividade IPv6 do runner.
2. pgTAP remoto e E2E autenticado precisam ser reexecutados após resolver o item 1.
3. A main local original está divergente e suja; trabalhos devem preservar essa cópia.
4. A cobertura acadêmica é um piloto AMRIGS, não um catálogo amplo revisado.

## Próxima prioridade oficial do MVP

Conforme a ordem fornecida na tarefa de handoff:

1. política de aptidão configurável;
2. simulados integrados ao ciclo;
3. conteúdo acadêmico suficiente e revisado;
4. consolidação;
5. beta controlado.

O primeiro item é a próxima prioridade conforme o artigo 22 da
[`IATRON_CONSTITUTION.md`](IATRON_CONSTITUTION.md). Sua implementação continua
dependente de uma tarefa/RFC vigente.

## Divergências encontradas

| Documento/expectativa                                     | Código/ambiente                                            | Impacto                                              | Fonte atual                                  | Decisão necessária                                     |
| --------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| Bootstrap diz que os quatro workspaces estão operacionais | E2E autenticado atual não fechou na cadeia automática      | estado operacional não foi revalidado no SHA atual   | código + último CI verde + ambiente saudável | reexecutar cadeia remota                               |
| Fluxo de deploy prevê seed → pgTAP → API → E2E            | seed remoto falha por rede; etapas seguintes são ignoradas | pipeline incompleto                                  | logs do workflow                             | corrigir acesso do runner ao pooler/host IPv4 aprovado |
| Baseline da API é `202607270002`                          | workflow remoto não confirmou pgTAP após essa baseline     | schema publicado existe, validação remota incompleta | `/v1/meta`                                   | executar pgTAP remoto                                  |
| Frontend `8707348` e API `7d67d78`                        | SHAs diferentes                                            | rastreabilidade exige compatibilidade explícita      | diff Git documental                          | realinhar no próximo deploy de código                  |
