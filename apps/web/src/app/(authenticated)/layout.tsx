import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { redirect } from 'next/navigation';
import { getAuthState } from '@/lib/auth';
import { isAuthBypassEnabled } from '@/lib/auth-bypass';
import { listTutorConversations } from '@/features/tutor/server/tutor';

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile } = await getAuthState();
  if (!user) redirect('/login');
  let recentConversations: { id: string; title: string }[] = [];
  if (!isAuthBypassEnabled(process.env)) {
    try {
      recentConversations = (await listTutorConversations())
        .slice(0, 3)
        .map(({ id, title }) => ({ id, title }));
    } catch {
      // A navegação principal permanece disponível se o Tutor estiver indisponível.
    }
  }
  return (
    <AppShell
      identity={{
        displayName: profile?.display_name ?? 'Estudante',
        email: user.email ?? '',
      }}
      recentConversations={recentConversations}
    >
      {children}
    </AppShell>
  );
}
