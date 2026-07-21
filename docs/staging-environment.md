# Ambiente de staging

Staging contém somente dados fictícios e permite limpeza controlada. Antes do
primeiro uso, confirme no painel Supabase que `dajdcecjaobdsgatubsb` é dedicado
ao Iatron staging, anote a região e não reutilize um projeto com dados reais.

## Checklist do proprietário

1. Supabase: confirme o nome `iatron-staging`, região, plano e ausência de dados
   reais. Crie um access token de automação e guarde-o em GitHub Secret
   `SUPABASE_ACCESS_TOKEN`; não envie o valor no chat.
2. GitHub Environment `staging`: crie as variables e secrets descritas em
   [secrets-management.md](secrets-management.md). Configure reviewers se o seed
   remoto exigir aprovação humana.
3. GCP `staging-503122`: autentique `easywayconsultoria@gmail.com`, confirme
   billing e escolha `GCP_REGION` preferencialmente próxima ao Supabase. Execute
   `infra/gcp/bootstrap.sh` após revisar custos e IAM.
4. Vercel: autentique `iatron.edtech@gmail.com`, selecione a equipe correta,
   importe este repositório como projeto `iatron-web-staging`, root directory
   `apps/web`, production branch `staging` e configure somente as variáveis
   públicas de Preview/Staging.
5. Supabase Auth: use a URL Vercel estável como Site URL; cadastre exatamente
   `<staging-url>/auth/callback` e `<staging-url>/redefinir-senha`. Evite wildcard
   global de `vercel.app`.

Localhost pode continuar autorizado para depuração, mas não é necessário ao
pipeline cloud.
