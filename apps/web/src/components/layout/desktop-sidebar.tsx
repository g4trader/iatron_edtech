'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { NavigationLinks } from './navigation';
import { logout } from '@/app/(public)/auth/actions';

export function DesktopSidebar({
  collapsed,
  onToggle,
  identity,
  recentConversations,
}: {
  collapsed: boolean;
  onToggle: () => void;
  identity: { displayName: string; email: string };
  recentConversations: { id: string; title: string }[];
}) {
  const initials = identity.displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return (
    <aside
      aria-label="Barra lateral"
      className="desktop-sidebar"
      data-collapsed={collapsed}
    >
      <div className="sidebar-brand-row">
        <Link aria-label="Iatron — início" className="brand" href="/app">
          <span className="brand-mark" aria-hidden="true">
            I
          </span>
          {!collapsed && <span>Iatron</span>}
        </Link>
        <button
          aria-label={
            collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'
          }
          className="icon-button compact"
          onClick={onToggle}
          title={collapsed ? 'Expandir' : 'Recolher'}
          type="button"
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>
      <Link
        className="new-chat-button"
        href="/app/tutor"
        title={collapsed ? 'Falar com um mentor' : undefined}
      >
        <span aria-hidden="true">＋</span>
        {!collapsed && 'Falar com um mentor'}
      </Link>
      <NavigationLinks collapsed={collapsed} />
      {!collapsed && recentConversations.length > 0 && (
        <section className="recent-section" aria-labelledby="recent-title">
          <h2 id="recent-title">Orientações recentes</h2>
          {recentConversations.map((conversation) => (
            <Link
              href={`/app/tutor/${conversation.id}` as Route}
              key={conversation.id}
            >
              <span>{conversation.title}</span>
              <small>Continuar orientação</small>
            </Link>
          ))}
        </section>
      )}
      <div className="sidebar-account">
        <div
          aria-label={`Usuário: ${identity.displayName}`}
          className="profile-menu"
          title={collapsed ? 'Perfil de estudante' : undefined}
        >
          <span className="avatar" aria-hidden="true">
            {initials}
          </span>
          {!collapsed && (
            <span>
              <strong>{identity.displayName}</strong>
              <small>{identity.email}</small>
            </span>
          )}
        </div>
        <form action={logout}>
          <button
            aria-label="Sair da conta"
            className="sidebar-logout-button"
            title={collapsed ? 'Sair' : undefined}
            type="submit"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="20"
              viewBox="0 0 24 24"
              width="20"
            >
              <path
                d="M10 17l5-5-5-5M15 12H3m9-8h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            {!collapsed && <span>Sair</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
