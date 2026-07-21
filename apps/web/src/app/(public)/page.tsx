import { Button } from '@iatron/ui';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto grid min-h-[75vh] max-w-6xl place-items-center px-6 py-16">
      <section className="max-w-3xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
          Residência médica
        </p>
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
          Estude com um plano que evolui com você.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Diagnóstico, prática e revisão em uma experiência conversacional
          centrada nos seus gaps de aprendizagem.
        </p>
        <Link href="/login">
          <Button className="mt-8">Começar preparação</Button>
        </Link>
      </section>
    </main>
  );
}
