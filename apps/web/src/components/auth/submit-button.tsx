'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

export function AuthSubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      aria-disabled={pending}
      className="primary-button auth-submit"
      disabled={pending}
    >
      {pending ? 'Só um instante…' : children}
    </button>
  );
}
