# Guia de desenvolvimento para Codex

Este guia determina como o Codex e outros agentes de desenvolvimento devem
trabalhar no Iatron. Ele complementa o `AGENTS.md` e não substitui instruções
mais específicas do usuário.

## Antes de implementar

Leia integralmente:

1. [Princípios de UX](UX_PRINCIPLES.md);
2. [Voz e tom](VOICE_AND_TONE.md);
3. [Princípios arquiteturais](ARCHITECTURAL_PRINCIPLES.md);
4. [Definition of Done](DEFINITION_OF_DONE.md).

Depois:

1. leia o `AGENTS.md`, README e documentação do domínio afetado;
2. inspecione o repositório e o estado do Git;
3. identifique problema, critério de aceite, riscos e fronteiras;
4. preserve alterações existentes do usuário;
5. anuncie escopo, decisões e validação pretendida;
6. implemente a menor unidade funcional completa.

Não inicie pela solução antes de compreender a fonte de verdade e os efeitos da
mudança.

## Durante a implementação

### Arquitetura

- mantenha regras de negócio no backend;
- use o frontend apenas para apresentação, intenção e feedback;
- não duplique regras entre componentes ou serviços;
- preserve contratos, versionamento e compatibilidade;
- registre uma decisão em ADR quando ela alterar uma fronteira arquitetural;
- não introduza dependência sem necessidade comprovada.

### UX

Toda tela deve responder:

- por que o estudante está vendo isso?
- qual benefício recebe?
- o que deve fazer?
- o que acontece depois?

Prefira sugestão a formulário, contexto a campo isolado e componente
compartilhado a exceção local. Aplique o
[checklist de design](DESIGN_REVIEW_CHECKLIST.md).

### Mobile

Toda feature nasce mobile-first. Preserve:

- 320, 375, 390, 768 px e desktop;
- rolagem vertical;
- teclado virtual;
- safe areas;
- alvos de toque;
- ausência de overflow e zoom obrigatório.

### Microcopy

Revise sempre:

- contexto;
- benefício;
- consequência;
- possibilidade de alterar depois;
- loading, erro, sucesso e vazio;
- aderência ao guia de voz e tom.

Não exponha nomes internos como scheduler, engine, assessment ou persistência.

### Inteligência artificial

Nunca mova regras para LLM.

- IA não calcula domínio, gaps, confiança, nota ou plano;
- IA não decide agenda nem altera estado pedagógico;
- IA explica dados produzidos pelo Learning Engine;
- tool calls são validadas e autorizadas no backend;
- prompts e conteúdo recuperado são entradas não confiáveis;
- métricas, fontes e contexto nunca são inventados;
- nenhuma chave é exposta no frontend.

### Segurança

- derive identidade do JWT validado;
- nunca confie em IDs ou permissões do cliente;
- preserve e teste RLS;
- não registre segredos ou dados sensíveis;
- mantenha ambientes isolados;
- use menor privilégio e falha segura.

## Antes de finalizar

Execute automaticamente a
[Definition of Done](DEFINITION_OF_DONE.md).

No mínimo:

1. revise o diff e execute `git diff --check`;
2. execute `pnpm lint`;
3. execute `pnpm typecheck`;
4. execute `pnpm test`;
5. execute `pnpm build`;
6. execute os testes E2E e de acessibilidade afetados;
7. valide larguras obrigatórias quando houver interface;
8. publique e valide staging;
9. confirme CI verde;
10. execute smoke e validação manual do fluxo;
11. atualize documentação e evidências;
12. confirme working tree limpa.

Não declare fase ou funcionalidade concluída se algum critério obrigatório
falhar. Informe objetivamente o bloqueio, a evidência e a correção mínima
necessária.

## Forma de relatar

O relatório final deve:

- começar pelo resultado;
- distinguir aprovado, bloqueado e não aplicável;
- citar testes realmente executados;
- informar commit, deploy, CI e working tree;
- não afirmar validação manual que não ocorreu;
- não ocultar warning, fallback ou dependência pendente;
- ser conciso e verificável.

