'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { NavigationItem } from './navigation';

const titleByPath: Record<string, string> = {
  '/app': 'Jornada',
  '/app/profile': 'Perfil',
  '/app/plan': 'Meu plano',
  '/app/simulations': 'Simulados',
  '/app/performance': 'Meu progresso',
  '/app/assessment/demo': 'Diagnóstico',
};
const titleByPrefix = [
  ['/app/assessment', 'Diagnóstico'],
  ['/app/learning', 'Jornada'],
  ['/app/academic', 'Jornada'],
  ['/app/tutor', 'Mentores'],
] as const;

export function AppHeader({
  pathname,
  onOpenMenu,
  eyebrow = 'Sua preparação',
  homeHref = '/app',
  navigationItems,
  showBreadcrumb = false,
}: {
  pathname: string;
  onOpenMenu: () => void;
  eyebrow?: string;
  homeHref?: string;
  navigationItems?: readonly NavigationItem[];
  showBreadcrumb?: boolean;
}) {
  const configuredTitle = [...(navigationItems ?? [])]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) =>
      item.href === homeHref
        ? pathname === item.href
        : pathname.startsWith(item.href),
    )?.label;
  const title =
    configuredTitle ??
    titleByPath[pathname] ??
    titleByPrefix.find(([prefix]) => pathname.startsWith(prefix))?.[1] ??
    (pathname.startsWith('/app/chat/') ? 'Conversa de estudo' : 'Iatron');
  return (
    <header className="app-header">
      <button
        aria-label="Abrir menu"
        className="icon-button mobile-menu-button"
        onClick={onOpenMenu}
        type="button"
      >
        ☰
      </button>
      <div>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        {showBreadcrumb && (
          <nav aria-label="Breadcrumb" className="app-breadcrumb">
            <Link href={homeHref as Route}>Início</Link>
            {pathname !== homeHref && (
              <>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{title}</span>
              </>
            )}
          </nav>
        )}
      </div>
      <span aria-hidden="true" className="header-action-spacer" />
    </header>
  );
}
