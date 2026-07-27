import { KnowledgeLibrary } from '@/features/editorial/components/knowledge-library';

export default function EditorialLibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <KnowledgeLibrary
      basePath="/editorial/library"
      scope="editorial"
      searchParams={searchParams}
    />
  );
}
