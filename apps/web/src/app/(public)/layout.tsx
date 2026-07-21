import Link from 'next/link';
import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
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
