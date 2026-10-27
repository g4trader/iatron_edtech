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
  sem anunciar conclusão. Quando há respostas e o conteúdo se esgota, a API
  consulta o seletor existente e informa disponibilidade ao motor, que já prevê
  `content_exhausted` com `evidenceSufficient:false`. A tela identifica esse
  retrato como parcial. Nenhuma política de pontuação ou parada foi alterada.

`returnTo` acompanha os formulários, erros, confirmação, recuperação e onboarding.
Destinos são restritos aos workspaces internos; normalizações perigosas são
rejeitadas. O proxy sobrescreve o header interno de retorno e preserva cookies
renovados nos redirects. A origem de e-mails ignora campos enviados pelo navegador
em favor dos hosts aprovados. O callback também usa o host público aprovado,
preservando o escopo dos cookies quando o servidor Next informa um host interno. Autorização continua no servidor/API/RLS.

## C. Arquivos alterados

Inventário ao final do documento. Nenhuma migration, dependência ou algoritmo
pedagógico foi alterado. O repositório de histórico da API inclui a pendência
mais recente fora da janela de 100 quando necessário, com o mesmo token e RLS.

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
| `study_path_opened`        | Plano atual ou semanal real carregado, não no estado vazio   |

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

Validação local em 27/10/2026: lint, typecheck, build de produção e testes
aprovados (175 web, 161 API, 25 contratos, 6 IA, 9 guards). Playwright:
139 aprovados e 26 exclusões condicionais por dispositivo. A matriz inclui
320×812, 375×812, 390×844, 768×1024, 1024×768, 1366×768, 1440×900 e 1920×1080.
A inspeção visual do hero desktop/mobile confirma CTA legível e composição
preservada. Não foi feita medição de Core Web Vitals em usuários reais.

A execução inicial de CI identificou uma asserção com texto antigo de recuperação,
corrigida, e bloqueio externo de download de imagens (HTTP rate limit) antes dos
E2E reais. A inicialização efêmera admite uma segunda tentativa, sem ignorar falhas.
A primeira execução real também revelou perda de sessão no callback ao usar
um host interno do Next e divergência entre `/next` e `/finish` quando as questões
se esgotavam. Ambos foram corrigidos com regressões automatizadas; a rodada final
reexecuta o percurso inteiro. Capturas usam `caret: initial` para evitar que a
manipulação de caret pelo Playwright interfira na hidratação durante a evidência.

Smoke adicional do build de produção local, sem bypass: CTA anônimo → login →
cadastro preservou `returnTo`; rota inexistente retornou 404. Nenhuma conta foi
criada nesse smoke. O comando `next start` emitiu o aviso preexistente do projeto
sobre `output: standalone`; esse smoke não substitui a validação do empacotamento
na hospedagem.

Os resultados finais de CI e o aceite integrado são registrados na
[PR #7](https://github.com/g4trader/iatron_edtech/pull/7), associados ao commit testado.

| Cenário                      | Esperado                           | Evidência local observada                                              | Resultado local                                     |
| ---------------------------- | ---------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------- |
| CTAs da LP                   | Mesmo destino, clique não é início | 4 destinos idênticos; evento somente de clique                         | Aprovado, navegador com bypass                      |
| Login/cadastro e retorno     | Preservar diagnóstico              | Actions/callback/onboarding/proxy preservam retorno em testes isolados | Aprovado unitário; real no job acquisition          |
| Sessão expirada              | Reautenticar com retorno           | Proxy/onboarding exigem login com destino sanitizado                   | Aprovado unitário, sem simular prova de sessão real |
| Avaliação ausente            | Criar só após API confirmar        | API falha não retorna evento; sucesso retorna início                   | Aprovado unitário                                   |
| Ativa/pausada                | Retomar sem reiniciar              | Resume somente se pausada, sem novo evento                             | Aprovado unitário                                   |
| Pendente antiga              | Encontrar fora das últimas 100     | Consulta adicional autenticada e falha propagada                       | Aprovado unitário de repositório                    |
| Concluída                    | Resultado sem reset                | Já concluída não repete finish/evento                                  | Aprovado unitário                                   |
| Rede/histórico indisponível  | Erro recuperável, sem criar        | Actions e sessão bloqueiam criação/conclusão indevida                  | Aprovado com falhas injetadas                       |
| Diagnóstico sem questões     | Não afirmar conclusão              | Zero respostas oferece retry, sem finish                               | Aprovado unitário                                   |
| Mobile/teclado/contraste     | Sem corte, navegação utilizável    | 8 larguras, menus, tabs, forms e axe sem falhas                        | Aprovado navegador                                  |
| Conclusão/trilha persistidas | Confirmar serviços reais           | Cobertura programada no job acquisition com fixtures exclusivas        | Ver resultado do job na PR                          |
| Staging com V3               | Smoke após publicação autorizada   | Não houve deploy                                                       | Não testado nesta rodada                            |

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

Implementação conectada ao diagnóstico real; resultados integrados e status de
aceite estão na PR #7 para evitar confundir validação local com publicação.
Não declarar pronto para produção até verificar os critérios bloqueantes.
A publicação depende de autorização explícita, merge e smoke no ambiente aprovado.
Rollback futuro: reverter o commit da V3; não há mudança de schema para desfazer.
`apps/web/vercel.json` impede somente o deploy automático desta branch, conforme
[a configuração oficial da Vercel](https://vercel.com/docs/project-configuration/git-configuration).
Nenhuma configuração de produção ou credencial foi alterada.

## Inventário

- `.github/workflows/ci.yml`
- `apps/api/src/assessment-repository-history.test.ts`
- `apps/api/src/assessment-repository.ts`
- `apps/api/src/assessment-routes.test.ts`
- `apps/api/src/assessment-routes.ts`
- `apps/web/e2e-auth/acquisition-flow.spec.ts`
- `apps/web/e2e-auth/auth-flow.spec.ts`
- `apps/web/e2e/app.spec.ts`
- `apps/web/e2e/landing.spec.ts`
- `apps/web/e2e/mobile-accessibility.spec.ts`
- `apps/web/src/app/(authenticated)/app/assessment/entry/error.tsx`
- `apps/web/src/app/(authenticated)/app/assessment/entry/page.tsx`
- `apps/web/src/app/(authenticated)/app/assessment/result/page.tsx`
- `apps/web/src/app/(authenticated)/app/assessment/session/error.test.tsx`
- `apps/web/src/app/(authenticated)/app/assessment/session/error.tsx`
- `apps/web/src/app/(authenticated)/app/assessment/session/page.tsx`
- `apps/web/src/app/(authenticated)/app/assessment/start/page.tsx`
- `apps/web/src/app/(authenticated)/app/onboarding/page.tsx`
- `apps/web/src/app/(authenticated)/app/plan/page.tsx`
- `apps/web/src/app/(authenticated)/app/plan/week/page.tsx`
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
