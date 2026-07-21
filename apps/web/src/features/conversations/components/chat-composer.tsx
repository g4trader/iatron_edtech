'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { OfflineNotice } from '@/components/feedback/states';

export function ComposerActions({
  generating,
  onCancel,
}: {
  generating: boolean;
  onCancel: () => void;
}) {
  return generating ? (
    <button className="stop-button" onClick={onCancel} type="button">
      <span aria-hidden="true">■</span> Interromper
    </button>
  ) : null;
}

export function ChatComposer({
  conversationId,
  generating,
  offline,
  onCancel,
  onSend,
}: {
  conversationId: string;
  generating: boolean;
  offline: boolean;
  onCancel: () => void;
  onSend: (text: string) => void;
}) {
  const storageKey = `iatron:draft:${conversationId}`;
  const [draft, setDraft] = useState(() =>
    typeof window === 'undefined'
      ? ''
      : (window.localStorage.getItem(storageKey) ?? ''),
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const limit = 2000;

  useEffect(() => {
    window.localStorage.setItem(storageKey, draft);
  }, [draft, storageKey]);
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [draft]);

  const submit = () => {
    const text = draft.trim();
    if (!text || generating || offline) return;
    onSend(text);
    setDraft('');
    window.localStorage.removeItem(storageKey);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };
  return (
    <div className="composer-wrap">
      {offline && <OfflineNotice />}
      <ComposerActions generating={generating} onCancel={onCancel} />
      <form
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label className="sr-only" htmlFor="chat-message">
          Mensagem
        </label>
        <textarea
          aria-describedby="composer-help composer-count"
          disabled={offline}
          id="chat-message"
          maxLength={limit}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            offline
              ? 'Reconecte-se para enviar'
              : 'Pergunte, revise ou comece uma atividade…'
          }
          ref={textareaRef}
          rows={1}
          value={draft}
        />
        <div className="composer-footer">
          <span id="composer-help">
            Enter envia · Shift+Enter cria uma linha
          </span>
          <span id="composer-count">
            {draft.length}/{limit}
          </span>
          <button
            aria-label="Enviar mensagem"
            className="send-button"
            disabled={!draft.trim() || generating || offline}
            type="submit"
          >
            ↑
          </button>
        </div>
      </form>
      <p className="educational-disclaimer">
        Ambiente educacional. Não substitui orientação médica.
      </p>
    </div>
  );
}
