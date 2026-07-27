'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useRef } from 'react';
import { NavigationLinks, type NavigationItem } from './navigation';
import { logout } from '@/app/(public)/auth/actions';
import { ActionSubmitButton } from '@/components/feedback/action-submit-button';

export function MobileSidebarDrawer({
  open,
  onClose,
  identity,
  homeHref = '/app',
  navigationItems,
  roleLabel,
}: {
  open: boolean;
  onClose: () => void;
  identity: { displayName: string; email: string };
  homeHref?: string;
  navigationItems?: readonly NavigationItem[];
  roleLabel?: string;
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
  const initials = identity.displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
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
          <Link className="brand" href={homeHref as Route} onClick={onClose}>
            <span className="brand-mark">I</span>Iatron
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
        <NavigationLinks items={navigationItems} onNavigate={onClose} />
        <div className="sidebar-account mobile-account">
          <div
            aria-label={`Usuário: ${identity.displayName}`}
            className="profile-menu"
          >
            <span className="avatar" aria-hidden="true">
              {initials}
            </span>
            <span>
              <strong>{identity.displayName}</strong>
              {roleLabel && <small>{roleLabel}</small>}
              <small>{identity.email}</small>
            </span>
          </div>
          <form action={logout}>
            <ActionSubmitButton
              className="sidebar-logout-button"
              pendingLabel="Saindo…"
              variant="secondary"
            >
              Sair
            </ActionSubmitButton>
          </form>
        </div>
      </aside>
    </div>
  );
}
