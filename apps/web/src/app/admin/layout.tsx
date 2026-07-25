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
  await requireEditorialRole(['editor', 'admin']);
  return (
    <EditorialShell
      area="Operação editorial"
      links={[
        { href: '/admin', label: 'Visão geral' },
        { href: '/admin/content', label: 'Conteúdos' },
        { href: '/admin/audit', label: 'Auditoria' },
      ]}
    >
      {children}
    </EditorialShell>
  );
}
