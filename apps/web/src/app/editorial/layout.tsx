import type { ReactNode } from 'react';
import {
  EditorialShell,
  requireEditorialRole,
} from '@/features/editorial/server/access';

export default async function EditorialLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireEditorialRole(['editor', 'admin']);
  return (
    <EditorialShell
      area="Workspace Editorial"
      homeHref="/editorial"
      links={[
        { href: '/editorial', label: 'Workflow' },
        { href: '/editorial/library', label: 'Biblioteca' },
        { href: '/editorial/content', label: 'Novo conteúdo' },
        { href: '/editorial/specialties', label: 'Responsabilidades' },
        { href: '/editorial/audit', label: 'Auditoria editorial' },
      ]}
    >
      {children}
    </EditorialShell>
  );
}
