import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { requireEditorialRole } from '@/features/editorial/server/access';

export default async function ReviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile } = await requireEditorialRole(['mentor']);
  return (
    <AppShell
      identity={{
        displayName: profile?.display_name ?? 'Mentor',
        email: user.email ?? '',
      }}
      workspace={{
        homeHref: '/review',
        label: 'Mentoria médica',
        roleLabel: 'Mentor',
        navigationItems: [
          { href: '/review', label: 'Visão da área', icon: 'V' },
          { href: '/review/queue', label: 'Minha fila', icon: 'F' },
          { href: '/review/active', label: 'Em revisão', icon: 'R' },
          { href: '/review/history', label: 'Histórico', icon: 'H' },
          { href: '/review/profile', label: 'Perfil', icon: 'P' },
        ],
      }}
    >
      {children}
    </AppShell>
  );
}
