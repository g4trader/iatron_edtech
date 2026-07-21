'use client';

import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { AppHeader } from './app-header';
import { ContextPanel } from './context-panel';
import { DesktopSidebar } from './desktop-sidebar';
import { MobileSidebarDrawer } from './mobile-sidebar-drawer';

const storageKey = 'iatron:sidebar-collapsed';

export function AppShell({ children }: { children: ReactNode }) {
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
      <DesktopSidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      <MobileSidebarDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <div className="app-main">
        <AppHeader pathname={pathname} onOpenMenu={() => setDrawerOpen(true)} />
        {children}
      </div>
      <ContextPanel />
    </div>
  );
}
