# Ambiente ativo de desenvolvimento e validação

> Migração GCP autorizada em 26 de outubro de 2026: destino `stg1-512818`, conta
> `doctoravatar.app@gmail.com`, região `us-west1`, configuração CLI `iatron-stg1`.
> Este destino substitui `stg2-512817`. Acesso Owner e faturamento ativo
> confirmados; segredos transferidos com autorização. API implantada em
> `https://iatron-api-staging-joadb4qnqa-uw.a.run.app`, health HTTP 200.
> Supabase restaurado e `ACTIVE_HEALTHY`; health e ready HTTP 200.
> Variáveis de staging no GitHub atualizadas para o novo GCP.
> Vercel autenticada como `iatronedtech-4883`; URL da nova API configurada e
> frontend republicado em `go.iatron.com.br` (deployment
> `dpl_2RwpZsswgyzSC2itnx3Py2wngaGe`, login HTTP 200).
> Smoke e gate de alinhamento aprovados no commit `9d813325752d`.
> Quatro cenários autenticados aprovados, com repetição do editorial após
> corrigir seus seletores. Correções da automação no PR #1, sem merge.
> Consulte também [as evidências da validação](staging-reactivation-2026-10-26.md).
> Consulte o estado e a sequência de retomada em
> [prompt_ativacao.md](../prompt_ativacao.md).

O ambiente atual contém somente dados fictícios e permite limpeza controlada.
A referência oficial para desenvolvimento, validação visual e aceite do
stakeholder é `https://go.iatron.com.br`. Um deployment em outro domínio não
representa aceite.

Antes do primeiro uso, confirme no painel Supabase que
`dajdcecjaobdsgatubsb` é dedicado ao Iatron, anote a região e não reutilize um
projeto com dados reais.

## Checklist do proprietário

1. Supabase: confirme o nome `iatron-staging`, região, plano e ausência de dados
   reais. Crie um access token de automação e guarde-o em GitHub Secret
   `SUPABASE_ACCESS_TOKEN`; não envie o valor no chat.
2. GitHub Environment `staging`: crie as variables e secrets descritas em
   [secrets-management.md](secrets-management.md). Configure reviewers se o seed
   remoto exigir aprovação humana.
3. GCP `stg1-512818`, conta `doctoravatar.app@gmail.com`: use `us-west1`, próximo ao Supabase `us-west-2`.
   O bootstrap cria IAM, Artifact Registry, Secret Manager e WIF; confirme sempre
   o projeto explicitamente porque o projeto padrão local pode ser outro.
4. Vercel: autentique `iatron.edtech@gmail.com`, selecione a equipe correta,
   importe este repositório como projeto `iatron-web-staging`, root directory
   `apps/web`, production branch `main` e configure as variáveis públicas no
   ambiente Production desse projeto.
5. Supabase Auth: use `https://go.iatron.com.br` como Site URL; cadastre
   `https://go.iatron.com.br/auth/callback` e
   `https://go.iatron.com.br/redefinir-senha`. Evite wildcard global de
   `vercel.app`.

Localhost pode continuar autorizado para depuração, mas não é necessário ao
pipeline cloud.

## Recursos implantados

- Web oficial: `https://go.iatron.com.br`.
- API: serviço Cloud Run `iatron-api-staging`, região `us-west1`.
- Banco/Auth: projeto Supabase `dajdcecjaobdsgatubsb`, região `us-west-2`.

O primeiro deploy da web pode ser feito pelo CLI. A automação por push só fica
ativa depois que o GitHub App da Vercel recebe acesso explícito ao repositório
privado.

Uma separação futura entre development, staging e production deverá ser
configurada e documentada formalmente antes de alterar este processo.
