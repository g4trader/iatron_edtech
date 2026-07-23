# Checklist de revisão de design

Este checklist é obrigatório para toda contribuição que altere uma experiência
do Iatron. Cada item aplicável deve ser respondido com **sim** antes da
aprovação. Itens não aplicáveis devem trazer uma justificativa curta.

Use este documento junto com os
[princípios de experiência](UX_PRINCIPLES.md) e o guia de
[voz e tom](VOICE_AND_TONE.md).

## Clareza

- [ ] O estudante entende imediatamente onde está?
- [ ] A ação principal está evidente?
- [ ] A tela explica por que existe?
- [ ] Está claro o que acontece depois?
- [ ] Títulos e rótulos descrevem benefícios, não estruturas internas?
- [ ] Informações importantes aparecem antes dos detalhes?

## Esforço

- [ ] Esta é a forma mais simples de concluir a tarefa?
- [ ] O sistema pode sugerir uma resposta inicial?
- [ ] O sistema pode preencher algo com segurança?
- [ ] Há algum clique, campo ou confirmação desnecessário?
- [ ] Escolhas frequentes estão disponíveis antes da personalização manual?
- [ ] O progresso é preservado ao voltar, atualizar ou interromper?
- [ ] Está claro que preferências podem ser alteradas depois?

## Microcopy

- [ ] Perguntas possuem contexto?
- [ ] O benefício para o estudante está explícito?
- [ ] Consequências relevantes estão claras?
- [ ] A linguagem é humana, calma e objetiva?
- [ ] O texto evita jargão interno?
- [ ] O conteúdo pode ser reduzido sem perder significado?
- [ ] Botões descrevem a ação em vez de usar “OK”, “Sim” ou “Continuar”
      sem contexto?
- [ ] A redação segue o guia de voz e tom?

## Estados da interface

### Carregamento

- [ ] O carregamento informa o que está sendo preparado?
- [ ] A ação em andamento evita envio duplicado?
- [ ] Não há progresso ou prazo inventado?

### Erro

- [ ] A mensagem explica o problema em linguagem simples?
- [ ] O estudante sabe como tentar novamente ou seguir adiante?
- [ ] Dados já preenchidos são preservados quando possível?
- [ ] O erro não culpa o estudante nem expõe detalhes técnicos?

### Sucesso

- [ ] A interface confirma que a ação terminou?
- [ ] O resultado e o próximo passo estão claros?
- [ ] O feedback pode ser percebido por tecnologias assistivas?

### Vazio

- [ ] O estado explica por que ainda não há conteúdo?
- [ ] Ele ensina o que aparecerá ali?
- [ ] Existe uma próxima ação útil quando aplicável?
- [ ] O vazio não parece uma falha do sistema?

## Mobile

- [ ] A experiência foi projetada e testada primeiro em tela pequena?
- [ ] A ação principal está ao alcance do polegar?
- [ ] Alvos de toque têm tamanho e espaçamento confortáveis?
- [ ] O teclado não encobre campos ou ações?
- [ ] A rolagem vertical continua disponível em conteúdos longos?
- [ ] Não há rolagem horizontal acidental?
- [ ] Safe areas são respeitadas?
- [ ] A interface foi validada em 320, 375, 390, 768 e 1024 px?
- [ ] Mudanças de orientação e zoom não causam perda de conteúdo?

## Acessibilidade

- [ ] Texto e controles atendem contraste WCAG AA?
- [ ] A ordem de foco acompanha a ordem visual e lógica?
- [ ] Todo campo possui label associado?
- [ ] Nomes e estados acessíveis são claros?
- [ ] ARIA é usado apenas quando o HTML semântico não basta?
- [ ] Mensagens dinâmicas importantes são anunciadas?
- [ ] A tarefa pode ser concluída apenas com teclado?
- [ ] A interface permanece compreensível com leitor de tela?
- [ ] Movimento e animação respeitam preferências do sistema?

## Consistência

- [ ] A mesma ação usa o mesmo componente e rótulo?
- [ ] Componentes iguais mantêm comportamento igual?
- [ ] Navegação, loading, erro, sucesso e vazio seguem padrões existentes?
- [ ] O tom permanece coerente em todas as etapas?
- [ ] O mesmo conceito usa sempre a mesma palavra?
- [ ] O problema recorrente foi corrigido no componente compartilhado?
- [ ] A mudança evita criar uma exceção local desnecessária?

## IA e explicabilidade

- [ ] O Tutor fala como orientador, não como chatbot genérico?
- [ ] Recomendações mostram motivos compreensíveis?
- [ ] Métricas apresentadas vêm do sistema, não são inventadas pela IA?
- [ ] Fontes e limites educacionais estão claros?
- [ ] A resposta evita diagnóstico ou atendimento médico?
- [ ] Dados de outros estudantes não podem aparecer?

## Validação da entrega

- [ ] Apenas testes afetados foram atualizados ou adicionados?
- [ ] Lint, typecheck e testes estão aprovados?
- [ ] O build de produção está aprovado?
- [ ] O smoke test cobre a ação principal?
- [ ] A versão publicada foi validada manualmente em staging?
- [ ] CI está verde?
- [ ] A árvore de trabalho está limpa?

## Registro recomendado na revisão

Copie este resumo para a descrição da mudança:

```text
Tela ou fluxo:
Benefício para o estudante:
Esforço removido:
Microcopy revisada:
Estados validados:
Larguras validadas:
Acessibilidade:
Testes:
```
