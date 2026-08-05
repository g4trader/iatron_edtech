import Link from 'next/link';
import { editorial } from '@/features/editorial/server/editorial';
import { contentDisplayTitle } from '@/features/editorial/presentation';

export default async function ActiveReviewPage() {
  const active = (await editorial.reviewQueue()).filter(
    ({ editorialStatus }) => editorialStatus === 'awaiting_mentor_review',
  );
  return (
    <main className="experience-page mx-auto w-full max-w-5xl space-y-5 px-4 py-8 sm:p-8">
      <header>
        <p className="text-sm text-[var(--foreground-muted)]">Em revisão</p>
        <h1>Conteúdos atribuídos a você</h1>
        <p>
          Retome qualquer conteúdo sem perder o contexto da versão recebida.
        </p>
      </header>
      {active.length ? (
        <ul className="space-y-3">
          {active.map((item) => (
            <li className="state-card" key={item.id}>
              <h2>{contentDisplayTitle(item.title)}</h2>
              <p>Versão {item.versionNumber}</p>
              <Link
                className="primary-button inline-flex"
                href={`/review/${item.id}`}
              >
                Continuar revisão
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <section className="state-card">
          <h2>Nenhuma revisão em andamento</h2>
          <p>
            Escolha o próximo conteúdo na sua fila quando estiver disponível.
          </p>
          <Link href="/review/queue">Ir para minha fila</Link>
        </section>
      )}
    </main>
  );
}
