'use client';

const suggestions = [
  'Revisar um tema importante',
  'Praticar com uma questão',
  'Organizar meu estudo de hoje',
  'Entender meus gaps',
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
      <h2>O que você quer dominar hoje?</h2>
      <p>Escolha um ponto de partida ou escreva sua própria pergunta.</p>
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
