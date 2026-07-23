'use client';

import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

export function ActionSubmitButton({
  children,
  pendingLabel,
  variant = 'primary',
  className = '',
}: {
  children: ReactNode;
  pendingLabel: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}) {
  const { pending } = useFormStatus();
  const variantClass =
    variant === 'primary' ? 'primary-button' : 'secondary-button';

  return (
    <button
      aria-disabled={pending}
      className={`${variantClass} ${className}`.trim()}
      disabled={pending}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
