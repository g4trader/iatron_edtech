import { Button } from '@iatron/ui';

export function ChatShell() {
  return (
    <main className="mx-auto flex h-[calc(100vh-57px)] max-w-4xl flex-col px-4 py-6">
      <section className="flex flex-1 items-center justify-center text-center">
        <div>
          <p className="text-sm font-semibold text-teal-700">Sua preparação</p>
          <h1 className="mt-2 text-3xl font-bold">Como vamos estudar hoje?</h1>
          <p className="mt-3 text-slate-600">
            O fluxo conversacional será conectado à API em uma próxima fase.
          </p>
        </div>
      </section>
      <form className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <label className="sr-only" htmlFor="message">
          Mensagem
        </label>
        <input
          id="message"
          className="min-w-0 flex-1 px-3 outline-none"
          placeholder="Digite sua dúvida ou objetivo de estudo"
          disabled
        />
        <Button type="submit" disabled>
          Enviar
        </Button>
      </form>
    </main>
  );
}
