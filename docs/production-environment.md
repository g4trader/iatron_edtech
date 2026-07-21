# Ambiente de produção

Produção exige um projeto Supabase separado, serviço `iatron-api-production`,
projeto Vercel de produção, service accounts e secrets próprios. O project ref
de produção deve ser registrado como `SUPABASE_PRODUCTION_PROJECT_ID`; isso faz
os scripts de staging recusarem esse destino.

O workflow é manual e protegido pelo GitHub Environment `production`, com
reviewer obrigatório. Ele não está autorizado a implantar enquanto staging não
for aceito. Seed fictício e E2E destrutivo são proibidos em produção.

Antes do primeiro deploy: definir região/capacidade com métricas de staging,
configurar backup/PITR conforme o plano Supabase, revisar migrations críticas e
executar o runbook de rollback.
