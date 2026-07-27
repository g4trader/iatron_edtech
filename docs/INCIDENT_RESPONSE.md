# Resposta a incidentes

Este guia é o caminho curto para investigar e recuperar o staging do Iatron.
Não copie tokens, e-mails, prompts ou respostas de estudantes para chamados.

## Severidade e decisão

- **SEV-1:** indisponibilidade ampla, exposição/perda de dados, autenticação
  quebrada ou jornada principal inacessível. O Staff Engineer coordena; Founder
  decide comunicação e rollback com o Release Manager.
- **SEV-2:** função crítica degradada, grupo relevante afetado ou 5xx
  recorrente. Staff Engineer decide rollback técnico reversível.
- **SEV-3:** problema localizado, com alternativa e impacto limitado. O owner
  do domínio corrige no fluxo normal.

Pare mutações e revogue credenciais primeiro quando houver suspeita de
exposição. Preserve evidências sem dados pessoais.

## Identificar a release

1. `curl -i https://go.iatron.com.br` mostra `x-iatron-build-sha`.
2. `curl https://iatron-api-staging-sjbe4ymhya-uw.a.run.app/v1/meta` mostra SHA
   da API, ambiente, schema, revisão e build.
3. `/health` confirma processo; `/ready` confirma configuração mínima.
4. Compare com `main` e `staging` no GitHub antes de alterar tráfego.

## Localizar uma falha

Use o código de suporte exibido ao usuário como `request_id`.

```bash
gcloud logging read \
  'resource.type="cloud_run_revision" AND jsonPayload.request_id="CODIGO"' \
  --project=staging-503122 --limit=50
```

Consulte somente campos estruturados. Não exporte payloads. Na Vercel, abra o
deployment associado ao SHA e filtre Functions Logs pelo horário e rota.

## Verificar dependências

- **Cloud Run:** revisão com 100% do tráfego, `/health` e `/ready` em 200.
- **Vercel:** deployment `Ready`, aliases oficiais e SHA no header.
- **Supabase:** status do projeto, Auth e uma consulta mínima; nunca cole
  service-role em terminal compartilhado.
- **E-mail/Resend:** estado do domínio, evento pelo provider ID e falhas de
  entrega; não copie links de confirmação/recuperação.
- **OpenAI:** filtre `dependency=openai`, duração, status e provider ID. Não
  registre ou copie o prompt completo.

## Rollback seguro

### Frontend

Promova na Vercel o deployment anterior identificado e compatível. Confirme o
SHA pelo header e preserve o deployment com falha para investigação.

### API

Liste revisões do `iatron-api-staging`, confirme imagem e schema compatíveis e
direcione tráfego para a revisão anterior. Não reconstrua uma imagem antiga.

### Banco

Migrations são aditivas. Prefira roll-forward. Não remova coluna/tabela nem
execute downgrade destrutivo durante incidente. Uma API antiga só pode voltar
se for compatível com o schema atual.

### Feature ou rota

Use feature flag já existente ou retire tráfego da revisão problemática. Não
crie fallback com dados fictícios.

## Smoke pós-rollback

- login e logout;
- `/health` e `/ready`;
- jornada Student;
- workspace Mentor;
- workspace Editorial;
- Executive Console Admin;
- isolamento 403 entre papéis;
- ausência de 5xx no período do smoke.

## Alertas mínimos

No Google Cloud Monitoring, manter políticas sem dados pessoais:

- taxa de respostas 5xx do Cloud Run acima de 2% por 5 minutos;
- `/ready` em 503 por duas verificações consecutivas;
- revisão Cloud Run sem instância saudável por 5 minutos;
- `dependency_call` com `openai` e falha/timeout recorrente;
- `dependency_call` com `email` e três falhas em 15 minutos;
- `ADMIN_*`/`DEPENDENCY_UNAVAILABLE` recorrente em 10 minutos;
- falha de Cloud Build ou workflow de deploy.

Na Vercel, habilitar notificações de deployment failed para o projeto staging.
O canal de notificação deve ser cadastrado pelo owner; nenhuma política envia
corpo da requisição, e-mail de usuário ou conteúdo clínico.

## Encerramento

1. registre severidade, início, impacto, SHAs e request IDs;
2. descreva causa comprovada e ação aplicada;
3. valide o smoke e monitore por pelo menos 15 minutos;
4. encerre com owner e horário;
5. crie ação preventiva pequena, com responsável, sem ampliar o incidente para
   uma refatoração.
