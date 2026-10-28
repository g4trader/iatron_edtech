'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

export function PreferenceHelp({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const close = () => {
    setOpen(false);
    setPinned(false);
  };
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        setOpen(false);
        setPinned(false);
      }
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  return (
    <div
      className="preference-help"
      ref={root}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (!pinned && !root.current?.contains(document.activeElement))
          setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          root.current?.querySelector('button')?.focus();
          close();
        }
      }}
    >
      <button
        type="button"
        className="preference-help-trigger"
        aria-label={`Entender: ${label}`}
        aria-expanded={open}
        aria-controls={id}
        onFocus={() => setOpen(true)}
        onClick={() => {
          setPinned(!pinned);
          setOpen(!pinned);
        }}
      >
        <svg
          aria-hidden="true"
          className="question-information-icon"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v6M12 7.5v.01" />
        </svg>
      </button>
      {open && (
        <div
          id={id}
          className="preference-help-panel"
          role="region"
          aria-label={label}
        >
          <strong>{label}</strong>
          {children}
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              root.current?.querySelector('button')?.focus();
              close();
            }}
          >
            Fechar explicação
          </button>
        </div>
      )}
    </div>
  );
}
