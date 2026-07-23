import {
  CatalogCard,
  CatalogPage,
} from '@/features/academic/components/catalog-page';
import { academicCatalog } from '@/features/academic/server/catalog';
export default async function AreasPage() {
  const items = await academicCatalog.areas();
  return (
    <CatalogPage
      title="Áreas"
      description="Explore os grandes campos da medicina que organizam os temas da sua preparação."
    >
      {items.map((item) => (
        <CatalogCard key={item.id} title={item.name} code={item.code}>
          <p>{item.description}</p>
          <p>
            Especialidades:{' '}
            {item.specialties.map((specialty) => specialty.name).join(', ') ||
              '—'}
          </p>
        </CatalogCard>
      ))}
    </CatalogPage>
  );
}
