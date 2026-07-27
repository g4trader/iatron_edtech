import { KnowledgeLibrary } from '@/features/editorial/components/knowledge-library';

export default function MentorLibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <KnowledgeLibrary
      basePath="/review/library"
      scope="review"
      searchParams={searchParams}
    />
  );
}
