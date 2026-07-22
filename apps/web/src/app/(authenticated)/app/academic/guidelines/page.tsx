import {
  CatalogCard,
  CatalogPage,
} from '@/features/academic/components/catalog-page';
import { academicCatalog } from '@/features/academic/server/catalog';
export default async function GuidelinesPage() {
  const items = await academicCatalog.guidelines();
  return (
    <CatalogPage
      title="Guidelines"
      description="Fontes versionadas com órgão emissor, vigência e rastreabilidade."
    >
      {items.map((item) => (
        <CatalogCard
          key={item.id}
          title={item.title}
          code={`${item.issuer.acronym ?? item.issuer.name} · ${item.version}`}
        >
          <p>
            Publicação: {item.issuedOn ?? '—'} · Vigência:{' '}
            {item.effectiveFrom ?? '—'} a {item.effectiveUntil ?? 'vigente'}
          </p>
          <p>{item.notes}</p>
          {item.url && (
            <a
              className="text-teal-700 underline"
              href={item.url}
              rel="noreferrer"
              target="_blank"
            >
              Abrir fonte
            </a>
          )}
        </CatalogCard>
      ))}
    </CatalogPage>
  );
}
