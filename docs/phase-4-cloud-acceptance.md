# Aceite cloud da Fase 4

O aceite só pode ser marcado após evidência remota, nunca por configuração
presumida.

- [ ] Supabase staging dedicado e região confirmados
- [ ] migrations aplicadas do zero em preview/projeto temporário
- [ ] seed idempotente reaplicado
- [ ] pgTAP: 45/45
- [ ] tipos sem drift
- [ ] Cloud Run `/health` e `/ready`
- [ ] Vercel staging e redirects Auth
- [ ] Auth/SSR/refresh/recuperação reais
- [ ] JWT/JWKS e rejeição de outro projeto
- [ ] RLS com dois usuários nas três camadas
- [ ] onboarding retomável e idempotente
- [ ] CORS e bypass bloqueados
- [ ] CI, build, unitários, integração e E2E mock
- [ ] E2E cloud real
- [ ] nenhum segredo rastreado
- [ ] produção não alterada

Estado atual: **Fase 4 ainda não aceita**. Os pipelines estão preparados, mas as
contas corretas, recursos staging, secrets, deploys e provas remotas ainda precisam
ser configurados/executados.
