# ADR 0003: estado do frontend e transporte do chat

- Status: aceito
- Data: 2026-07-21

## Contexto

A interface precisa sustentar shell responsivo, rascunhos, streaming, cancelamento e avaliação interativa sem autenticação, persistência ou IA reais nesta fase. O transporte futuro usará SSE, mas componentes não podem depender do mock.

## Decisão

Usaremos estado local e reducers por domínio. A sidebar persiste uma preferência de interface em `localStorage`; o composer persiste rascunhos por conversa. A avaliação possui reducer próprio. Não introduziremos Zustand ou Redux enquanto não houver estado transversal que justifique a dependência.

O chat depende da interface `ChatTransport`, cujo retorno é um `AsyncIterable` de eventos discriminados. `MockChatTransport` implementa o contrato somente em desenvolvimento e testes. Uma implementação SSE futura deverá preservar o mesmo contrato.

## Consequências

- Componentes não conhecem detalhes de rede.
- Chunks de streaming atualizam apenas a mensagem ativa.
- Mocks são determinísticos, substituíveis e não simulam regras pedagógicas reais.
- Persistência atual é limitada a preferências e rascunhos no dispositivo.
- Estado remoto e cache serão decididos quando existirem APIs reais.
