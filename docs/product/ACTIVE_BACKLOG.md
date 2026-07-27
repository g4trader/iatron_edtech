# Iatron — Active Backlog

Backlog restrito ao fechamento do MVP, na ordem fornecida pela tarefa de
handoff. Não cria Product Vision nem autoriza implementação. A ausência de
`IATRON_CONSTITUTION.md` impede confirmar que esta ordem está registrada na
fonte constitucional citada.

## 1. Política de aptidão configurável

- **Problema:** não há política de aptidão do MVP localizada que seja
  configurável, versionada e explicável.
- **Estado:** não iniciado como política de produto; existe base parcial.
- **Evidência:** `diagnostic_question_eligibility` governa elegibilidade de
  questões, não aptidão do estudante/produto.
- **Já existe:** diagnóstico determinístico, domínio/confiança, cobertura,
  requisitos de proveniência e resposta validada.
- **Falta:** definição constitucional, responsáveis, configuração, versão,
  decisão e exposição segura dos critérios.
- **Dependências:** Constituição restaurada, tarefa/RFC aprovada, Decision
  Register, domínio diagnóstico existente.
- **Riscos:** falsa garantia de aprovação; regra duplicada; viés; métrica sem
  amostra/limites.
- **Aceite:** regra backend determinística, configurável, versionada,
  auditável, explicável, sem decisão por IA e com governança estatística.
- **Prováveis arquivos:** `packages/contracts`, `apps/api/src/assessment-*` ou
  novo módulo aprovado, migrations/RLS se indispensáveis, testes e docs.
- **Testes:** unidade, contratos, pgTAP/RLS, isolamento, limites estatísticos,
  E2E de explicação.
- **Status:** **bloqueado** pela ausência da Constituição e especificação vigente.

## 2. Simulados integrados ao ciclo

- **Problema:** a jornada indica simulados como próximos, mas não há fluxo
  completo conectado a diagnóstico, eventos e reavaliação.
- **Estado:** parcial.
- **Evidência:** rota `/app/simulations`, marcador `upcoming` e tipo de evento
  `SimulationFinished`; nenhum engine/fluxo integrado foi localizado.
- **Já existe:** assessment, question attempts, eventos, mastery, plano e
  catálogo AMRIGS.
- **Falta:** escopo autorizado, seleção/regras, execução, resultado e
  realimentação determinística.
- **Dependências:** conteúdo elegível/licenciado, política de aptidão,
  contratos, governança estatística e editorial.
- **Riscos:** questões sem licença/proveniência; duplicação do Assessment
  Engine; nota calculada no cliente; experiência fictícia.
- **Aceite:** simulado real, reproduzível, ligado a competências/prova,
  append-only, atualiza o ciclo por backend e possui fontes/limites.
- **Prováveis arquivos:** assessment/learning/study-plan existentes,
  `packages/contracts`, migrations apenas se necessárias, rota Student e testes.
- **Testes:** seleção, tentativas, idempotência, eventos, isolamento, RLS,
  refresh/retomada, mobile e E2E.
- **Status:** **parcial**.

## 3. Conteúdo acadêmico suficiente e revisado

- **Problema:** o pipeline existe, porém o recorte AMRIGS é pequeno e não
  sustenta sozinho um beta acadêmico amplo.
- **Estado:** parcial.
- **Evidência:** Content/Exam Intelligence, editorial, proveniência,
  competências, ownership e seeds piloto no código; Decision `DEC-001`
  permanece pendente para licenciamento de provas reais.
- **Já existe:** importação idempotente, deduplicação, estados editoriais,
  referências, versões, revisão, publicação e biblioteca.
- **Falta:** quantidade definida como suficiente, revisão médica, cobertura por
  competência, licença/base jurídica e indicadores de qualidade.
- **Dependências:** mentores Owners, governança editorial, decisão jurídica,
  pipeline remoto estável.
- **Riscos:** conteúdo desatualizado, falsa cobertura, direitos autorais,
  atribuição indevida.
- **Aceite:** amostra mínima definida, cobertura mensurada, proveniência e
  licença verificadas, revisão/homologação registradas e gaps editoriais claros.
- **Prováveis arquivos:** seeds/importador AMRIGS, editorial/academic,
  referências, docs normativas; banco apenas por necessidade comprovada.
