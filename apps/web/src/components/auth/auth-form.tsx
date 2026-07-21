import type { ReactNode } from 'react';

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
    <main className="mx-auto flex min-h-[75vh] max-w-md items-center px-6">
      <section className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        {message && (
          <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
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
        <form action={action} className="mt-6 grid gap-4">
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
    <label className="grid gap-1 text-sm font-medium text-slate-800">
      {label}
      <input
        required
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-teal-600"
      />
    </label>
  );
}
export function Submit({ children }: { children: ReactNode }) {
  return (
    <button className="rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800">
      {children}
    </button>
  );
}
