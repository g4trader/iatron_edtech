# Deploy cloud

Fluxo de staging:

```text
CI → migrations → seed protegido → pgTAP → tipos/drift → Cloud Run
→ Vercel pela integração Git → smoke → E2E real
```

Os workflows são `ci.yml`, `deploy-supabase-staging.yml`,
`deploy-api-staging.yml` e `e2e-staging.yml`. A Vercel gera previews pela
integração Git; não há Action redundante. Nenhum workflow funciona antes de os
GitHub Environments e secrets serem configurados.

O GCP usa Workload Identity Federation, sem chave JSON. O bootstrap cria
Artifact Registry `iatron`, contas `iatron-deploy` e `iatron-api-staging`, secrets
vazios e o provider OIDC. Adicione versões dos secrets pelo painel/CLI seguro,
nunca por argumento que fique no histórico. Após o primeiro deploy, conceda
invocação pública ao serviço staging somente se a API realmente precisar ser
acessada pelo browser; autenticação de domínio continua obrigatória em `/v1`.

O frontend Vercel usa root `apps/web`, instalação a partir do workspace pnpm e
build `pnpm build`. A opção para incluir fontes fora do root deve permanecer
ativa para pacotes compartilhados.

Como o preview Vercel nasce da integração Git, migrations seguem expansão e
contração e precisam ser retrocompatíveis com a revisão anterior e a nova. O
deploy da API é serializado depois do pipeline Supabase; mudanças destrutivas de
schema exigem uma fase posterior, nunca o mesmo push.
