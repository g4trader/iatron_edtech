import type { ReactNode } from 'react';
import {
  EditorialShell,
  requireEditorialRole,
} from '@/features/editorial/server/access';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile } = await requireEditorialRole(['admin']);
  return (
    <EditorialShell
      area="Executive Console"
      homeHref="/admin"
      identity={{
        displayName: profile?.display_name ?? 'Administrador',
        email: user.email ?? '',
      }}
      links={[
        { href: '/admin', label: 'Visão geral' },
        { href: '/admin/students', label: 'Alunos' },
        { href: '/admin/mentors', label: 'Mentores' },
        { href: '/admin/specialties', label: 'Áreas médicas' },
        { href: '/admin/library', label: 'Biblioteca médica' },
        { href: '/admin/users', label: 'Acessos' },
        { href: '/admin/platform', label: 'Platform' },
      ]}
      showStudentLink={false}
    >
      {children}
    </EditorialShell>
  );
}
