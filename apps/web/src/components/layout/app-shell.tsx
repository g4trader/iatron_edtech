'use client';

import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { AppHeader } from './app-header';
import { ContextPanel } from './context-panel';
import { DesktopSidebar } from './desktop-sidebar';
import { MobileSidebarDrawer } from './mobile-sidebar-drawer';
import type { NavigationItem } from './navigation';

const storageKey = 'iatron:sidebar-collapsed';

export function AppShell({
  children,
  identity = { displayName: 'Estudante', email: '' },
  workspace,
}: {
  children: ReactNode;
  identity?: { displayName: string; email: string };
  workspace?: {
    homeHref: string;
    label: string;
    roleLabel: string;
    navigationItems: readonly NavigationItem[];
  };
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.localStorage.getItem(storageKey) === 'true',
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(storageKey, String(next));
      return next;
    });
  };

  return (
    <div className="app-frame">
      <DesktopSidebar
        collapsed={collapsed}
        homeHref={workspace?.homeHref}
        navigationItems={workspace?.navigationItems}
        onToggle={toggleCollapsed}
        identity={identity}
        roleLabel={workspace?.roleLabel}
      />
      <MobileSidebarDrawer
        homeHref={workspace?.homeHref}
        identity={identity}
        navigationItems={workspace?.navigationItems}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        roleLabel={workspace?.roleLabel}
      />
      <div className="app-main">
        <AppHeader
          eyebrow={workspace?.label}
          homeHref={workspace?.homeHref}
          navigationItems={workspace?.navigationItems}
          pathname={pathname}
          showBreadcrumb={Boolean(workspace)}
          onOpenMenu={() => setDrawerOpen(true)}
        />
        <div className="app-content">{children}</div>
      </div>
      <ContextPanel />
    </div>
  );
}
