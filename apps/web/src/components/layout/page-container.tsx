import type { ReactNode } from 'react';

export function PageContainer({
  children,
  narrow = false,
}: {
  children: ReactNode;
  narrow?: boolean;
}) {
  return (
    <main className="page-container" data-narrow={narrow}>
      {children}
    </main>
  );
}
