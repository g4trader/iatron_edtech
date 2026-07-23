# Princípios de experiência do Iatron

Este documento é referência obrigatória para toda decisão de produto e
implementação de interface no Iatron.

Toda contribuição que altere uma experiência também deve seguir:

- [Voz e tom](VOICE_AND_TONE.md);
- [Checklist de revisão de design](DESIGN_REVIEW_CHECKLIST.md).

Esses três documentos formam o contrato de experiência do produto. A revisão
de uma mudança de interface só está completa quando o checklist foi aplicado.

## Filosofia

O Iatron não é um banco de questões. É um orientador de estudos que ajuda cada
estudante a entender onde está, decidir o próximo passo e perceber sua evolução.

Toda interação deve transmitir:

- confiança;
- simplicidade;
- clareza;
- progresso;
- inteligência.

Nunca burocracia.

## Princípios

1. Nunca faça o usuário pensar quando o sistema pode sugerir.
2. Sempre explique por que uma informação é solicitada.
3. Sempre explique o benefício para o estudante.
4. Deixe claro quando uma escolha pode ser alterada depois.
5. O sistema trabalha mais do que o usuário.
6. Prefira sugestões úteis a formulários longos.
7. Toda tela deve responder: o que é isso, por que importa e o que acontece
   depois?
8. Mostre progresso constantemente, sem transformar estudo em pressão.
9. Estados vazios devem ensinar e indicar um próximo passo; nunca devem parecer
   erros.
10. Toda decisão importante precisa de contexto. Nunca apresente apenas um
    campo isolado.
11. Microcopy faz parte do produto. Evite textos genéricos, frios ou técnicos.
12. A IA deve se comportar como tutor, nunca como chatbot.
13. Toda recomendação precisa ser explicável em linguagem humana.
14. O estudante deve perceber valor imediato nas informações que compartilha.
15. Mobile first. Desktop é uma adaptação, nunca o contrário.

## Padrões de aplicação

### Linguagem

- Fale com o estudante, não sobre o sistema.
- Prefira “seu domínio”, “suas prioridades” e “sua evolução”.
- Evite termos internos como scheduler, engine, persistência, assessment,
  algoritmo e versão técnica.
- Use frases curtas, voz ativa e verbos que indiquem resultado.

### Contexto e decisões

Perguntas e escolhas importantes devem informar:

1. por que a informação é necessária;
2. qual benefício ela produz;
3. se poderá ser alterada depois.

### Estados vazios

Um estado vazio deve:

- explicar por que ainda não há conteúdo;
- dizer o que será exibido no futuro;
- oferecer uma próxima ação quando ela existir.

### Carregamento, sucesso e erro

- Carregamentos importantes devem indicar o que está sendo preparado.
- Ações relevantes devem responder visualmente com resultado claro.
- Erros devem explicar o que aconteceu em linguagem simples e, quando
  possível, oferecer recuperação.

### IA e recomendações

- O Tutor explica dados calculados pelo produto; não inventa métricas.
- Recomendações devem mostrar seus motivos.
- Limites educacionais e fontes devem permanecer claros sem linguagem
  alarmista.

### Mobile e acessibilidade

- Controles têm alvo mínimo confortável e respeitam safe areas.
- Conteúdo principal sempre pode rolar, inclusive com teclado aberto.
- Textos quebram naturalmente sem criar overflow.
- Ordem de foco, labels, estados e feedback são compreensíveis por leitores de
  tela.
- Contraste atende WCAG AA.

## Checklist para novas entregas

- A tela explica o que é, por que importa e o próximo passo?
- Há algum campo sem contexto?
- O estado vazio ensina?
- A ação principal é inequívoca?
- Loading, sucesso e erro possuem feedback humano?
- Há jargão interno visível?
- Funciona primeiro no mobile, com teclado, zoom e safe area?
- Componentes semelhantes mantêm linguagem e comportamento consistentes?
- A voz e o tom seguem o padrão do produto?
- O checklist de revisão de design foi preenchido?
