# Student Experience V4

## Diagnóstico e solução

O CTA “Escolher minha prova” apontava para `/app/onboarding`. O proxy devolve
usuários com onboarding concluído para `/app`, fazendo o clique retornar à mesma
tela. A seleção já existia no passo 3; catálogo e persistência não precisavam ser
reinventados.

A rota `/app/exams` permite selecionar e alterar provas depois do cadastro.
Compartilha o seletor e carregador de catálogo com o onboarding e usa a RPC
atômica `save_onboarding`, autenticada por usuário, com validação de edições
ativas e ownership por `auth.uid()`. A ação exige cadastro completo e envia
apenas provas, passo e conclusão; não regrava nome, disponibilidade, respostas,
diagnósticos nem planos. Repetir a mesma seleção não duplica relacionamentos.

Fluxo: login → Minha preparação → Escolher minha prova → catálogo real →
confirmar → Provas salvas → preparação atualizada → entrada do diagnóstico V3.
Seleção e progresso são relidos após recarga e novo login. Falhas de gravação
preservam a seleção. Sessão expirada conserva o destino interno sanitizado;
o retorno explícito ao diagnóstico continua após a gravação bem-sucedida.

## Auditoria do domínio

- Catálogo: instituições → exam_programs → exam_editions; relações existentes,
  edições ativas, ano, cidade, estado e instituição. Nenhuma prova nova criada.
- Escolhas: `student_target_exams`. Não confundir ausência de perfil estatístico
  de uma banca com ausência de prova escolhida.
- Diagnóstico: `assessment-routes.ts` resolve `getTargetExam` e passa o programa
  ao serviço existente. Não houve mudança de questões, scoring ou algoritmo.
- Plano: `study-plan-repository.ts` consome objetivo, proximidade e programa;
  modificar objetivo não recalcula retroativamente um plano existente.
- Próxima ação e timeline: uma única projeção `resolveJourneyState`; retomada
  reutiliza `selectAssessmentEntry`, a mesma decisão de navegação da V3.
- Mentor: a associação anterior usava heurística por competência com fallback
  para um mentor mesmo sem atividade. Removida a atribuição individual automática
  desta tela; acesso aos mentores permanece como contexto secundário.

## Experiência e integridade

Cabeçalho compacto, saudação secundária, objetivo real, progresso e próxima ação.
“Banca” passa a “Prova”; navegação “Jornada” passa a “Minha preparação”.
Mobile apresenta a etapa atual, contagem e expansão acessível das demais.

Os oito rótulos anteriores incluíam marcos futuros sempre pendentes e inferiam
consolidação pela conclusão de atividades. Agora são quatro marcos verificáveis:
Perfil, Prova, Diagnóstico, Estudos. Estudos não são marcados como concluídos por
uma contagem local; não se infere aptidão, aprovação ou domínio. O estágio de
estudos agrega a continuidade pelo plano existente, sem remover fluxos internos.
Plano vazio não é tratado como concluído. Falha de carregamento não vira progresso
zerado: a página mostra erro e permite tentar novamente.

## Arquivos

- `apps/web/src/features/exams/`: catálogo, seletor compartilhado, ação de gravação,
  formulário e testes de erro, persistência, sessão, indisponibilidade e duplicação.
- `apps/web/src/app/(authenticated)/app/exams/`: página e loading.
- `apps/web/src/app/(authenticated)/app/page.tsx`: centro de continuidade.
- `apps/web/src/features/journey/`: projeção e timeline, testes de estados.
- `apps/web/src/features/onboarding/components/onboarding-wizard.tsx` e página
  onboarding: reutilização do catálogo e seletor, preservando o fluxo inicial.
- `apps/web/src/components/layout/{navigation,app-header}.tsx`: nomenclatura.
- `apps/web/src/app/globals.css`: espaçamento, tipografia e responsive V4.
- E2E `preparation-flow`, `auth-flow`, `app`, `mobile-accessibility` e teste de shell.
- `.github/workflows/ci.yml`: inclui o fluxo V4 no gate real Supabase, sem remover
  testes existentes ou criar previews.

## Validação e limites

Testes de unidade cobrem sessão expirada, cadastro incompleto, IDs inválidos,
catálogo vazio, gravação recusada, falha de rede, seleção preservada e envio
pendente. E2E usa conta exclusiva temporária e remove apenas seu próprio ID.
Inclui login, seleção, confirmação, persistência, recarga, logout/login, entrada
no diagnóstico, oito larguras (320 a 1920), expansão mobile e axe.
O E2E V3 e a suíte autenticada continuam cobrindo diagnóstico, resultado e plano.

Docker não está disponível nesta máquina; pgTAP e aquisição com Supabase isolado
são executados pelo gate CI existente. Capturas locais mobile/desktop passaram
por revisão visual e refinamento antes da publicação. Resultados finais de CI,
SHA, deploy e validação online ficam no relatório da PR desta entrega.

Sem migrations, infraestrutura nova, dependências ou alteração de credenciais.
Contas beta e dados de estudantes são preservados. A entrega só fica concluída
quando CI, deploy e validação online estiverem aprovados. O incidente anterior de
entrega de confirmação de e-mail é independente e não é considerado resolvido
por testes com contas pré-confirmadas.

Rollback: promover frontend/revisão anteriores; não há schema a desfazer.
