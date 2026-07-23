'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { NavigationLinks } from './navigation';

export function MobileSidebarDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const drawer = closeButtonRef.current?.closest('[role="dialog"]');
      const focusable = drawer?.querySelectorAll<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;
  return (
    <div className="drawer-layer" data-testid="mobile-drawer-layer">
      <button
        aria-label="Fechar menu"
        className="drawer-backdrop"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-label="Menu de navegação"
        aria-modal="true"
        className="mobile-drawer"
        role="dialog"
      >
        <div className="sidebar-brand-row">
          <Link className="brand" href="/app" onClick={onClose}>
            <span className="brand-mark">ia</span>Iatron
          </Link>
          <button
            ref={closeButtonRef}
            aria-label="Fechar menu"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <Link
          className="new-chat-button"
          href="/app/chat/new"
          onClick={onClose}
        >
          ＋ Nova conversa
        </Link>
        <NavigationLinks onNavigate={onClose} />
      </aside>
    </div>
  );
}
