# Aquisição V3 — diagnóstico como porta de entrada

Data: 27/10/2026. Base: `049678f52b4609b2c82a115145a5e4019c312e04`.
Branch: `feat/diagnostic-acquisition-v3`. Publicação não autorizada nesta rodada.

## A. Fluxo encontrado

Supabase Auth já oferece login, cadastro com confirmação de e-mail, recuperação e
sessão SSR. Novos estudantes completam o onboarding existente (perfil, rotina,
prova/objetivo e revisão). O diagnóstico exige autenticação e onboarding.
A API persiste avaliações, respostas e estados ativo/pausado/concluído. O backend
calcula proficiência e prioridades; a IA não determina notas. A triagem usa até
10 questões; o diagnóstico completo até 40. Não foi encontrada cobrança no início.
O plano usa geração explícita pelo fluxo existente, sem geração fictícia.

A LP levava ao cadastro genérico. Diversos retornos de autenticação descartavam a
intenção; a validação anterior de destinos aceitava barras invertidas e controles.
Avaliações pausadas precisavam de retomada explícita antes de buscar questões.

## B. Fluxo implementado

LP → `/app/assessment/entry` → login/cadastro se necessário → confirmação de e-mail
quando exigida → onboarding existente → diagnóstico.

- Sem avaliação: introdução existente em `/app/assessment/start`.
- Ativa ou pausada: progresso salvo e ação de retomada; somente pausada chama resume.
- Concluída e sem pendências: resultado, trilha e opção explícita de nova avaliação.
- Qualquer pendência é preservada, inclusive anterior a outra avaliação concluída.
- Antes de criar, o servidor consulta novamente o histórico. Falha de consulta
  bloqueia criação, sem tratar indisponibilidade como histórico vazio.
- Conclusão valida identificador, ownership pelo histórico autenticado e resposta
  real da API. Repetir uma conclusão já salva não repete o evento.
- Sem questões e sem respostas confirmadas, a interface oferece recuperação,
  sem anunciar conclusão.

`returnTo` acompanha os formulários, erros, confirmação, recuperação e onboarding.
Destinos são restritos aos workspaces internos; normalizações perigosas são
rejeitadas. O proxy sobrescreve o header interno de retorno e preserva cookies
renovados nos redirects. A origem de e-mails ignora campos enviados pelo navegador
em favor dos hosts aprovados. Autorização continua no servidor/API/RLS.

## C. Arquivos alterados

Inventário ao final do documento. Nenhuma migration, dependência ou algoritmo
pedagógico foi alterado.

## D. CTAs

| Local                              | Texto                       | Destino                       |
| ---------------------------------- | --------------------------- | ----------------------------- |
| Header, hero, demonstração e final | Iniciar meu diagnóstico     | `/app/assessment/entry`       |
| Hero secundário                    | Entenda como funciona       | `#como-funciona`              |
| Comunidade                         | Conhecer a comunidade       | Detalhes reais na seção       |
| Mentoria                           | Conhecer a mentoria         | Detalhes reais na seção       |
| Podcast                            | Assistir ao episódio        | YouTube do episódio existente |
| Resultado                          | Ver minha trilha de estudos | `/app/plan`                   |

O componente `DiagnosticCTA` centraliza destino, linguagem e instrumentação.
A composição visual, ordem das seções e painel ilustrativo da V2 foram preservados.
Não há CTA móvel fixo adicional: o hero e o menu já oferecem a ação sem cobrir conteúdo.

## E. Analytics

Não existe coletor GA4/GTM configurado. A camada local `iatron:acquisition-event`
não persiste nem transmite dados, não cria cookies nem identificadores.

| Evento                     | Disparo                                                      |
| -------------------------- | ------------------------------------------------------------ |
| `landing_page_view`        | Montagem da LP, substitui `lp_view` local                    |
| `diagnostic_cta_click`     | Clique; somente posição e auth state `unknown` na LP pública |
| `diagnostic_entry_view`    | Introdução ou entrada de diagnóstico renderizada             |
| `signup_started`           | Primeira edição de campo no formulário de cadastro           |
| `diagnostic_started`       | Criação confirmada pela API, nunca no clique da LP           |
| `diagnostic_completed`     | Conclusão confirmada pela API                                |
| `diagnostic_result_viewed` | Resultado real carregado                                     |
| `study_path_opened`        | Plano real carregado, não no estado vazio                    |

StrictMode não duplica visualizações por montagem. Retomadas não geram novo início.
Uma nova visita pode gerar nova visualização; isso não representa usuário único.
Eventos secundários existentes da LP continuam em `iatron:landing-event`.
`signup_completed` não foi inferido de respostas ambíguas de Supabase signUp:
reenvio de confirmação não pode ser contado como novo cadastro.

A auditoria existente do backend confirma criação/conclusão persistidas. A camada
client-side não oferece entrega garantida se a conexão for perdida depois da
persistência. North Star por visitante único e taxas exigem decisão de coletor,
consentimento, deduplicação e vínculo permitido. Nenhuma taxa foi inventada.

## F. Cenários e G. validação técnica

Em validação. Os resultados finais serão registrados após a execução.
Os testes unitários usam serviços simulados e não comprovam autenticação real.
`test:e2e:mock` usa bypass explícito somente no processo não produtivo.
`acquisition-flow.spec.ts` usa Supabase/API reais em ambiente efêmero de CI,
fixtures exclusivas e limpeza; confirmação de e-mail usa Mailpit/Inbucket real.
A pausa da triagem é exercitada pela API autenticada, pois o botão de pausa atual
aparece somente no diagnóstico completo.

