'use client';

const suggestions = [
  'Por que esta competência está no meu plano?',
  'O que significa meu domínio?',
  'Como posso melhorar minha principal prioridade?',
  'Ajude-me a revisar um tema de hoje',
];

export function EmptyChatState({
  onSelect,
}: {
  onSelect: (text: string) => void;
}) {
  return (
    <section className="empty-chat">
      <span className="empty-chat-mark" aria-hidden="true">
        ia
      </span>
      <h2>Por onde vamos começar?</h2>
      <p>
        Posso explicar seus resultados, ajudar com um conteúdo ou mostrar o
        motivo de uma recomendação. Escolha uma pergunta ou escreva a sua.
      </p>
      <div className="suggestion-grid">
        {suggestions.map((suggestion) => (
          <button
            onClick={() => onSelect(suggestion)}
            type="button"
            key={suggestion}
          >
            {suggestion}
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>
    </section>
  );
}
