'use client';

import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

export function ActionSubmitButton({
  children,
  pendingLabel,
  variant = 'primary',
  className = '',
  name,
  value,
}: {
  children: ReactNode;
  pendingLabel: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  const variantClass =
    variant === 'primary' ? 'primary-button' : 'secondary-button';

  return (
    <button
      aria-disabled={pending}
      className={`${variantClass} ${className}`.trim()}
      disabled={pending}
      name={name}
      type="submit"
      value={value}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
