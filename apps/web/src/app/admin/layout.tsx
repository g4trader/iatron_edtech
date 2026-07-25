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
  await requireEditorialRole(['admin']);
  return (
    <EditorialShell
      area="Console administrativo"
      homeHref="/admin"
      links={[{ href: '/admin', label: 'Visão geral' }]}
    >
      {children}
    </EditorialShell>
  );
}
