import { Button } from '@iatron/ui';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col px-6 py-16">
      <h1 className="text-3xl font-bold">Acesse sua conta</h1>
      <p className="mt-2 text-slate-600">
        A autenticação com Supabase será conectada na próxima fase.
      </p>
      <form className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">E-mail</span>
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-teal-700 focus:outline-none"
            type="email"
            autoComplete="email"
            required
          />
        </label>
        <Link className="block" href="/app">
          <Button className="w-full" type="button">
            Entrar na demonstração
          </Button>
        </Link>
      </form>
    </main>
  );
}