## H. Evidências visuais

A matriz da LP captura 320, 375, 390, 768, 1024, 1366, 1440 e 1920 px.
O E2E real captura login sem campos preenchidos, introdução desktop, questão e
resultado mobile com dados exclusivos de teste. Não usa dados reais de alunos.

## I. Pendências e riscos

| Impacto                         | Pendência                                                                                                                                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bloqueante para declarar pronto | CI e E2E real desta versão precisam passar; staging não foi publicado nem validado com V3                                                                                                       |
| Alta                            | Definir coletor/consentimento e confirmação confiável de `signup_completed` para mensuração persistente                                                                                         |
| Média                           | API ainda não oferece idempotência transacional de criação: duas abas simultâneas podem criar avaliações distintas; rechecagem evita repetição sequencial, não garante exclusão entre processos |
| Média                           | Testar expiração/rede e recuperação por e-mail também no ambiente publicado após autorização                                                                                                    |
| Baixa                           | Fotografias, biografias verificadas, comunidade e oferta de mentoria permanecem pendências editoriais anteriores, sem promessas novas                                                           |

A trilha não é prometida como gerada automaticamente: estado vazio oferece a ação
real de criação. O produto não ganhou preço, gratuidade ou disponibilidade irrestrita.

Hipóteses futuras, sem vencedor declarado: CTA alternativo sobre nível de
conhecimento; microcopy sobre lacunas versus personalização; painel diagnóstico
versus trilha. Não foi criado sistema de A/B testing.

## J. Resumo executivo e operação

Implementação conectada ao diagnóstico real; validação integrada ainda em andamento.
Não declarar pronto para produção até verificar os critérios bloqueantes.
A publicação depende de autorização explícita, merge e smoke no ambiente aprovado.
Rollback futuro: reverter o commit da V3; não há mudança de schema para desfazer.
`apps/web/vercel.json` impede somente o deploy automático desta branch, conforme
[a configuração oficial da Vercel](https://vercel.com/docs/project-configuration/git-configuration).
Nenhuma configuração de produção ou credencial foi alterada.

## Inventário

- `.github/workflows/ci.yml`
- `apps/web/e2e-auth/acquisition-flow.spec.ts`
- `apps/web/e2e-auth/auth-flow.spec.ts`
- `apps/web/e2e/app.spec.ts`
- `apps/web/e2e/landing.spec.ts`
- `apps/web/e2e/mobile-accessibility.spec.ts`
- `apps/web/src/app/(authenticated)/app/assessment/entry/error.tsx`
- `apps/web/src/app/(authenticated)/app/assessment/entry/page.tsx`
- `apps/web/src/app/(authenticated)/app/assessment/result/page.tsx`
- `apps/web/src/app/(authenticated)/app/assessment/session/page.tsx`
- `apps/web/src/app/(authenticated)/app/assessment/start/page.tsx`
- `apps/web/src/app/(authenticated)/app/onboarding/page.tsx`
- `apps/web/src/app/(authenticated)/app/plan/page.tsx`
- `apps/web/src/app/(authenticated)/layout.tsx`
- `apps/web/src/app/(public)/auth/actions.test.ts`
- `apps/web/src/app/(public)/auth/actions.ts`
- `apps/web/src/app/(public)/auth/callback/route.test.ts`
- `apps/web/src/app/(public)/auth/callback/route.ts`
- `apps/web/src/app/(public)/cadastro/page.tsx`
- `apps/web/src/app/(public)/esqueci-minha-senha/page.tsx`
- `apps/web/src/app/(public)/login/page.tsx`
- `apps/web/src/app/(public)/page.test.tsx`
- `apps/web/src/app/(public)/page.tsx`
- `apps/web/src/app/(public)/redefinir-senha/page.tsx`
- `apps/web/src/features/acquisition/acquisition-instrumentation.test.tsx`
- `apps/web/src/features/acquisition/acquisition-view.tsx`
- `apps/web/src/features/acquisition/diagnostic-cta.tsx`
- `apps/web/src/features/acquisition/events.ts`
- `apps/web/src/features/acquisition/routes.ts`
- `apps/web/src/features/acquisition/signup-observer.tsx`
- `apps/web/src/features/assessments/entry-actions.test.ts`
- `apps/web/src/features/assessments/entry-actions.ts`
- `apps/web/src/features/assessments/entry-form.tsx`
- `apps/web/src/features/assessments/entry-session.test.tsx`
- `apps/web/src/features/assessments/entry-state.ts`
- `apps/web/src/features/landing/landing-events.test.tsx`
- `apps/web/src/features/landing/landing-events.tsx`
- `apps/web/src/features/landing/landing-sections.tsx`
- `apps/web/src/features/landing/public-header.test.tsx`
- `apps/web/src/features/landing/public-header.tsx`
- `apps/web/src/features/onboarding/actions.ts`
- `apps/web/src/features/onboarding/components/onboarding-wizard.tsx`
- `apps/web/src/lib/auth-origin.ts`
- `apps/web/src/lib/auth.ts`
- `apps/web/src/lib/safe-return-to.test.ts`
- `apps/web/src/lib/safe-return-to.ts`
- `apps/web/src/proxy-auth.test.ts`
- `apps/web/src/proxy.ts`
- `apps/web/vercel.json`
- `docs/diagnostic-acquisition-v3.md`
- `scripts/run-auth-e2e.mjs`
