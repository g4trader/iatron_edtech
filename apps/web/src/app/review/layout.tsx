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
      area="Mentoria médica"
      homeHref="/review"
      links={[
        { href: '/review/specialties', label: 'Especialidades' },
        { href: '/review/queue', label: 'Minha fila' },
        { href: '/review/active', label: 'Em revisão' },
        { href: '/review/history', label: 'Histórico' },
        { href: '/review/profile', label: 'Perfil' },
      ]}
      showStudentLink={false}
    >
      {children}
    </EditorialShell>
  );
}
