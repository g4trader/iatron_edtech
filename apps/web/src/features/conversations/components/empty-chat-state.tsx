'use client';

const suggestions = [
  'Revisar um tema importante',
  'Praticar com uma questão',
  'Organizar meu estudo de hoje',
  'Entender minhas prioridades',
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
      <h2>Como posso ajudar no seu estudo?</h2>
      <p>
        Escolha um ponto de partida ou pergunte sobre seu diagnóstico, plano ou
        conteúdo.
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
