# Definition of Done

Este documento define o padrão mínimo permanente para considerar uma entrega
concluída no Iatron. “Funciona” não é sinônimo de “pronto”.

Toda pessoa que implementa uma mudança é responsável por demonstrar os
critérios aplicáveis. Toda pessoa que revisa é responsável por impedir o merge
quando houver um requisito obrigatório não atendido.

Uma exceção só é válida quando:

1. estiver explicitamente registrada no Pull Request;
2. explicar risco, impacto e prazo de correção;
3. tiver aprovação do responsável técnico e de produto;
4. não comprometer segurança, privacidade, integridade pedagógica ou
   acessibilidade essencial.

## 1. Engenharia

Uma entrega está pronta quando:

- o código é simples, coeso e compatível com a arquitetura existente;
- TypeScript permanece em modo estrito, sem `any` não justificado;
- testes cobrem comportamento, regressões e casos de erro proporcionais ao
  risco;
- lint, typecheck, testes e build de produção estão aprovados;
- CI está verde no commit que será integrado;
- não há warnings novos relevantes no build, testes ou execução;
- não há TODOs críticos, código morto ou mocks silenciosos em produção;
- dependências novas são necessárias, mantidas e justificadas;
- contratos e documentação afetados foram atualizados;
- a árvore de trabalho está limpa ao concluir a entrega.

Warnings existentes fora do escopo devem ser mencionados no Pull Request quando
puderem esconder uma regressão.

## 2. Produto

A mudança deve resolver um problema real e possuir critério de sucesso
observável.

Antes da aprovação, confirme:

- o estudante entende imediatamente o que a funcionalidade oferece;
- existe contexto suficiente para tomar decisões;
- o benefício está claro;
- ações relevantes oferecem feedback de andamento e resultado;
- estados vazios ensinam e indicam o próximo passo;
- erros são tratados e permitem recuperação quando possível;
- confirmações existem apenas quando a consequência exige;
- nenhuma funcionalidade fictícia ou caminho sem conclusão foi introduzido;
- métricas e resultados exibidos correspondem a dados reais.

## 3. UX

Toda interface deve seguir:

- [Princípios de experiência](UX_PRINCIPLES.md);
- [Voz e tom](VOICE_AND_TONE.md);
- [Checklist de revisão de design](DESIGN_REVIEW_CHECKLIST.md).

Nenhuma tela está pronta sem verificar:

- clareza da hierarquia e da ação principal;
- simplicidade do fluxo;
- microcopy humana e objetiva;
- contexto e benefício das perguntas;
- quantidade mínima razoável de cliques e campos;
- consistência entre componentes e conceitos;
- feedback para loading, erro, sucesso e vazio;
- comportamento responsivo.

Problemas repetidos devem ser resolvidos no componente compartilhado, sem
acumular exceções locais.

## 4. Mobile

Toda funcionalidade de interface deve ser validada em:

- 320 px;
- 375 px;
- 390 px;
- 768 px;
- desktop.

Em todas as larguras:

- não existe overflow horizontal acidental;
- conteúdo e controles não ficam cortados;
- nenhum componente quebra ou exige zoom;
- toque, teclado virtual, rolagem e safe areas permanecem utilizáveis;
- a ação principal continua encontrável e alcançável.

## 5. Acessibilidade

São obrigatórios:

- contraste WCAG AA;
- labels associados a campos e controles;
- foco visível e ordem de foco lógica;
- navegação completa por teclado;
- HTML semântico;
- ARIA somente quando o HTML nativo não for suficiente;
- nomes, estados, erros e mensagens dinâmicas acessíveis;
- conteúdo compreensível por leitor de tela;
- alvo de toque e espaçamento adequados.

Uma verificação automatizada não substitui validação do fluxo com teclado e
tecnologia assistiva.

## 6. Performance

A entrega deve evitar:

