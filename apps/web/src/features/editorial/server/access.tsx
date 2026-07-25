import type { ReactNode } from 'react';
import type { AppRole } from '@iatron/contracts';
import { redirect } from 'next/navigation';
import { getAuthState } from '@/lib/auth';
import { editorial } from './editorial';

export async function requireEditorialRole(allowed: AppRole[]) {
  const { user, profile } = await getAuthState();
  if (!user) redirect('/login');
  const roles = await editorial.roles();
  if (!roles.some((role) => allowed.includes(role) || role === 'super_admin'))
    redirect('/app');
  return { user, profile, roles };
}

export function EditorialShell({
  area,
  links,
  children,
}: {
  area: string;
  links: { href: string; label: string }[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <strong>Iatron · {area}</strong>
          <nav
            aria-label={`Navegação de ${area}`}
            className="flex flex-wrap gap-4"
          >
            {links.map((link) => (
              <a
                className="font-semibold text-[var(--primary)]"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </a>
            ))}
            <a href="/app">Área do estudante</a>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
