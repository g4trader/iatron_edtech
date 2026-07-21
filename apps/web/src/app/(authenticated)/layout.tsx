import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { redirect } from 'next/navigation';
import { getAuthState } from '@/lib/auth';

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile } = await getAuthState();
  if (!user) redirect('/login');
  return (
    <AppShell
      identity={{
        displayName: profile?.display_name ?? 'Estudante',
        email: user.email ?? '',
      }}
    >
      {children}
    </AppShell>
  );
}
