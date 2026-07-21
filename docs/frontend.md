# Frontend AI First

## Organização

```text
apps/web/src
├── app
│   ├── (public)                  rotas públicas
│   ├── (authenticated)/app      ambiente autenticado demonstrativo
│   └── design-system            catálogo apenas em desenvolvimento
├── components
│   ├── feedback                 estados transversais
│   └── layout                   shell, sidebars, header e containers
└── features
    ├── assessments              componentes e estado da avaliação
    ├── conversations            chat, transporte e mocks
    └── learning                 cards de aprendizagem
```

As páginas permanecem Server Components sempre que não precisam de interação. Drawers, composer, chat e avaliação são Client Components isolados.

## Estratégia de estado

- Estado de interface do shell: `AppShell`, com sidebar persistida em `localStorage`.
- Estado de conversa: local ao `ChatShell`; rascunhos são persistidos por conversa.
- Estado da avaliação: reducer próprio no `AssessmentShell`.
- Transporte: contrato `ChatTransport`, independente de React.

Não há store global única. Dados reais deverão chegar por uma camada de aplicação em uma fase futura.

## Transporte de chat

`ChatTransport.sendMessage` retorna `AsyncIterable<ChatTransportEvent>`. A interface suporta início, deltas de texto, partes estruturadas, reconexão, conclusão e erro. `cancel` interrompe uma solicitação pelo identificador.

`MockChatTransport` existe somente para desenvolvimento e testes. Em produção, a fábrica atual não entrega transporte; uma implementação SSE poderá substituí-la sem alterar os componentes.

## Mocks

Mocks determinísticos ficam em pastas `mocks` dentro das features. Eles são claramente identificados como demonstração e não calculam nota, domínio ou prioridade real. Conversas disponíveis: vazia, streaming, questão, gap, plano e erro. A avaliação possui estados ativo, pausado e concluído.

## Acessibilidade

- Landmarks e nomes acessíveis identificam navegação, mensagens e conteúdo.
- Drawer possui foco inicial, Escape, ciclo de Tab e restauração de foco.
- Streaming usa `aria-live` e não depende exclusivamente de animação.
- Composer respeita IME, Shift+Enter, estados offline e labels.
- Controles possuem alvos mínimos de 44 px e foco visível.
- Tokens foram escolhidos para contraste AA e o CSS respeita `prefers-reduced-motion`.
- Componentes foram projetados para zoom de 200% e largura mínima de 320 px.

## Testes

```bash
pnpm test
pnpm test:e2e
```

Vitest e Testing Library cobrem comportamento isolado. Playwright foi escolhido para E2E porque valida Chromium desktop e mobile, integração real com o App Router, teclado, navegação e responsividade sem adicionar uma aplicação de testes separada.

Na primeira execução, instale o navegador:

```bash
pnpm exec playwright install chromium
```
