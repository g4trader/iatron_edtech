'use client';
import Link from 'next/link';
import { emitAcquisitionEvent, type DiagnosticCtaLocation } from './events';
import { DIAGNOSTIC_ENTRY_PATH } from './routes';

export function DiagnosticCTA({
  location,
  className,
  onNavigate,
  arrow = true,
}: {
  location: DiagnosticCtaLocation;
  className?: string;
  onNavigate?: () => void;
  arrow?: boolean;
}) {
  return (
    <Link
      href={DIAGNOSTIC_ENTRY_PATH}
      className={className}
      data-diagnostic-cta={location}
      onClick={() => {
        emitAcquisitionEvent({
          name: 'diagnostic_cta_click',
          cta_location: location,
          user_auth_state: 'unknown',
        });
        onNavigate?.();
      }}
    >
      Iniciar meu diagnóstico{arrow && <span aria-hidden="true">↗</span>}
    </Link>
  );
}
