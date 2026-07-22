# Aceite cloud da Fase 4

O aceite só pode ser marcado após evidência remota, nunca por configuração
presumida.

- [x] Supabase staging dedicado e região confirmados
- [x] migrations aplicadas do zero em preview/projeto temporário
- [x] seed idempotente reaplicado
- [x] pgTAP: 45/45
- [x] tipos sem drift
- [x] Cloud Run `/health` e `/ready`
- [x] Vercel staging e redirects Auth
- [ ] Auth/SSR/refresh/recuperação reais
- [ ] JWT/JWKS e rejeição de outro projeto
- [ ] RLS com dois usuários nas três camadas
- [ ] onboarding retomável e idempotente
- [ ] CORS e bypass bloqueados
- [ ] CI, build, unitários, integração e E2E mock
- [ ] E2E cloud real
- [ ] nenhum segredo rastreado
- [ ] produção não alterada

Estado atual: **Fase 4 ainda não aceita**. Schema, seed, pgTAP, tipos, Supabase
Auth, Cloud Run e Vercel staging estão validados; falta concluir o E2E cloud real
e registrar as evidências finais de Auth, JWT e RLS.
