import type {
  AreaCatalog,
  BoardCatalog,
  CatalogQuery,
  CompetencyCatalog,
  ExamCatalog,
  GuidelineCatalog,
  SpecialtyCatalog,
  ThemeCatalog,
} from '@iatron/contracts';
import type { ApiEnvironment } from './config/environment.js';
import { RepositoryError } from './student-repository.js';

type Row = Record<string, unknown>;

const object = (value: unknown): Row =>
  typeof value === 'object' && value !== null ? (value as Row) : {};
const rows = (value: unknown): Row[] =>
  Array.isArray(value) ? value.map(object) : [];
const text = (row: Row, key: string) => String(row[key] ?? '');
const nullableText = (row: Row, key: string) =>
  row[key] === null || row[key] === undefined ? null : String(row[key]);
const integer = (row: Row, key: string) => Number(row[key]);
const nullableInteger = (row: Row, key: string) =>
  row[key] === null || row[key] === undefined ? null : Number(row[key]);

export interface AcademicRepository {
  listSpecialties(query: CatalogQuery): Promise<SpecialtyCatalog[]>;
  listAreas(query: CatalogQuery): Promise<AreaCatalog[]>;
  listThemes(query: CatalogQuery): Promise<ThemeCatalog[]>;
  listCompetencies(query: CatalogQuery): Promise<CompetencyCatalog[]>;
  listBoards(query: CatalogQuery): Promise<BoardCatalog[]>;
  listExams(query: CatalogQuery): Promise<ExamCatalog[]>;
  listGuidelines(query: CatalogQuery): Promise<GuidelineCatalog[]>;
}

