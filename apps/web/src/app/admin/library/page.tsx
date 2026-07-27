import { KnowledgeLibrary } from '@/features/editorial/components/knowledge-library';

export default function AdminLibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <KnowledgeLibrary
      basePath="/admin/library"
      scope="admin"
      searchParams={searchParams}
    />
  );
}
