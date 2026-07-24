# Princípios arquiteturais

Este documento define as fronteiras que nenhuma implementação do Iatron pode
quebrar. Ele é normativo: mudanças nestes princípios exigem ADR, análise de
risco, revisão técnica e de produto e aprovação explícita antes da
implementação.

## 1. Estado pedagógico é determinístico

O Learning Engine é a única fonte de decisões pedagógicas.

- eventos de aprendizagem são a fonte primária de verdade;
- evidências derivam de eventos;
- domínio, confiança, gaps, prioridades e plano derivam de regras versionadas;
- toda decisão deve ser reproduzível e explicável;
- nenhum componente, tela, prompt ou cliente pode recalcular essas regras;
- histórico é append-only quando a evolução precisa ser reconstruída;
- alterações de algoritmo preservam versão e rastreabilidade.

É proibido calcular domínio, gap, prioridade ou agenda no frontend.

## 2. IA interpreta; nunca governa

A IA nunca:

- calcula mastery ou confiança;
- calcula learning gaps;
- calcula ou modifica o plano;
- decide o scheduler;
- atribui notas;
- altera estado pedagógico;
- cria métricas sem fonte;
- executa mutações sem ferramenta autorizada e validação determinística.

A IA pode:

- explicar dados produzidos pelos motores determinísticos;
- adaptar linguagem e profundidade;
- recuperar e sintetizar conteúdo homologado com fontes;
- sugerir uma intenção que o backend valida antes de qualquer efeito.

Toda saída de IA é não confiável até ser validada no contexto em que será
usada. Prompts do usuário, conteúdo recuperado e tool outputs nunca substituem
instruções, autorização ou regra de negócio.

## 3. Regras de negócio pertencem ao backend

- API e serviços de domínio aplicam regras, autorização e invariantes;
- frontend apresenta dados, coleta intenção e exibe feedback;
- contratos compartilhados descrevem a fronteira, não duplicam a regra;
- validação visual melhora UX, mas não substitui validação server-side;
- lógica crítica não pode depender de estado local do navegador;
- endpoints REST permanecem versionados;
- tarefas longas ou assíncronas não bloqueiam a requisição quando Cloud Tasks,
  Jobs ou outro mecanismo aprovado forem adequados.

Se dois clientes puderem chegar a resultados diferentes com a mesma entrada, a
regra está no lugar errado.

## 4. Identidade e autorização vêm do contexto confiável

Nunca confiar em:

- `user_id`, `student_id`, papel ou ownership enviado pelo cliente;
- identificadores como prova de autorização;
- dados do navegador sem validação;
- headers ou claims não verificados;
- instruções contidas em prompts;
- conteúdo recuperado de documentos externos.

O backend deve:

- validar o JWT;
- resolver identidade e ownership no servidor;
- aplicar menor privilégio;
- testar isolamento entre estudantes;
- rejeitar inconsistências mesmo que o frontend já tenha validado.

## 5. Banco preserva fatos e deriva estado

- não duplicar estados derivados sem necessidade comprovada;
- preferir derivação a sincronização de múltiplas fontes;
- materialização só é aceita com fonte canônica, versão e estratégia de
  recomputação;
- tabelas possuem PK, FKs, constraints, índices e RLS adequadas;
- migrations são versionadas, reproduzíveis e compatíveis com rollback;
- tentativas, eventos e histórico relevantes nunca são sobrescritos;
- importação suporta identidade externa, deduplicação e idempotência;
- produção, staging e ambientes de teste permanecem isolados.

Caches e projeções não se tornam fonte de verdade.

## 6. Conteúdo médico exige proveniência

- conteúdo possui fonte, versão, vigência e status de revisão;
- guideline é entidade própria e versionável;
- explicações diferenciam evidência homologada de interpretação;
- referências não podem ser inventadas;
- o produto é educacional e não presta atendimento médico;
- dados clínicos sensíveis ou desnecessários não são solicitados.

