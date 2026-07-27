import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { requireEditorialRole } from '@/features/editorial/server/access';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile } = await requireEditorialRole(['admin']);
  return (
    <AppShell
      identity={{
        displayName: profile?.display_name ?? 'Administrador',
        email: user.email ?? '',
      }}
      workspace={{
        homeHref: '/admin',
        label: 'Executive Console',
        roleLabel: 'Administrador',
        navigationItems: [
          { href: '/admin', label: 'Visão geral', icon: 'V' },
          { href: '/admin/students', label: 'Alunos', icon: 'A' },
          { href: '/admin/mentors', label: 'Mentores', icon: 'M' },
          { href: '/admin/users', label: 'Usuários e acessos', icon: 'U' },
          { href: '/admin/specialties', label: 'Operação', icon: 'O' },
          { href: '/admin/competencies', label: 'Competências', icon: 'C' },
          { href: '/admin/platform', label: 'Platform', icon: 'P' },
        ],
      }}
    >
      {children}
    </AppShell>
  );
}