- **Testes:** importação/idempotência, deduplicação, workflow editorial,
  proveniência, RLS, contratos, cobertura e E2E dos workspaces.
- **Status:** **parcial**.

## 4. Consolidação

- **Problema:** a plataforma possui grande superfície e a cadeia automática
  remota não fecha no snapshot.
- **Estado:** parcial/bloqueado operacionalmente.
- **Evidência:** CI verde em `7d67d78`, ambiente saudável, mas seed remoto falha
  por IPv6; pgTAP remoto e E2E autenticado são ignorados.
- **Já existe:** DoD, governança, CI, smoke, health/ready/meta, rollback, quatro
  workspaces e testes.
- **Falta:** corrigir somente o bloqueio de rede aprovado, fechar cadeia no
  mesmo SHA, validar perfis e reduzir divergências de documentação/deploy.
- **Dependências:** GitHub Environment, pooler/endpoint acessível, Supabase,
  Vercel e Cloud Run alinhados.
- **Riscos:** declarar verde sem teste remoto; frontend/API incompatíveis;
  mascarar regressão por deploy manual.
- **Aceite:** lint, typecheck, unitários, contratos, build, pgTAP local/remoto,
  E2E mock/auth, quatro perfis, health/ready/meta e SHAs compatíveis verdes.
- **Prováveis arquivos:** workflow/script de conexão somente se a causa for
  comprovada; nenhuma refatoração de produto.
- **Testes:** cadeia completa já definida nos workflows.
- **Status:** **bloqueado** pelo seed remoto.

## 5. Beta controlado

- **Problema:** ainda não há evidência atual suficiente para convidar usuários
  sem intervenção técnica.
- **Estado:** bloqueado.
- **Evidência:** base de Private Beta existe, mas validação remota e suficiência
  acadêmica estão pendentes.
- **Já existe:** autenticação/recuperação, perfis, telemetria/logs, workspaces,
  jornada, diagnóstico, plano, atividade, Tutor e operação editorial/admin.
- **Falta:** critérios 1–4 aceitos, coorte/termos/suporte definidos, jornadas
  reais revalidadas, monitoramento e rollback ensaiados.
- **Dependências:** backlog anterior, SMTP e integrações saudáveis, conteúdo
  revisado e aprovação do Founder.
- **Riscos:** falha funcional com usuário real; exposição de conteúdo não
  revisado; suporte insuficiente; dados de teste misturados.
- **Aceite:** coorte pequena autorizada, checklist crítico verde no mesmo SHA,
  isolamento confirmado, incident response e suporte prontos, métricas sem
  dados sensíveis.
- **Prováveis arquivos:** preferencialmente configuração/operação e
  documentação; código somente para bloqueio comprovado.
- **Testes:** primeiro acesso, onboarding, diagnóstico, plano, atividade,
  Tutor, recuperação, logout/sessão expirada, Mentor, Editorial, Admin, mobile,
  acessibilidade e isolamento.
- **Status:** **bloqueado** pelos itens anteriores.

## Limite do backlog

Não adicionar IA, Knowledge Graph, nova banca, novo motor, redesign ou
funcionalidade fora dos cinco itens. Qualquer ampliação exige decisão de produto
e tarefa própria.

## Teste de contingência

Usando somente este pacote, uma sessão nova consegue responder:

| Pergunta                                     | Fonte                                           |
| -------------------------------------------- | ----------------------------------------------- |
| O que é o produto e quais regras o governam? | `AGENT_BOOTSTRAP.md` + `TECHNICAL_HANDOFF.md`   |
| Como instalar e validar?                     | `OPERATIONS_RUNBOOK.md`                         |
| Onde fica cada domínio?                      | `REPOSITORY_MAP.md`                             |
| Qual é o estado publicado?                   | `CURRENT_STATE.md`                              |
| Qual é a próxima prioridade?                 | item 1 deste arquivo                            |
| Quais regras não podem ser violadas?         | `TECHNICAL_HANDOFF.md` + governança obrigatória |
| Como concluir uma entrega?                   | `TECHNICAL_HANDOFF.md` + Definition of Done     |

Resultado: o pacote é operacional sem memória da conversa, com uma exceção
explícita e não ocultada: a fonte `IATRON_CONSTITUTION.md` precisa ser
restaurada antes de validar a autoridade constitucional da prioridade.
