import Link from 'next/link';
import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-shell">
      <header className="public-header">
        <Link className="text-xl font-bold tracking-tight" href="/">
          Iatron
        </Link>
        <Link
          className="rounded-lg px-4 py-2 font-medium hover:bg-teal-50"
          href="/login"
        >
          Entrar
        </Link>
      </header>
      {children}
    </div>
  );
}
