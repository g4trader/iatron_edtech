## Problema

<!-- Qual problema real esta mudança resolve? Para quem? -->

## Solução e escopo

<!-- Explique a solução, decisões importantes e o que ficou fora do escopo. -->

## Como validar

<!-- Passos objetivos para reproduzir e validar o resultado. -->

## Evidências

<!-- Inclua screenshots ou gravações para UX, sem dados sensíveis. -->

## Riscos e operação

<!-- Segurança, dados, IA, performance, deploy, rollback e observabilidade. -->

## Product Review

- [ ] Resolve um problema real com resultado verificável
- [ ] O estudante entende onde está, por que isso importa e o próximo passo
- [ ] Fluxo intuitivo e sem etapas desnecessárias
- [ ] Contexto e benefício suficientes
- [ ] Microcopy revisada
- [ ] Estados vazios revisados
- [ ] Erros, sucesso e confirmações tratados
- [ ] Loading adequado e acessível

## Mobile e acessibilidade

- [ ] Mobile validado em 320, 375, 390, 768 px e desktop
- [ ] Sem overflow, componentes quebrados ou zoom obrigatório
- [ ] Contraste AA, labels, foco e teclado validados
- [ ] ARIA e mensagens acessíveis validadas quando necessárias

## Engenharia e qualidade

- [ ] Tipagem e arquitetura preservadas
- [ ] Testes novos ou atualizados conforme o risco
- [ ] Sem warnings novos relevantes ou TODOs críticos
- [ ] Performance e chamadas duplicadas avaliadas
- [ ] Logs, erros e rastreabilidade adequados ao risco
- [ ] `pnpm lint` aprovado
- [ ] `pnpm typecheck` aprovado
- [ ] `pnpm test` aprovado
- [ ] `pnpm build` aprovado
- [ ] CI verde

## Segurança, dados e IA

- [ ] Nenhum segredo ou dado sensível foi exposto
- [ ] Autorização, ownership e RLS foram preservados
- [ ] IDs e permissões do cliente não são tratados como confiáveis
- [ ] IA não decide regras, domínio, notas ou plano
- [ ] Item não aplicável justificado abaixo

## Entrega

- [ ] Documentação afetada foi atualizada
- [ ] Deploy em staging concluído
- [ ] Smoke e validação manual em staging aprovados
- [ ] Rollback foi considerado
- [ ] Revisei a [Definition of Done](../docs/product/DEFINITION_OF_DONE.md)
- [ ] Apliquei as [diretrizes de Code Review](../docs/product/CODE_REVIEW_GUIDELINES.md)
- [ ] Para mudanças de interface, apliquei o [checklist de design](../docs/product/DESIGN_REVIEW_CHECKLIST.md)

## Governança

- [ ] Li e preservei os [princípios arquiteturais](../docs/product/ARCHITECTURAL_PRINCIPLES.md)
- [ ] Consultei a [visão](../docs/product/PRODUCT_VISION.md) e os [princípios de produto](../docs/product/PRODUCT_PRINCIPLES.md)
- [ ] A Definition of Done foi integralmente atendida
- [ ] Exceções foram documentadas e aprovadas conforme a governança

## Conteúdo, mentores e estatísticas

Marque cada item ou registre **N/A — justificativa:**.

- [ ] Origem do conteúdo identificada
- [ ] Licença ou base jurídica verificada
- [ ] Autoria, revisão e homologação registradas
- [ ] Mentor corretamente atribuído
- [ ] Conteúdo gerado por IA claramente identificado
- [ ] Decisão pedagógica permanece determinística
- [ ] Estatísticas informam amostra, período e limitações
- [ ] Termos e afirmações clínicas possuem fonte
- [ ] Riscos de privacidade avaliados
- [ ] Decisões pendentes não foram tratadas como aprovadas

## Itens não aplicáveis e justificativas

<!-- Liste os itens não aplicáveis. Não marque como concluído sem validar. -->
