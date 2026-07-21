'use client';

import type { ChatMessage } from '@iatron/contracts';
import { MessagePart } from './message-parts';

export function MessageActions({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="message-actions">
      <button aria-label="Copiar mensagem" type="button">
        Copiar
      </button>
      {onRetry && (
        <button onClick={onRetry} type="button">
          Tentar novamente
        </button>
      )}
    </div>
  );
}
export function StreamingIndicator() {
  return (
    <span aria-label="Gerando resposta" className="streaming-indicator">
      <i />
      <i />
      <i />
    </span>
  );
}
export function SystemNotice({ children }: { children: string }) {
  return (
    <div className="system-notice" role="status">
      {children}
    </div>
  );
}
export function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <article aria-label="Sua mensagem" className="message-item user-message">
      {message.parts.map((part, index) => (
        <MessagePart key={`${message.id}-${index}`} part={part} />
      ))}
    </article>
  );
}
export function AssistantMessage({
  message,
  onRetry,
}: {
  message: ChatMessage;
  onRetry?: () => void;
}) {
  return (
    <article
      aria-label="Resposta do assistente"
      className="message-item assistant-message"
      data-status={message.status}
    >
      <div className="assistant-avatar" aria-hidden="true">
        ia
      </div>
      <div className="assistant-content">
        {message.parts.map((part, index) => (
          <MessagePart key={`${message.id}-${index}`} part={part} />
        ))}
        {message.status === 'streaming' && <StreamingIndicator />}
        {message.status === 'error' && (
          <p className="message-error">Resposta interrompida.</p>
        )}
        <MessageActions onRetry={onRetry} />
      </div>
    </article>
  );
}
export function MessageItem({
  message,
  onRetry,
}: {
  message: ChatMessage;
  onRetry?: () => void;
}) {
  if (message.role === 'system')
    return (
      <SystemNotice>
        {message.parts[0]?.type === 'text'
          ? message.parts[0].text
          : 'Aviso do sistema'}
      </SystemNotice>
    );
  return message.role === 'user' ? (
    <UserMessage message={message} />
  ) : (
    <AssistantMessage message={message} onRetry={onRetry} />
  );
}
export function MessageList({
  messages,
  onRetry,
}: {
  messages: ChatMessage[];
  onRetry?: () => void;
}) {
  return (
    <section
      aria-label="Mensagens"
      aria-live="polite"
      aria-relevant="additions text"
      className="message-list"
    >
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onRetry={message.status === 'error' ? onRetry : undefined}
        />
      ))}
    </section>
  );
}