- consultas desnecessárias ou sem índices adequados;
- chamadas de rede duplicadas;
- renders e cálculos repetidos sem benefício;
- dependências ou bundles excessivos;
- serialização de dados que a interface não utiliza;
- bloqueio da interação por trabalho não essencial;
- carregamento integral quando paginação ou streaming forem mais apropriados.

O revisor deve avaliar custo proporcional ao uso esperado. Regressões
perceptíveis precisam de evidência, correção ou decisão explícita antes do
merge.

## 7. Inteligência artificial

Toda integração com IA deve respeitar estas fronteiras:

- a IA nunca é apresentada como protagonista quando existe um mentor humano
  responsável pelo conteúdo;
- a interface identifica com clareza o mentor e mantém a tecnologia como apoio;
- IA nunca define regras de negócio;
- IA nunca calcula domínio, nota, confiança ou prioridade pedagógica;
- IA nunca altera sozinha o plano adaptativo;
- IA interpreta e explica informações produzidas pelo motor pedagógico;
- respostas não podem inventar métricas, fontes ou dados do estudante;
- prompts, ferramentas, limites de uso e chamadas são versionados e
  auditáveis;
- conteúdo recuperado é tratado como não confiável contra prompt injection;
- falhas da IA não podem corromper o estado determinístico;
- nenhuma chave ou credencial é exposta no navegador.

## 8. Segurança e privacidade

Nenhuma entrega pode:

- expor segredos em código, logs, bundles, screenshots ou artefatos;
- quebrar ou contornar RLS;
- confiar em identificadores, papéis ou ownership enviados pelo cliente;
- registrar tokens, senhas ou informações sensíveis;
- usar acesso privilegiado diretamente no navegador;
- misturar dados entre estudantes ou ambientes;
- reduzir validação, autenticação ou autorização sem decisão arquitetural.

Entradas devem ser validadas na fronteira confiável. Operações sensíveis exigem
autorização server-side, menor privilégio e teste de isolamento.

## 9. Observabilidade

Funcionalidades relevantes devem possuir, conforme o risco:

- tratamento explícito de erros;
- logs estruturados e sem dados sensíveis;
- identificadores de correlação ou rastreabilidade;
- mensagens úteis para operação e suporte;
- métricas ou sinais que permitam detectar falhas;
- distinção entre erro recuperável, indisponibilidade e falha de regra;
- documentação de operação quando houver novo comportamento externo.

Logs devem explicar o evento sem depender de reproduzir o problema com dados do
estudante.

## 10. Experiência

Antes de aprovar qualquer tela, responda:

- o estudante entende onde está?
- entende por que está vendo isso?
- sabe o que fazer?
- sabe o que acontece depois?

Se qualquer resposta for “não”, a tela não está pronta.

## Evidências mínimas

O Pull Request deve informar:

- problema e resultado esperado;
- escopo e decisões relevantes;
- testes executados e resultados;
- evidência visual para alterações de interface;
- larguras e fluxos validados;
- impactos de segurança, IA, dados e performance;
- plano de deploy e rollback quando aplicável.

## Checklist para Pull Requests

### Product Review

- [ ] Resolve um problema real com resultado verificável
- [ ] Fluxo intuitivo e sem etapas desnecessárias
- [ ] Contexto e benefício suficientes
- [ ] Microcopy revisada
- [ ] Estados vazios revisados
- [ ] Erros, sucesso e confirmações tratados
- [ ] Loading adequado e acessível
- [ ] Mobile validado em 320, 375, 390, 768 px e desktop
- [ ] Acessibilidade validada
- [ ] Performance avaliada
- [ ] Segurança e privacidade avaliadas
- [ ] Fronteiras de IA respeitadas, quando aplicável
- [ ] Observabilidade adequada ao risco
- [ ] Testes aprovados
- [ ] Lint e typecheck aprovados
- [ ] Build aprovado
- [ ] CI verde
- [ ] Documentação atualizada
- [ ] Deploy em staging concluído
- [ ] Smoke e validação manual em staging aprovados

Este checklist também está incorporado no
[template padrão de Pull Request](../../.github/pull_request_template.md).
