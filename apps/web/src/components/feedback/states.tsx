import type { ReactNode } from 'react';

export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div aria-live="polite" className="state-card">
      {label}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="state-card">
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </section>
  );
}
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <section aria-live="assertive" className="state-card error-state">
      <h2>Algo não saiu como esperado</h2>
      <p>{message}</p>
      {onRetry && <RetryAction onRetry={onRetry} />}
    </section>
  );
}
export function RetryAction({ onRetry }: { onRetry: () => void }) {
  return (
    <button className="secondary-button" onClick={onRetry} type="button">
      Tentar novamente
    </button>
  );
}
export function OfflineNotice() {
  return (
    <div aria-live="polite" className="notice warning-notice">
      Você está offline. Seu rascunho continua salvo neste dispositivo.
    </div>
  );
}
export function UsageLimitNotice() {
  return (
    <div className="notice">
      Limite demonstrativo atingido. Nenhum consumo real ocorreu.
    </div>
  );
}
export function SkeletonMessage() {
  return (
    <div aria-label="Carregando mensagem" className="skeleton-message">
      <span />
      <span />
      <span />
    </div>
  );
}
