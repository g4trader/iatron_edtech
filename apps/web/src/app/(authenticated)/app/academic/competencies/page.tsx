import {
  CatalogCard,
  CatalogPage,
} from '@/features/academic/components/catalog-page';
import { academicCatalog } from '@/features/academic/server/catalog';
export default async function CompetenciesPage() {
  const items = await academicCatalog.competencies();
  return (
    <CatalogPage
      title="Competências"
      description="Menor unidade pedagógica e único nível futuro de medição de domínio."
    >
      {items.map((item) => (
        <CatalogCard key={item.id} title={item.name} code={item.code}>
          <p>{item.description}</p>
          <p>
            {item.subtheme.theme.area.name} → {item.subtheme.theme.name} →{' '}
            {item.subtheme.name}
          </p>
          {item.objectives.length > 0 && (
            <ol className="list-decimal pl-5">
              {item.objectives.map((objective) => (
                <li key={objective.position}>{objective.description}</li>
              ))}
            </ol>
          )}
        </CatalogCard>
      ))}
    </CatalogPage>
  );
}
