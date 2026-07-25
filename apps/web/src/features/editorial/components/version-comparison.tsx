import type { LearningContentVersion } from '@iatron/contracts';

type DiffPart = { kind: 'same' | 'added' | 'removed'; value: string };

export function diffWords(before: string, after: string): DiffPart[] {
  const left = before.split(/(\s+)/).filter(Boolean);
  const right = after.split(/(\s+)/).filter(Boolean);
  const matrix = Array.from({ length: left.length + 1 }, () =>
    Array<number>(right.length + 1).fill(0),
  );
  for (let i = left.length - 1; i >= 0; i -= 1)
    for (let j = right.length - 1; j >= 0; j -= 1)
      matrix[i]![j] =
        left[i] === right[j]
          ? matrix[i + 1]![j + 1]! + 1
          : Math.max(matrix[i + 1]![j]!, matrix[i]![j + 1]!);

  const result: DiffPart[] = [];
  let i = 0;
  let j = 0;
  while (i < left.length || j < right.length) {
    if (i < left.length && j < right.length && left[i] === right[j]) {
      result.push({ kind: 'same', value: left[i]! });
      i += 1;
      j += 1;
    } else if (
      j < right.length &&
      (i === left.length || matrix[i]![j + 1]! >= matrix[i + 1]![j]!)
    ) {
      result.push({ kind: 'added', value: right[j]! });
      j += 1;
    } else {
      result.push({ kind: 'removed', value: left[i]! });
      i += 1;
    }
  }
  return result;
}

function TextDiff({ before, after }: { before: string; after: string }) {
  return (
    <p className="leading-7">
      {diffWords(before, after).map((part, index) => (
        <span
          className={
            part.kind === 'added'
              ? 'rounded bg-emerald-100 text-emerald-950'
              : part.kind === 'removed'
                ? 'rounded bg-red-100 text-red-950 line-through'
                : undefined
          }
          key={`${part.kind}-${index}`}
        >
          {part.value}
        </span>
      ))}
    </p>
  );
}

function ListDiff({
  title,
  before,
  after,
}: {
  title: string;
  before: string[];
  after: string[];
}) {
  const removed = before.filter((item) => !after.includes(item));
  const added = after.filter((item) => !before.includes(item));
  if (!removed.length && !added.length) return null;
  return (
    <section className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <ul className="space-y-1">
        {removed.map((item) => (
          <li className="rounded bg-red-100 px-2 py-1 text-red-950" key={item}>
            <span className="sr-only">Removido: </span>
            <span aria-hidden="true">− </span>
            {item}
          </li>
        ))}
        {added.map((item) => (
          <li
            className="rounded bg-emerald-100 px-2 py-1 text-emerald-950"
            key={item}
          >
            <span className="sr-only">Adicionado: </span>
            <span aria-hidden="true">+ </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function VersionComparison({
  current,
  previous,
}: {
  current: LearningContentVersion;
  previous: LearningContentVersion | null;
}) {
  if (!previous)
    return (
      <section className="state-card" aria-labelledby="comparison-title">
        <h2 id="comparison-title">O que mudou</h2>
        <p>
          <strong>Primeira versão publicada.</strong> Não há uma versão anterior
          para comparar.
        </p>
      </section>
    );

  const previousSections = previous.sections.map(
    ({ heading, body }) => `${heading}\n${body}`,
  );
  const currentSections = current.sections.map(
    ({ heading, body }) => `${heading}\n${body}`,
  );
  return (
    <section
      className="state-card space-y-5 overflow-hidden"
      aria-labelledby="comparison-title"
    >
      <header>
        <h2 id="comparison-title">
          Mudanças da versão {previous.versionNumber} para a{' '}
          {current.versionNumber}
        </h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          Verde indica adição. Vermelho tachado indica remoção.
        </p>
      </header>
      <section className="space-y-2">
        <h3 className="font-semibold">Título</h3>
        <TextDiff before={previous.title} after={current.title} />
      </section>
      <section className="space-y-2">
        <h3 className="font-semibold">Resumo</h3>
        <TextDiff before={previous.summary} after={current.summary} />
      </section>
      <ListDiff
        after={current.objectives}
        before={previous.objectives}
        title="Objetivos"
      />
      <ListDiff
        after={currentSections}
        before={previousSections}
        title="Estrutura e conteúdo"
      />
      <ListDiff
        after={current.references.map(({ title }) => title)}
        before={previous.references.map(({ title }) => title)}
        title="Referências"
      />
    </section>
  );
}
