import type { ReactNode } from 'react';
import { PublicHeader } from '@/features/landing/public-header';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-shell">
      <PublicHeader />
      {children}
    </div>
  );
}
