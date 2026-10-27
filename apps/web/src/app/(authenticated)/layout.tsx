import { headers } from 'next/headers';
import type { Route } from 'next';
import { withReturnTo } from '@/lib/safe-return-to';
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
  if (!user)
    redirect(
      withReturnTo(
        '/login',
        (await headers()).get('x-iatron-return-to'),
      ) as Route,
    );
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