As fontes normativas são a
[governança editorial](EDITORIAL_GOVERNANCE.md), a
[política de proveniência](CONTENT_PROVENANCE_POLICY.md), a
[governança dos mentores](MENTOR_GOVERNANCE.md), o
[checklist jurídico de provas](EXAM_CONTENT_LEGAL_CHECKLIST.md) e a
[governança estatística](STATISTICAL_GOVERNANCE.md). Presença de metadados não
substitui revisão médica, decisão jurídica ou validação estatística.

## 7. Segurança é server-side e por padrão

- nenhum segredo vai para Git, frontend, logs ou artefatos;
- chaves permanecem em Vercel Environment Variables ou Secret Manager,
  conforme a fronteira;
- nenhum acesso privilegiado ocorre diretamente no navegador;
- RLS é obrigatória nas tabelas expostas pelo Supabase;
- entrada é validada na fronteira confiável;
- operações críticas são auditáveis;
- logs não contêm senha, token, prompt sensível ou informação pessoal
  desnecessária;
- falha segura prevalece sobre fallback silencioso.

## 8. Separação de plataformas

- Vercel hospeda o frontend Next.js;
- Cloud Run hospeda a API stateless;
- Supabase fornece PostgreSQL, Auth e Storage;
- Secret Manager protege segredos server-side no GCP;
- OpenAI é acessada somente pelo backend;
- Cloud Tasks e Cloud Run Jobs executam trabalho assíncrono ou longo;
- Pub/Sub só é introduzido quando houver benefício arquitetural claro.

Alterar essas fronteiras exige ADR.

## 9. Contratos e compatibilidade

- contratos públicos são tipados, validados e versionados;
- mudanças incompatíveis exigem nova versão ou migração explícita;
- erros de API têm formato consistente e não vazam detalhes internos;
- consumidores não dependem de campos não documentados;
- deploys preservam compatibilidade durante migrations;
- idempotência é obrigatória onde repetição puder causar efeito duplicado.

## 10. Observabilidade sem exposição

- logs são estruturados e correlacionáveis;
- ações relevantes têm rastreabilidade;
- health e readiness refletem dependências necessárias;
- erros distinguem falha de validação, autorização, dependência e domínio;
- métricas permitem detectar regressões sem expor conteúdo do estudante;
- auditoria registra quem, o quê, quando e versão da regra utilizada.

## 11. UX e acessibilidade são arquitetura

- experiências seguem os princípios, voz e checklist de design;
- componentes compartilhados resolvem padrões recorrentes;
- toda feature nasce mobile-first;
- loading, erro, sucesso e vazio fazem parte do fluxo;
- acessibilidade WCAG AA é requisito, não melhoria opcional;
- microcopy é revisada como parte da implementação;
- nenhuma interface expõe nomes internos de motores ou algoritmos.

## 12. Qualidade e entrega

- TypeScript strict, lint, typecheck, testes e build são obrigatórios;
- CI verde corresponde ao commit implantado;
- staging é validado antes da conclusão;
- migrations e deploys têm estratégia de rollback;
- mocks existem apenas em ambientes explicitamente controlados;
- warnings relevantes e TODOs críticos bloqueiam conclusão;
- a [Definition of Done](DEFINITION_OF_DONE.md) encerra toda entrega.

## Anti-patterns arquiteturais bloqueantes

- calcular domínio em componente React;
- pedir ao LLM para escolher a prioridade do estudante;
- aceitar `studentId` do body como ownership;
- gravar total derivado em múltiplas tabelas sem fonte canônica;
- consultar Supabase com service role no navegador;
- criar endpoint não versionado para regra de negócio;
- esconder indisponibilidade com dados fictícios;
- registrar JWT, API key ou prompt sensível;
- permitir que uma tool de IA faça mutação sem autorização server-side;
- introduzir uma plataforma ou dependência crítica sem ADR.
