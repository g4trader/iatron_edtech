import { editorial } from '@/features/editorial/server/editorial';

export default async function ReviewHistoryPage() {
  const contents = await editorial.reviewQueue();
  return (
    <main className="experience-page mx-auto w-full max-w-5xl space-y-5 px-4 py-8 sm:p-8">
      <h1 className="text-3xl font-semibold">Histórico de revisões</h1>
      <p>Versões aprovadas ou devolvidas permanecem rastreáveis.</p>
      <ul className="space-y-3">
        {contents.map((item) => (
          <li className="state-card" key={item.id}>
            {item.title} · versão {item.versionNumber} · {item.editorialStatus}
          </li>
        ))}
      </ul>
    </main>
  );
}
