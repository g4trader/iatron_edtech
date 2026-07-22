import {
  CatalogCard,
  CatalogPage,
} from '@/features/academic/components/catalog-page';
import { academicCatalog } from '@/features/academic/server/catalog';
export default async function SpecialtiesPage() {
  const items = await academicCatalog.specialties();
  return (
    <CatalogPage
      title="Especialidades"
      description="Especialidades vinculadas a programas e às áreas que compartilham."
    >
      {items.map((item) => (
        <CatalogCard key={item.id} title={item.name} code={item.code}>
          <p>{item.description}</p>
          <p>Áreas: {item.areas.map((area) => area.name).join(', ') || '—'}</p>
          <p>
            Programas:{' '}
            {item.programs.map((program) => program.name).join(', ') || '—'}
          </p>
        </CatalogCard>
      ))}
    </CatalogPage>
  );
}
