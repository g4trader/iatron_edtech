import { createClient } from '@/lib/supabase/server';

export async function loadExamCatalog() {
  const client = await createClient();
  const editionsResult = await client
    .from('exam_editions')
    .select('id,year,edition,city,exam_program_id')
    .eq('is_active', true)
    .order('year', { ascending: false });
  if (editionsResult.error) throw new Error('Catálogo indisponível.');
  const programIds = [
    ...new Set(
      (editionsResult.data ?? []).map((edition) => edition.exam_program_id),
    ),
  ];
  const { data: programs, error: programError } = await client
    .from('exam_programs')
    .select('id,name,code,state_code,city,institution_id')
    .in('id', programIds);
  if (programError) throw new Error('Catálogo indisponível.');
  const institutionIds = [
    ...new Set((programs ?? []).map((program) => program.institution_id)),
  ];
  const { data: institutions, error: institutionError } = await client
    .from('institutions')
    .select('id,name')
    .in('id', institutionIds);
  if (institutionError) throw new Error('Catálogo indisponível.');
  const institutionNames = new Map(
    (institutions ?? []).map((institution) => [
      institution.id,
      institution.name,
    ]),
  );
  const programDetails = new Map(
    (programs ?? []).map((program) => [program.id, program]),
  );
  return (editionsResult.data ?? [])
    .map((edition) => {
      const program = programDetails.get(edition.exam_program_id);
      return {
        id: edition.id,
        year: edition.year,
        edition: edition.edition,
        programName: program?.name ?? 'Programa de residência',
        programCode: program?.code ?? null,
        stateCode: program?.state_code ?? null,
        city: edition.city ?? program?.city ?? null,
        institutionName: program
          ? (institutionNames.get(program.institution_id) ?? program.name)
          : 'Instituição não informada',
      };
    })
    .sort(
      (a, b) =>
        Number(b.stateCode === 'RS') - Number(a.stateCode === 'RS') ||
        (a.stateCode ?? '').localeCompare(b.stateCode ?? '') ||
        a.programName.localeCompare(b.programName, 'pt-BR'),
    );
}
