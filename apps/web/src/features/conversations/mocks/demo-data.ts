import type { ChatMessage, QuestionViewModel } from '@iatron/contracts';

export const demoQuestion: QuestionViewModel = {
  id: 'question-demo-1',
  number: 3,
  total: 10,
  area: 'Clínica Médica — demonstração',
  clinicalContext:
    'Conteúdo fictício criado apenas para demonstrar a interface educacional.',
  stem: 'Qual alternativa representa a melhor próxima etapa no cenário demonstrativo?',
  options: [
    {
      id: 'a',
      label: 'A',
      text: 'Revisar os dados disponíveis antes de decidir.',
    },
    {
      id: 'b',
      label: 'B',
      text: 'Ignorar informações que ainda não foram confirmadas.',
    },
    {
      id: 'c',
      label: 'C',
      text: 'Considerar apenas uma hipótese sem comparação.',
    },
    {
      id: 'd',
      label: 'D',
      text: 'Tratar o exemplo como orientação clínica real.',
    },
    {
      id: 'e',
      label: 'E',
      text: 'Encerrar a avaliação sem registrar a resposta.',
    },
  ],
  markedForReview: false,
  status: 'unanswered',
};

const timestamp = '2026-07-21T12:00:00.000Z';

export const emptyConversation: ChatMessage[] = [];

export const questionConversation: ChatMessage[] = [
  {
    id: 'assistant-question',
    role: 'assistant',
    createdAt: timestamp,
    status: 'complete',
    parts: [
      { type: 'text', text: 'Vamos praticar com uma questão demonstrativa.' },
      { type: 'question', question: demoQuestion },
    ],
  },
];

export const gapConversation: ChatMessage[] = [
  {
    id: 'assistant-gap',
    role: 'assistant',
    createdAt: timestamp,
    status: 'complete',
    parts: [
      {
        type: 'text',
        text: 'Este é um resumo demonstrativo, sem cálculo pedagógico real.',
      },
      {
        type: 'gap-summary',
        data: {
          id: 'gap-1',
          area: 'Clínica Médica',
          topic: 'Raciocínio diagnóstico',
          priority: 'high',
          mastery: 42,
        },
      },
    ],
  },
];

export const planConversation: ChatMessage[] = [
  {
    id: 'assistant-plan',
    role: 'assistant',
    createdAt: timestamp,
    status: 'complete',
    parts: [
      {
        type: 'study-plan',
        data: {
          title: 'Plano demonstrativo de hoje',
          progress: 35,
          sessions: [
            {
              id: 's1',
              title: 'Revisão orientada',
              durationMinutes: 25,
              status: 'active',
            },
            {
              id: 's2',
              title: 'Questões comentadas',
              durationMinutes: 30,
              status: 'pending',
            },
          ],
        },
      },
    ],
  },
];

export const errorConversation: ChatMessage[] = [
  {
    id: 'assistant-error',
    role: 'assistant',
    createdAt: timestamp,
    status: 'error',
    parts: [
      { type: 'text', text: 'Não foi possível concluir a resposta simulada.' },
    ],
  },
];

export const streamingConversation: ChatMessage[] = [
  {
    id: 'assistant-streaming',
    role: 'assistant',
    createdAt: timestamp,
    status: 'streaming',
    parts: [{ type: 'text', text: 'Organizando sua explicação' }],
  },
];

export const recentConversations = [
  { id: 'demo', title: 'Revisão de clínica médica', dateLabel: 'Hoje' },
  { id: 'question', title: 'Questão demonstrativa', dateLabel: 'Ontem' },
  { id: 'gap', title: 'Principais gaps', dateLabel: 'Segunda' },
];
