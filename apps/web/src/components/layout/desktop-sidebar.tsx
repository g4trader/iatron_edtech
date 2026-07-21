'use client';

import Link from 'next/link';
import { recentConversations } from '@/features/conversations/mocks/demo-data';
import { NavigationLinks } from './navigation';
import { logout } from '@/app/(public)/auth/actions';

export function DesktopSidebar({
  collapsed,
  onToggle,
  identity,
}: {
  collapsed: boolean;
  onToggle: () => void;
  identity: { displayName: string; email: string };
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
            ia
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
        href="/app/chat/new"
        title={collapsed ? 'Nova conversa' : undefined}
      >
        <span aria-hidden="true">＋</span>
        {!collapsed && 'Nova conversa'}
      </Link>
      <NavigationLinks collapsed={collapsed} />
      {!collapsed && (
        <section className="recent-section" aria-labelledby="recent-title">
          <h2 id="recent-title">Conversas recentes</h2>
          {recentConversations.map((conversation) => (
            <Link href={`/app/chat/${conversation.id}`} key={conversation.id}>
              <span>{conversation.title}</span>
              <small>{conversation.dateLabel}</small>
            </Link>
          ))}
        </section>
      )}
      <form action={logout}>
        <button
          className="profile-menu"
          title={collapsed ? 'Perfil de estudante' : undefined}
          type="button"
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
        </button>
      </form>
    </aside>
  );
}
