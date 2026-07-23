import type { ReactNode } from 'react';
import { AuthSubmitButton } from './submit-button';

export function AuthForm({
  title,
  description,
  action,
  children,
  message,
  error,
}: {
  title: string;
  description: string;
  action: (data: FormData) => void | Promise<void>;
  children: ReactNode;
  message?: string;
  error?: string;
}) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        {message && (
          <p
            aria-live="polite"
            role="status"
            className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"
          >
            {message}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        <form action={action} className="auth-fields">
          {children}
        </form>
      </section>
    </main>
  );
}
export function Field({
  label,
  name,
  type = 'text',
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="form-field">
      {label}
      <input
        required
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="form-control"
      />
    </label>
  );
}
export function Submit({ children }: { children: ReactNode }) {
  return <AuthSubmitButton>{children}</AuthSubmitButton>;
}
