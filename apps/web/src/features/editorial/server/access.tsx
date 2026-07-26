import type { ReactNode } from 'react';
import type { AppRole } from '@iatron/contracts';
import { redirect } from 'next/navigation';
import { getAuthState } from '@/lib/auth';
import { editorial } from './editorial';
import { logout } from '@/app/(public)/auth/actions';

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
  homeHref,
  links,
  showStudentLink = true,
  identity,
  children,
}: {
  area: string;
  homeHref: string;
  links: { href: string; label: string }[];
  showStudentLink?: boolean;
  identity?: { displayName: string; email: string };
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <strong>Iatron · {area}</strong>
            <nav
              aria-label="Breadcrumb"
              className="text-sm text-[var(--foreground-muted)]"
            >
              <a href={homeHref}>Início</a> <span aria-hidden="true">/</span>{' '}
              <span aria-current="page">{area}</span>
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-4">
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
              {showStudentLink && <a href="/app">Área do estudante</a>}
            </nav>
            {identity && (
              <div className="flex items-center gap-3 border-l border-[var(--border)] pl-4">
                <span aria-hidden="true" className="avatar">
                  {identity.displayName
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')
                    .toUpperCase()}
                </span>
                <span className="hidden sm:block">
                  <strong className="block">{identity.displayName}</strong>
                  <small>{identity.email}</small>
                </span>
                <form action={logout}>
                  <button className="secondary-button" type="submit">
                    Sair
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
