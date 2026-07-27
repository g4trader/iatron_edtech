import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { requireEditorialRole } from '@/features/editorial/server/access';

export default async function EditorialLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile } = await requireEditorialRole(['editor', 'admin']);
  return (
    <AppShell
      identity={{
        displayName: profile?.display_name ?? 'Editor',
        email: user.email ?? '',
      }}
      workspace={{
        homeHref: '/editorial',
        label: 'Workspace Editorial',
        roleLabel: 'Editorial',
        navigationItems: [
          { href: '/editorial', label: 'Visão geral', icon: 'V' },
          { href: '/editorial/content', label: 'Conteúdos', icon: 'C' },
          { href: '/editorial/specialties', label: 'Workflow', icon: 'W' },
          { href: '/editorial/library', label: 'Biblioteca', icon: 'B' },
          { href: '/editorial/audit', label: 'Auditoria editorial', icon: 'A' },
        ],
      }}
    >
      {children}
    </AppShell>
  );
}
