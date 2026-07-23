# Diretrizes de Code Review

Code review no Iatron avalia a entrega como produto, não apenas a sintaxe do
código. O objetivo é reduzir risco, preservar as fronteiras arquiteturais e
melhorar a experiência do estudante.

Use estas diretrizes junto com a
[Definition of Done](DEFINITION_OF_DONE.md). Mudanças de interface também
exigem o [checklist de revisão de design](DESIGN_REVIEW_CHECKLIST.md).

## Responsabilidade de quem abre o Pull Request

- manter o escopo pequeno e explicável;
- descrever problema, solução, limites e riscos;
- realizar uma autorrevisão antes de solicitar revisão;
- preencher todos os itens aplicáveis do template;
- fornecer evidências suficientes sem incluir dados sensíveis;
- separar dívida preexistente de regressões introduzidas;
- responder comentários com contexto e evidência.

## Responsabilidade de quem revisa

- compreender o problema antes de avaliar a solução;
- priorizar corretude, segurança e experiência sobre preferência pessoal;
- verificar comportamento e consequências, não apenas o diff;
- diferenciar bloqueios, sugestões e perguntas;
- propor uma alternativa quando bloquear por desenho;
- evitar expandir o escopo sem relação com o risco da entrega;
- não aprovar com checklist incompleto ou CI vermelho.

## Ordem recomendada de revisão

1. problema, escopo e critério de aceite;
2. arquitetura e fronteiras de domínio;
3. segurança, privacidade e integridade dos dados;
4. comportamento do produto e UX;
5. acessibilidade e mobile;
6. performance e observabilidade;
7. testes, documentação e operação;
8. qualidade local do código.

Essa ordem evita investir em detalhes de implementação antes de confirmar que
a solução correta está sendo construída.

## Engenharia

Verifique:

- a solução respeita domínios, contratos e responsabilidades existentes;
- nomes expressam intenção e o fluxo é simples de seguir;
- tipagem representa estados válidos e reduz ambiguidades;
- não há duplicação evitável, `any` injustificado ou abstração prematura;
- falhas e concorrência possuem comportamento definido;
- testes verificam resultados, limites e regressões;
- dependências e configuração novas são necessárias;
- não há TODO crítico, mock silencioso ou warning novo relevante;
- migrations, índices e constraints são seguros quando aplicáveis;
- lint, typecheck, testes e build estão verdes.

## Produto e UX

Não aceite uma interface apenas porque a ação técnica funciona.

Verifique:

- o problema do estudante e o resultado esperado estão claros;
- a tela explica onde ele está, por que isso importa e o próximo passo;
- o sistema sugere ou preenche quando pode reduzir esforço com segurança;
- perguntas explicam contexto, benefício e possibilidade de alterar depois;
- loading, erro, sucesso e vazio possuem tratamento;
- textos seguem [voz e tom](VOICE_AND_TONE.md);
- ações e componentes são consistentes com o restante do produto;
- não existem fluxos fictícios, cliques redundantes ou becos sem saída;
- recomendações são explicáveis.

## Acessibilidade e mobile

Verifique evidências para:

- 320, 375, 390, 768 px e desktop;
- ausência de overflow, corte e zoom obrigatório;
- uso com teclado virtual, rolagem e safe areas;
- contraste AA, foco visível, labels e ordem de leitura;
- navegação por teclado;
- anúncios acessíveis para erro, sucesso e mudança de estado;
- HTML semântico e ARIA estritamente necessário.

Testes automatizados ajudam, mas não substituem inspeção do fluxo principal.

## Segurança e privacidade

Trate como bloqueio:

- segredo exposto ou enviado ao frontend;
- autorização baseada apenas em dados do cliente;
- acesso privilegiado no navegador;
- RLS ausente, enfraquecida ou não testada;
- risco de mistura de estudantes, tenants ou ambientes;
- dados sensíveis em logs, fixtures ou evidências;
- entrada não validada em uma fronteira confiável;
- mudança destrutiva sem proteção e rollback.

Para operações autenticadas, confirme identidade, ownership e isolamento no
servidor.

## Inteligência artificial

Verifique:

- a IA explica dados determinísticos, mas não calcula regras, domínio ou plano;
- métricas exibidas possuem fonte verificável;
- tools têm schemas, autorização e escopo mínimos;
- prompts e versões são rastreáveis;
- conteúdo externo não controla instruções do sistema;
- falhas, timeouts e limites têm comportamento seguro;
- auditoria não registra dados sensíveis;
- respostas respeitam o limite educacional do produto.

Qualquer caminho em que a IA possa alterar estado pedagógico sem validação
determinística é bloqueante.

## Performance

Investigue:

- consultas repetidas, N+1 ou sem índice;
- chamadas duplicadas entre servidor e navegador;
- dados, componentes ou dependências enviados sem necessidade;
- renders, cálculos e serializações repetidos;
- operações síncronas no caminho crítico;
- ausência de paginação ou limite em coleções crescentes;
- impacto de cache sobre autorização e atualização de dados.

Peça medição quando o risco não puder ser avaliado pelo diff.

## Observabilidade e operação

Confirme:

- erros relevantes são tratados e distinguíveis;
- logs são estruturados, úteis e seguros;
- existe correlação para fluxos distribuídos quando necessário;
- health, métricas ou alertas refletem a nova dependência;
- deploy, migration e rollback são compatíveis;
- documentação operacional foi atualizada.

## Como escrever comentários

Use um prefixo para deixar a intenção clara:

- **bloqueio:** precisa ser resolvido antes do merge;
- **risco:** requer resposta ou evidência antes da aprovação;
- **sugestão:** melhoria não bloqueante;
- **pergunta:** busca contexto, sem pressupor erro;
- **elogio:** registra uma decisão que vale preservar.

Exemplo:

> **bloqueio — segurança:** o `studentId` vem do cliente e é usado sem validar
> ownership. Resolva o estudante a partir do JWT e cubra o isolamento com teste.

Outros exemplos:

> **bloqueio — arquitetura:** este componente recalcula prioridade pedagógica.
> Consuma a decisão produzida pelo Learning Engine e mantenha o frontend apenas
> como apresentação.

> **risco — UX:** o campo pede disponibilidade sem explicar o benefício ou se
> a escolha pode ser alterada. Aplique o padrão de contexto antes da aprovação.

> **bloqueio — IA:** o prompt permite que o modelo altere o plano diretamente.
> A IA pode explicar a recomendação, mas a mutação deve passar pelo serviço
> determinístico autorizado.

> **sugestão — consistência:** este vazio pode reutilizar o componente
> compartilhado para manter ação, tom e anúncio acessível.

Comentários devem explicar impacto e critério, evitando ordens sem contexto.

## Critério de aprovação

Aprove somente quando:

- critérios de aceite estão demonstrados;
- itens aplicáveis da Definition of Done estão atendidos;
- riscos bloqueantes foram resolvidos;
- testes e CI estão verdes;
- documentação e evidências são suficientes;
- a mudança pode ser implantada e revertida com segurança.
