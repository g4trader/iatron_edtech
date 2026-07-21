# Rollback

- Vercel: promover deployment anterior validado ou reverter o commit.
- Cloud Run: direcionar 100% do tráfego para a revisão anterior pelo painel ou
  `gcloud run services update-traffic`.
- Banco: não executar down migration destrutiva automática. Criar migration
  corretiva forward-only; restaurar backup/PITR somente com análise de perda e
  aprovação do proprietário.

Rollback de aplicação não desfaz schema. Por isso migrations incompatíveis usam
expansão/contração: primeiro mudanças retrocompatíveis, depois deploys, e remoção
somente em uma fase posterior.
