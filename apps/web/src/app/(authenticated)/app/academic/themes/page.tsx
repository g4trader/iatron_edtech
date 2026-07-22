import {
  CatalogCard,
  CatalogPage,
} from '@/features/academic/components/catalog-page';
import { academicCatalog } from '@/features/academic/server/catalog';
export default async function ThemesPage() {
  const items = await academicCatalog.themes();
  return (
    <CatalogPage
      title="Temas"
      description="Temas pertencem a uma área e agrupam subtemas clínicos."
    >
      {items.map((item) => (
        <CatalogCard key={item.id} title={item.name} code={item.code}>
          <p>{item.description}</p>
          <p>Área: {item.area.name}</p>
          <p>Subtemas: {item.subthemeCount}</p>
        </CatalogCard>
      ))}
    </CatalogPage>
  );
}
