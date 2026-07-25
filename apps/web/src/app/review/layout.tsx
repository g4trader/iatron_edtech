import type { ReactNode } from 'react';
import {
  EditorialShell,
  requireEditorialRole,
} from '@/features/editorial/server/access';

export default async function ReviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireEditorialRole(['mentor']);
  return (
    <EditorialShell
      area="Central de Revisão"
      homeHref="/review"
      links={[
        { href: '/review', label: 'Fila' },
        { href: '/review/history', label: 'Histórico' },
      ]}
    >
      {children}
    </EditorialShell>
  );
}