export function createAcademicRepository(
  environment: ApiEnvironment,
  accessToken: string,
): AcademicRepository {
  const list = async (
    table: string,
    select: string,
    query: CatalogQuery,
    searchColumns = ['name'],
    order = 'name',
  ) => {
    const url = new URL(`/rest/v1/${table}`, environment.SUPABASE_URL);
    url.searchParams.set('select', select);
    url.searchParams.set('order', `${order}.asc`);
    url.searchParams.set('limit', String(query.limit));
    url.searchParams.set('offset', String(query.offset));
    if (query.search) {
      const escaped = query.search.replaceAll('*', '').replaceAll(',', '');
      url.searchParams.set(
        'or',
        `(${searchColumns.map((column) => `${column}.ilike.*${escaped}*`).join(',')})`,
      );
    }
    const response = await fetch(url, {
      headers: {
        apikey: environment.SUPABASE_PUBLISHABLE_KEY,
        authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok)
      throw new RepositoryError(
        `Academic catalog request failed with ${response.status}`,
        'ACADEMIC_CATALOG_ERROR',
      );
    return rows(await response.json());
  };

  return {
    async listSpecialties(query) {
      const result = await list(
        'specialties',
        'id,code,name,description,specialty_areas(medical_areas(id,code,name)),program_specialties(exam_programs(id,name))',
        query,
        ['name', 'code'],
      );
      return result.map((row) => ({
        id: text(row, 'id'),
        code: text(row, 'code'),
        name: text(row, 'name'),
        description: nullableText(row, 'description'),
        areas: rows(row.specialty_areas).map((link) => {
          const area = object(link.medical_areas);
          return {
            id: text(area, 'id'),
            code: text(area, 'code'),
            name: text(area, 'name'),
          };
        }),
        programs: rows(row.program_specialties).map((link) => {
          const program = object(link.exam_programs);
          return { id: text(program, 'id'), name: text(program, 'name') };
        }),
      }));
    },
    async listAreas(query) {
      const result = await list(
        'medical_areas',
        'id,code,name,description,specialty_areas(specialties(id,code,name))',
        query,
        ['name', 'code'],
      );
      return result.map((row) => ({
        id: text(row, 'id'),
        code: text(row, 'code'),
        name: text(row, 'name'),
        description: nullableText(row, 'description'),
        specialties: rows(row.specialty_areas).map((link) => {
          const specialty = object(link.specialties);
          return {
            id: text(specialty, 'id'),
            code: text(specialty, 'code'),
            name: text(specialty, 'name'),
          };
        }),
      }));
    },
    async listThemes(query) {
      const result = await list(
        'themes',
        'id,code,name,description,medical_areas!inner(id,code,name),subthemes(id)',
        query,
        ['name', 'code'],
      );
      return result.map((row) => {
        const area = object(row.medical_areas);
        return {
          id: text(row, 'id'),
          code: text(row, 'code'),
          name: text(row, 'name'),
          description: nullableText(row, 'description'),
          area: {
            id: text(area, 'id'),
            code: text(area, 'code'),
            name: text(area, 'name'),
          },
          subthemeCount: rows(row.subthemes).length,
        };
      });
    },
    async listCompetencies(query) {
      const result = await list(
        'competencies',
        'id,code,name,description,subthemes!inner(id,code,name,themes!inner(id,code,name,medical_areas!inner(id,code,name))),competency_objectives(position,description)',
        query,
        ['name', 'code'],
      );
      return result.map((row) => {
        const subtheme = object(row.subthemes);
        const theme = object(subtheme.themes);
        const area = object(theme.medical_areas);
        return {
          id: text(row, 'id'),
          code: text(row, 'code'),
          name: text(row, 'name'),
          description: text(row, 'description'),
          subtheme: {
            id: text(subtheme, 'id'),
            code: text(subtheme, 'code'),
            name: text(subtheme, 'name'),
            theme: {
              id: text(theme, 'id'),
              code: text(theme, 'code'),
              name: text(theme, 'name'),
              area: {
                id: text(area, 'id'),
                code: text(area, 'code'),
                name: text(area, 'name'),
              },
            },
          },
          objectives: rows(row.competency_objectives)
            .map((objective) => ({
              position: integer(objective, 'position'),
              description: text(objective, 'description'),
            }))
            .sort((a, b) => a.position - b.position),
        };
      });
    },
    async listBoards(query) {
      return (await list('exam_boards', 'id,name,acronym', query)).map(
        (row) => ({
          id: text(row, 'id'),
          name: text(row, 'name'),
          acronym: nullableText(row, 'acronym'),
        }),
      );
    },
    async listExams(query) {
      const result = await list(
        'exam_editions',
        'id,year,edition,city,modality,duration_minutes,question_count,exam_programs!inner(id,name),exam_boards(id,name,acronym)',
        query,
        ['edition', 'city', 'modality'],
        'year',
      );
      return result.map((row) => {
        const program = object(row.exam_programs);
        const board = row.exam_boards ? object(row.exam_boards) : null;
        return {
          id: text(row, 'id'),
          year: integer(row, 'year'),
          edition: nullableText(row, 'edition'),
          city: nullableText(row, 'city'),
          modality: nullableText(row, 'modality'),
          durationMinutes: nullableInteger(row, 'duration_minutes'),
          questionCount: nullableInteger(row, 'question_count'),
          program: { id: text(program, 'id'), name: text(program, 'name') },
          board: board
            ? {
                id: text(board, 'id'),
                name: text(board, 'name'),
                acronym: nullableText(board, 'acronym'),
              }
            : null,
        };
      });
    },
    async listGuidelines(query) {
      const result = await list(
        'guidelines',
        'id,stable_key,title,version,issued_on,effective_from,effective_until,url,notes,status,guideline_issuers!inner(id,name,acronym)',
        query,
        ['title', 'stable_key', 'version'],
        'title',
      );
      return result.map((row) => {
        const issuer = object(row.guideline_issuers);
        return {
          id: text(row, 'id'),
          stableKey: text(row, 'stable_key'),
          title: text(row, 'title'),
          version: text(row, 'version'),
          issuedOn: nullableText(row, 'issued_on'),
          effectiveFrom: nullableText(row, 'effective_from'),
          effectiveUntil: nullableText(row, 'effective_until'),
          url: nullableText(row, 'url'),
          notes: nullableText(row, 'notes'),
          status: text(row, 'status'),
          issuer: {
            id: text(issuer, 'id'),
            name: text(issuer, 'name'),
            acronym: nullableText(issuer, 'acronym'),
          },
        };
      });
    },
  };
}
