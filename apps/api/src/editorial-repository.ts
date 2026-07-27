import {
  competencyWorkspaceSchema,
  medicalSpecialtyDashboardSchema,
  medicalSpecialtySummarySchema,
  learningContentVersionSchema,
  type AppRole,
  type CompetencyWorkspace,
  type LearningContentVersion,
  type KnowledgeLibraryItem,
  type KnowledgeLibraryOverview,
  type KnowledgeLibraryPage,
  type KnowledgeLibraryQuery,
  type ResolveKnowledgeDuplicateInput,
  type MedicalSpecialtyDashboard,
  type MedicalSpecialtyOwnershipHistory,
  type MedicalSpecialtySummary,
  type MentorReviewHistory,
} from '@iatron/contracts';
import type { ApiEnvironment } from './config/environment.js';
import { RepositoryError } from './student-repository.js';
import type { ReviewAssignmentEmail } from './editorial-email.js';

type Row = Record<string, unknown>;
const object = (value: unknown): Row =>
  typeof value === 'object' && value !== null ? (value as Row) : {};
const rows = (value: unknown): Row[] =>
  Array.isArray(value) ? value.map(object) : [];
const text = (row: Row, key: string) => String(row[key] ?? '');
const nullableText = (row: Row, key: string) =>
  row[key] === null || row[key] === undefined ? null : String(row[key]);
const number = (row: Row, key: string) => Number(row[key] ?? 0);
const boolean = (row: Row, key: string) => Boolean(row[key]);

export interface EditorialRepository {
  roles(): Promise<AppRole[]>;
  list(
    scope: 'student' | 'review' | 'admin',
  ): Promise<LearningContentVersion[]>;
  get(versionId: string): Promise<LearningContentVersion | null>;
  previousVersion(
    contentId: string,
    versionNumber: number,
  ): Promise<LearningContentVersion | null>;
  reviewHistory(page: number, pageSize: number): Promise<MentorReviewHistory>;
  specialties(mentorId: string): Promise<MedicalSpecialtySummary[]>;
  specialty(
    mentorId: string,
    specialtyId: string,
  ): Promise<MedicalSpecialtyDashboard | null>;
  competency(
    mentorId: string | null,
    competencyId: string,
  ): Promise<CompetencyWorkspace | null>;
  managedSpecialties(): Promise<MedicalSpecialtyDashboard[]>;
  ownershipHistory(
    specialtyId: string,
  ): Promise<MedicalSpecialtyOwnershipHistory[]>;
  assignSpecialtyOwner(
    specialtyId: string,
    input: {
      mentorId: string;
      ownerRole: 'primary' | 'co_owner';
      authorizationReference: string;
      requestId: string;
    },
  ): Promise<string>;
  setSpecialtyOwnerStatus(
    ownershipId: string,
    input: {
      status:
        | 'active'
        | 'temporarily_unavailable'
        | 'inactive'
        | 'pending_assignment';
      reason: string;
      unavailableUntil: string | null;
      requestId: string;
    },
  ): Promise<string>;
  libraryOverview(mentorId: string | null): Promise<KnowledgeLibraryOverview>;
  library(
    query: KnowledgeLibraryQuery,
    mentorId: string | null,
  ): Promise<KnowledgeLibraryPage>;
  resolveDuplicate(input: ResolveKnowledgeDuplicateInput): Promise<string>;
  createDraft(input: Record<string, unknown>): Promise<string>;
  createVersion(input: {
    contentId: string;
    sourceVersionId: string;
    title: string;
    summary: string;
    sections: unknown[];
    requestId: string;
  }): Promise<string>;
  submit(
    versionId: string,
    mentorId: string,
    requestId: string,
  ): Promise<string>;
  review(versionId: string, input: Record<string, unknown>): Promise<string>;
  publish(versionId: string, requestId: string): Promise<string>;
  requestPriority(versionId: string, requestId: string): Promise<string>;
  audit(contentId: string): Promise<Row[]>;
  notifications(): Promise<Row[]>;
  emailEvents(contentId: string): Promise<Row[]>;
  reviewAssignmentEmail(versionId: string): Promise<ReviewAssignmentEmail>;
  recordEmailEvent(
    idempotencyKey: string,
    eventType: 'sent' | 'failed',
    providerId: string | null,
    errorCode: string | null,
  ): Promise<string>;
}

export function createEditorialRepository(
  environment: ApiEnvironment,
  token: string,
): EditorialRepository {
  const headers = {
    apikey: environment.SUPABASE_PUBLISHABLE_KEY,
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  };
  const request = async (path: string, init?: RequestInit) => {
    const response = await fetch(
      new URL(`/rest/v1/${path}`, environment.SUPABASE_URL),
      { ...init, headers: { ...headers, ...init?.headers } },
    );
    const body = await response.text();
    if (!response.ok)
      throw new RepositoryError(
        `Editorial repository failed with ${response.status}`,
        'EDITORIAL_REPOSITORY_ERROR',
      );
    return body ? (JSON.parse(body) as unknown) : null;
  };
  const get = (path: string) => request(path);
  const rpc = (name: string, body: object) =>
    request(`rpc/${name}`, { method: 'POST', body: JSON.stringify(body) });
  const select =
    'id,content_id,version_number,schema_version,language,title,subtitle,estimated_minutes,objectives,summary,sections,key_points,clinical_reasoning,exam_application,common_mistakes,quick_review,conclusion,video,editorial_status,ai_assisted,ai_model,prompt_version,is_synthetic,content_hash,published_at,reviewed_at,provenance,author:profiles!learning_content_versions_author_id_fkey(display_name),learning_contents!learning_content_versions_content_id_fkey!inner(canonical_key,slug,specialty_id,competency_id,assigned_mentor_id,content_specialty:specialties!learning_contents_specialty_id_fkey(name),content_theme:themes!learning_contents_theme_id_fkey(name),content_competency:competencies!learning_contents_competency_id_fkey(name),mentor_profiles(professional_name,specialties(name))),content_reviews(id,decision),learning_content_version_references(is_required,content_references(*)),content_review_requests(id,active)';

  const serialize = (row: Row): LearningContentVersion => {
    const content = object(row.learning_contents);
    const mentor = object(content.mentor_profiles);
    const specialty = object(mentor.specialties);
    const author = object(row.author);
    const review = rows(row.content_reviews)
      .filter((item) => text(item, 'decision') === 'approved')
      .at(-1);
    const requests = rows(row.content_review_requests).filter((item) =>
      boolean(item, 'active'),
    );
    return learningContentVersionSchema.parse({
      id: text(row, 'id'),
      contentId: text(row, 'content_id'),
      canonicalKey: text(content, 'canonical_key'),
      slug: text(content, 'slug'),
      versionNumber: number(row, 'version_number'),
      schemaVersion: number(row, 'schema_version'),
      language: text(row, 'language'),
      title: text(row, 'title'),
      subtitle: nullableText(row, 'subtitle'),
      estimatedMinutes: number(row, 'estimated_minutes'),
      objectives: rowsOrStrings(row.objectives),
      summary: text(row, 'summary'),
      sections: rows(row.sections).map((section) => ({
        heading: text(section, 'heading'),
        body: text(section, 'body'),
      })),
      keyPoints: rowsOrStrings(row.key_points),
      clinicalReasoning: nullableText(row, 'clinical_reasoning'),
      examApplication: nullableText(row, 'exam_application'),
      commonMistakes: rowsOrStrings(row.common_mistakes),
      quickReview: rowsOrStrings(row.quick_review),
      conclusion: nullableText(row, 'conclusion'),
      video: row.video ?? null,
      editorialStatus: text(row, 'editorial_status'),
      aiAssisted: boolean(row, 'ai_assisted'),
      aiModel: nullableText(row, 'ai_model'),
      promptVersion: nullableText(row, 'prompt_version'),
      isSynthetic: boolean(row, 'is_synthetic'),
      contentHash: text(row, 'content_hash'),
      publishedAt: nullableText(row, 'published_at'),
      reviewedAt: nullableText(row, 'reviewed_at'),
      specialtyId: nullableText(content, 'specialty_id'),
      competencyId: nullableText(content, 'competency_id'),
      assignedMentorId: nullableText(content, 'assigned_mentor_id'),
      mentorName: nullableText(mentor, 'professional_name'),
      mentorSpecialty: nullableText(specialty, 'name'),
      specialtyName: nullableText(object(content.content_specialty), 'name'),
      themeName: nullableText(object(content.content_theme), 'name'),
      competencyName: nullableText(object(content.content_competency), 'name'),
      editorName: nullableText(author, 'display_name'),
      provenance: object(row.provenance),
      reviewId: review ? text(review, 'id') : null,
      reviewDecision: review ? text(review, 'decision') : null,
      reviewRequested: requests.length > 0,
      requestCount: requests.length,
      references: rows(row.learning_content_version_references).map((link) => {
        const reference = object(link.content_references);
        return {
          id: text(reference, 'id'),
          title: text(reference, 'title'),
          authorsOrOrganization: nullableText(
            reference,
            'authors_or_organization',
          ),
          referenceType: text(reference, 'reference_type'),
          publicationYear:
            reference.publication_year == null
              ? null
              : number(reference, 'publication_year'),
          edition: nullableText(reference, 'edition'),
          publisher: nullableText(reference, 'publisher'),
          isbn: nullableText(reference, 'isbn'),
          doi: nullableText(reference, 'doi'),
          pmid: nullableText(reference, 'pmid'),
          url: nullableText(reference, 'url'),
          accessedOn: nullableText(reference, 'accessed_on'),
          origin: text(reference, 'origin'),
          verificationStatus: text(reference, 'verification_status'),
          notes: nullableText(reference, 'notes'),
          required: boolean(link, 'is_required'),
        };
      }),
    });
  };

  const specialtyDashboards = async (
    mentorId: string | null,
    requestedSpecialtyId?: string,
  ): Promise<MedicalSpecialtyDashboard[]> => {
    const specialtyIds = mentorId
      ? rows(
          await get(
            `medical_specialty_owners?select=specialty_id&mentor_id=eq.${encodeURIComponent(mentorId)}&status=in.(active,temporarily_unavailable)&ends_at=is.null${requestedSpecialtyId ? `&specialty_id=eq.${encodeURIComponent(requestedSpecialtyId)}` : ''}`,
          ),
        ).map((row) => text(row, 'specialty_id'))
      : rows(
          await get(
            `specialties?select=id${requestedSpecialtyId ? `&id=eq.${encodeURIComponent(requestedSpecialtyId)}` : ''}`,
          ),
        ).map((row) => text(row, 'id'));
    if (!specialtyIds.length) return [];
    const inIds = `in.(${specialtyIds.join(',')})`;
    const [
      specialtyRows,
      ownerRows,
      areaRows,
      contentRows,
      questionRows,
      competencyRows,
      referenceRows,
      blueprintRows,
    ] = await Promise.all([
      get(
        `specialties?select=id,code,name,description&id=${inIds}&order=name.asc`,
      ),
      get(
        `medical_specialty_owners?select=id,specialty_id,mentor_id,owner_role,status,scope,reason,starts_at,ends_at,unavailable_until,mentor_profiles(professional_name)&specialty_id=${inIds}&status=in.(active,temporarily_unavailable)&ends_at=is.null&order=owner_role.asc`,
      ),
      get(
        `specialty_areas?select=specialty_id,medical_areas(name)&specialty_id=${inIds}`,
      ),
      get(
        `learning_contents?select=id,specialty_id,competency_id,updated_at,learning_content_versions!learning_content_versions_content_id_fkey(id,title,editorial_status,video,created_at,reviewed_at),content_reviews(id,decision,created_at,mentor_profiles(professional_name))&specialty_id=${inIds}`,
      ),
      get(
        `question_version_specialties?select=specialty_id,question_version_id,question_versions(id,status,difficulty,created_at,question_version_competencies(competency_id))&specialty_id=${inIds}`,
      ),
      get(
        `competency_specialties?select=specialty_id,competency_id,competencies(id,name)&specialty_id=${inIds}`,
      ),
      get(
        `content_reference_specialties?select=specialty_id,content_references(title,verification_status)&specialty_id=${inIds}`,
      ),
      get(
        `exam_blueprint_areas?select=specialty_id,exam_blueprints(version)&specialty_id=${inIds}`,
      ),
    ]);

    return rows(specialtyRows).map((specialtyRow) => {
      const specialtyId = text(specialtyRow, 'id');
      const ownedContents = rows(contentRows).filter(
        (row) => text(row, 'specialty_id') === specialtyId,
      );
      const versions = ownedContents.flatMap((row) =>
        rows(row.learning_content_versions),
      );
      const reviews = ownedContents
        .flatMap((row) =>
          rows(row.content_reviews).map((review) => ({
            review,
            title:
              rows(row.learning_content_versions)
                .sort(
                  (left, right) =>
                    Date.parse(text(right, 'created_at')) -
                    Date.parse(text(left, 'created_at')),
                )
                .at(0)?.title ?? 'Conteúdo da especialidade',
          })),
        )
        .sort(
          (left, right) =>
            Date.parse(text(right.review, 'created_at')) -
            Date.parse(text(left.review, 'created_at')),
        );
      const references = rows(referenceRows).filter(
        (row) => text(row, 'specialty_id') === specialtyId,
      );
      const specialtyQuestions = rows(questionRows).filter(
        (row) => text(row, 'specialty_id') === specialtyId,
      );
      const specialtyCompetencies = rows(competencyRows).filter(
        (row) => text(row, 'specialty_id') === specialtyId,
      );
      const activeOwners = rows(ownerRows).filter(
        (row) => text(row, 'specialty_id') === specialtyId,
      );
      const blueprints = rows(blueprintRows).filter(
        (row) => text(row, 'specialty_id') === specialtyId,
      );
      const statusCounts = new Map<string, number>();
      for (const version of versions) {
        const status = text(version, 'editorial_status');
        statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
      }
      const lastUpdate = [
        ...ownedContents.map((row) => nullableText(row, 'updated_at')),
        ...reviews.map(({ review }) => nullableText(review, 'created_at')),
      ]
        .filter((value): value is string => value !== null)
        .sort()
        .at(-1);
      const coverage = specialtyCompetencies.map((competencyLink) => {
        const competency = object(competencyLink.competencies);
        const competencyId =
          nullableText(competency, 'id') ??
          text(competencyLink, 'competency_id');
        const competencyContents = ownedContents.filter(
          (row) => nullableText(row, 'competency_id') === competencyId,
        );
        const publishedContents = competencyContents.filter((row) =>
          rows(row.learning_content_versions).some(
            (version) => text(version, 'editorial_status') === 'published',
          ),
        ).length;
        const eligibleQuestions = specialtyQuestions
          .filter((row) =>
            rows(
              object(row.question_versions).question_version_competencies,
            ).some((link) => text(link, 'competency_id') === competencyId),
          )
          .filter((row) =>
            ['homologated', 'published'].includes(
              text(object(row.question_versions), 'status'),
            ),
          ).length;
        const validReferences = references.filter(
          (row) =>
            text(object(row.content_references), 'verification_status') ===
            'verified',
        ).length;
        const lastReviewedAt =
          competencyContents
            .flatMap((row) => rows(row.learning_content_versions))
            .map((version) => nullableText(version, 'reviewed_at'))
            .filter((value): value is string => value !== null)
            .sort()
            .at(-1) ?? null;
        const pending: string[] = [];
        if (!publishedContents) pending.push('Sem conteúdo publicado');
        if (!eligibleQuestions) pending.push('Sem questão elegível');
        if (!validReferences) pending.push('Sem referência verificada');
        const needsUpdate =
          lastReviewedAt !== null &&
          Date.parse(lastReviewedAt) < Date.now() - 365 * 24 * 60 * 60 * 1000;
        if (needsUpdate) pending.push('Revisão científica desatualizada');
        const status =
          publishedContents && eligibleQuestions && validReferences
            ? needsUpdate
              ? 'needs_update'
              : 'covered'
            : publishedContents || eligibleQuestions || validReferences
              ? 'partially_covered'
              : 'uncovered';
        return {
          competencyId,
          competencyName: text(competency, 'name'),
          publishedContents,
          eligibleQuestions,
          validReferences,
          lastReviewedAt,
          status,
          pending,
        };
      });
      const gaps = coverage.flatMap((item) => {
        if (item.status === 'covered') return [];
        const missingAll =
          item.publishedContents === 0 &&
          item.eligibleQuestions === 0 &&
          item.validReferences === 0;
        return [
          {
            key: `competency:${item.competencyId}`,
            competencyId: item.competencyId,
            title: item.competencyName,
            reason: item.pending.join(' · '),
            priority: missingAll
              ? ('critical' as const)
              : item.status === 'needs_update'
                ? ('high' as const)
                : ('medium' as const),
            nextAction: missingAll
              ? 'Definir uma pauta editorial para esta competência.'
              : 'Revisar a pendência de maior impacto científico.',
          },
        ];
      });
      return medicalSpecialtyDashboardSchema.parse({
        id: specialtyId,
        code: text(specialtyRow, 'code'),
        name: text(specialtyRow, 'name'),
        description: nullableText(specialtyRow, 'description'),
        ownershipStatus: activeOwners.some(
          (row) =>
            text(row, 'owner_role') === 'primary' &&
            text(row, 'status') === 'active',
        )
          ? 'active'
          : activeOwners.some(
                (row) => text(row, 'status') === 'temporarily_unavailable',
              )
            ? 'temporarily_unavailable'
            : 'pending_assignment',
        owners: activeOwners.map((row) => ({
          id: text(row, 'id'),
          mentorId: text(row, 'mentor_id'),
          professionalName: text(
            object(row.mentor_profiles),
            'professional_name',
          ),
          ownerRole: text(row, 'owner_role'),
          status: text(row, 'status'),
          scope: text(row, 'scope'),
          reason: nullableText(row, 'reason'),
          startsAt: text(row, 'starts_at'),
          endsAt: nullableText(row, 'ends_at'),
          unavailableUntil: nullableText(row, 'unavailable_until'),
        })),
        areas: rows(areaRows)
          .filter((row) => text(row, 'specialty_id') === specialtyId)
          .map((row) => text(object(row.medical_areas), 'name'))
          .sort(),
        contents: {
          total: ownedContents.length,
          pending: versions.filter(({ editorial_status }) =>
            [
              'editorial_review',
              'awaiting_mentor_assignment',
              'awaiting_mentor_review',
              'mentor_changes_requested',
            ].includes(String(editorial_status)),
          ).length,
        },
        questions: new Set(
          specialtyQuestions.map((row) => text(row, 'question_version_id')),
        ).size,
        competencies: specialtyCompetencies.length,
        references: {
          total: references.length,
          pending: references.filter(
            (row) =>
              text(object(row.content_references), 'verification_status') !==
              'verified',
          ).length,
        },
        videos: versions.filter((row) => row.video != null).length,
        blueprints: new Set(
          blueprints.map((row) => text(object(row.exam_blueprints), 'version')),
        ).size,
        lastScientificUpdateAt: lastUpdate ?? null,
        contentStatus: [...statusCounts.entries()].map(([status, count]) => ({
          status,
          count,
        })),
        recentReviews: reviews.slice(0, 8).map(({ review, title }) => ({
          id: text(review, 'id'),
          title: String(title),
          decision: text(review, 'decision'),
          mentorName:
            nullableText(object(review.mentor_profiles), 'professional_name') ??
            'Mentor responsável',
          reviewedAt: text(review, 'created_at'),
        })),
        competencyNames: specialtyCompetencies
          .map((row) => text(object(row.competencies), 'name'))
          .sort(),
        referenceNames: references
          .map((row) => text(object(row.content_references), 'title'))
          .sort(),
        blueprintVersions: [
          ...new Set(
            blueprints.map((row) =>
              text(object(row.exam_blueprints), 'version'),
            ),
          ),
        ].sort(),
        coverage,
        gaps: gaps.sort((left, right) => {
          const rank = { critical: 0, high: 1, medium: 2, low: 3 };
          return rank[left.priority] - rank[right.priority];
        }),
        limitations: [
          'Vídeos são contabilizados a partir das versões de conteúdo.',
          'A cobertura considera conteúdo publicado, questão elegível e referência verificada.',
          'A cobertura não representa pontuação de qualidade científica.',
        ],
      });
    });
  };

  const librarySpecialtyIds = async (mentorId: string | null) =>
    mentorId
      ? rows(
          await get(
            `medical_specialty_owners?select=specialty_id&mentor_id=eq.${encodeURIComponent(mentorId)}&status=in.(active,temporarily_unavailable)&ends_at=is.null`,
          ),
        ).map((row) => text(row, 'specialty_id'))
      : rows(await get('specialties?select=id')).map((row) => text(row, 'id'));

  const matchesLibraryQuery = (
    item: KnowledgeLibraryItem,
    query: KnowledgeLibraryQuery,
  ) => {
    if (query.specialtyId && item.specialtyId !== query.specialtyId)
      return false;
    if (query.status && item.status !== query.status) return false;
    const term = query.search.toLocaleLowerCase('pt-BR');
    if (!term) return true;
    return [
      item.title,
      item.identifier,
      item.specialtyName,
      item.competencyName,
      item.status,
      item.ownerName,
      ...Object.values(item.metadata).map(String),
    ]
      .filter(Boolean)
      .some((value) => String(value).toLocaleLowerCase('pt-BR').includes(term));
  };

  const buildLibraryItems = async (
    kind: KnowledgeLibraryQuery['kind'],
    mentorId: string | null,
  ): Promise<KnowledgeLibraryItem[]> => {
    const specialtyIds = await librarySpecialtyIds(mentorId);
    if (!specialtyIds.length) return [];
    const [ownerResponse, specialtyResponse] = await Promise.all([
      get(
        `medical_specialty_owners?select=specialty_id,owner_role,status,mentor_profiles(professional_name)&specialty_id=in.(${specialtyIds.join(',')})&status=in.(active,temporarily_unavailable)&ends_at=is.null`,
      ),
      get(`specialties?select=id,name&id=in.(${specialtyIds.join(',')})`),
    ]);
    const owners = rows(ownerResponse);
    const specialtyRows = rows(specialtyResponse);
    const specialtyName = (specialtyId: string | null) =>
      nullableText(
        specialtyRows.find((row) => text(row, 'id') === specialtyId) ?? {},
        'name',
      );
    const ownerName = (specialtyId: string | null) =>
      nullableText(
        object(
          owners.find(
            (owner) =>
              text(owner, 'specialty_id') === specialtyId &&
              text(owner, 'owner_role') === 'primary',
          )?.mentor_profiles,
        ),
        'professional_name',
      );
    if (kind === 'contents') {
      const contentRows = rows(
        await get(
          `learning_contents?select=id,canonical_key,slug,specialty_id,competency_id,updated_at,specialties(name),competencies(name),learning_content_versions(id,title,version_number,editorial_status,reviewed_at,published_at)&specialty_id=in.(${specialtyIds.join(',')})&order=updated_at.desc&limit=500`,
        ),
      );
      return contentRows.map((row) => {
        const versions = rows(row.learning_content_versions).sort(
          (left, right) =>
            number(right, 'version_number') - number(left, 'version_number'),
        );
        const version = versions[0] ?? {};
        const specialtyId = nullableText(row, 'specialty_id');
        return {
          id: text(row, 'id'),
          kind,
          title: text(version, 'title') || text(row, 'slug'),
          identifier: text(row, 'canonical_key'),
          specialtyId,
          specialtyName: nullableText(object(row.specialties), 'name'),
          competencyId: nullableText(row, 'competency_id'),
          competencyName: nullableText(object(row.competencies), 'name'),
          status: text(version, 'editorial_status') || 'draft',
          ownerName: ownerName(specialtyId),
          updatedAt: nullableText(row, 'updated_at'),
          detail: `Versão ${number(version, 'version_number') || 1}`,
          metadata: {
            slug: text(row, 'slug'),
            versions: versions.length,
            reviewedAt: nullableText(version, 'reviewed_at'),
            publishedAt: nullableText(version, 'published_at'),
          },
        };
      });
    }
    if (kind === 'questions') {
      const questionRows = rows(
        await get(
          `question_version_specialties?select=specialty_id,question_versions(id,question_id,version_number,status,difficulty,created_at,question_version_competencies(competency_id,competencies(name)),question_version_provenance(external_identifier,source_title,editorial_status))&specialty_id=in.(${specialtyIds.join(',')})&limit=500`,
        ),
      );
      return questionRows.map((link) => {
        const row = object(link.question_versions);
        const competencyLink = rows(row.question_version_competencies)[0] ?? {};
        const provenance = rows(row.question_version_provenance)[0] ?? {};
        const specialtyId = nullableText(link, 'specialty_id');
        return {
          id: text(row, 'id'),
          kind,
          title:
            nullableText(provenance, 'external_identifier') ??
            `Questão ${text(row, 'id').slice(0, 8)}`,
          identifier: nullableText(provenance, 'external_identifier'),
          specialtyId,
          specialtyName: specialtyName(specialtyId),
          competencyId: nullableText(competencyLink, 'competency_id'),
          competencyName: nullableText(
            object(competencyLink.competencies),
            'name',
          ),
          status: text(row, 'status'),
          ownerName: ownerName(specialtyId),
          updatedAt: nullableText(row, 'created_at'),
          detail: nullableText(provenance, 'source_title'),
          metadata: {
            difficulty: text(row, 'difficulty'),
            version: number(row, 'version_number'),
            eligible: ['homologated', 'published'].includes(
              text(row, 'status'),
            ),
          },
        };
      });
    }
    if (kind === 'references') {
      const referenceRows = rows(
        await get(
          `content_reference_specialties?select=specialty_id,content_references(id,title,authors_or_organization,reference_type,publication_year,doi,pmid,isbn,url,verification_status,verified_at,created_at)&specialty_id=in.(${specialtyIds.join(',')})&limit=500`,
        ),
      );
      return referenceRows.map((link) => {
        const row = object(link.content_references);
        const specialtyId = nullableText(link, 'specialty_id');
        return {
          id: text(row, 'id'),
          kind,
          title: text(row, 'title'),
          identifier:
            nullableText(row, 'doi') ??
            nullableText(row, 'pmid') ??
            nullableText(row, 'isbn'),
          specialtyId,
          specialtyName: specialtyName(specialtyId),
          competencyId: null,
          competencyName: null,
          status: text(row, 'verification_status'),
          ownerName: ownerName(specialtyId),
          updatedAt:
            nullableText(row, 'verified_at') ?? nullableText(row, 'created_at'),
          detail: nullableText(row, 'authors_or_organization'),
          metadata: {
            type: text(row, 'reference_type'),
            year:
              row.publication_year == null
                ? null
                : number(row, 'publication_year'),
            doi: nullableText(row, 'doi'),
            pmid: nullableText(row, 'pmid'),
            isbn: nullableText(row, 'isbn'),
          },
        };
      });
    }
    if (kind === 'blueprints') {
      const blueprintRows = rows(
        await get(
          `exam_blueprint_areas?select=specialty_id,exam_blueprints(id,version,is_active,editorial_status,confidence,is_synthetic,period_start,period_end,created_at,exam_profiles(name))&specialty_id=in.(${specialtyIds.join(',')})&limit=500`,
        ),
      );
      return blueprintRows.map((link) => {
        const row = object(link.exam_blueprints);
        const specialtyId = nullableText(link, 'specialty_id');
        return {
          id: text(row, 'id'),
          kind,
          title:
            nullableText(object(row.exam_profiles), 'name') ??
            `Blueprint ${text(row, 'version')}`,
          identifier: text(row, 'version'),
          specialtyId,
          specialtyName: specialtyName(specialtyId),
          competencyId: null,
          competencyName: null,
          status: text(row, 'editorial_status'),
          ownerName: ownerName(specialtyId),
          updatedAt: nullableText(row, 'created_at'),
          detail: boolean(row, 'is_synthetic')
            ? 'Perfil sintético claramente identificado'
            : 'Perfil sustentado por fonte registrada',
          metadata: {
            active: boolean(row, 'is_active'),
            confidence: text(row, 'confidence'),
            synthetic: boolean(row, 'is_synthetic'),
            periodStart: nullableText(row, 'period_start'),
            periodEnd: nullableText(row, 'period_end'),
          },
        };
      });
    }
    const dashboards = await specialtyDashboards(mentorId);
    const competencyItems = dashboards.flatMap((dashboard) =>
      dashboard.coverage.map((coverage) => ({
        id: coverage.competencyId,
        kind: 'competencies' as const,
        title: coverage.competencyName,
        identifier: null,
        specialtyId: dashboard.id,
        specialtyName: dashboard.name,
        competencyId: coverage.competencyId,
        competencyName: coverage.competencyName,
        status: coverage.status,
        ownerName:
          dashboard.owners.find(({ ownerRole }) => ownerRole === 'primary')
            ?.professionalName ?? null,
        updatedAt: coverage.lastReviewedAt,
        detail: coverage.pending.join(' · ') || 'Cobertura completa',
        metadata: {
          publishedContents: coverage.publishedContents,
          eligibleQuestions: coverage.eligibleQuestions,
          verifiedReferences: coverage.validReferences,
        },
      })),
    );
    if (kind === 'competencies') return competencyItems;
    if (kind === 'gaps')
      return dashboards.flatMap((dashboard) =>
        dashboard.gaps.map((gap) => ({
          id: gap.competencyId ?? dashboard.id,
          kind: 'gaps' as const,
          title: gap.title,
          identifier: gap.key,
          specialtyId: dashboard.id,
          specialtyName: dashboard.name,
          competencyId: gap.competencyId,
          competencyName: gap.title,
          status: gap.priority,
          ownerName:
            dashboard.owners.find(({ ownerRole }) => ownerRole === 'primary')
              ?.professionalName ?? null,
          updatedAt: dashboard.lastScientificUpdateAt,
          detail: gap.reason,
          metadata: { nextAction: gap.nextAction },
        })),
      );
    const duplicateCandidates = [
      ...(await buildLibraryItems('contents', mentorId)),
      ...(await buildLibraryItems('references', mentorId)),
      ...(await buildLibraryItems('questions', mentorId)),
    ];
    const normalized = (value: string) =>
      value
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLocaleLowerCase('pt-BR')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    return duplicateCandidates.flatMap((item, index, all) => {
      const candidate = all.find(
        (other, candidateIndex) =>
          candidateIndex < index &&
          other.kind === item.kind &&
          other.id !== item.id &&
          ((item.identifier &&
            other.identifier &&
            item.identifier === other.identifier) ||
            (normalized(item.title).length > 8 &&
              normalized(item.title) === normalized(other.title))),
      );
      if (!candidate) return [];
      return [
        {
          ...item,
          kind: 'duplicates' as const,
          status: 'possible_duplicate',
          detail: `Possível correspondência com “${candidate.title}”.`,
          metadata: {
            ...item.metadata,
            candidateId: candidate.id,
            candidateTitle: candidate.title,
            resourceType:
              item.kind === 'contents'
                ? 'content'
                : item.kind === 'questions'
                  ? 'question'
                  : 'reference',
          },
        },
      ];
    });
  };
  return {
    async roles() {
      return rows(await get('user_roles?select=role')).map(
        (row) => text(row, 'role') as AppRole,
      );
    },
    async list(scope) {
      const filter =
        scope === 'student'
          ? '&editorial_status=eq.published'
          : scope === 'review'
            ? '&editorial_status=in.(awaiting_mentor_review,mentor_changes_requested,mentor_approved)'
            : '';
      return rows(
        await get(
          `learning_content_versions?select=${select}${filter}&order=created_at.desc`,
        ),
      ).map(serialize);
    },
    async get(versionId) {
      const row = rows(
        await get(
          `learning_content_versions?select=${select}&id=eq.${encodeURIComponent(versionId)}&limit=1`,
        ),
      )[0];
      return row ? serialize(row) : null;
    },
    async previousVersion(contentId, versionNumber) {
      const row = rows(
        await get(
          `learning_content_versions?select=${select}&content_id=eq.${encodeURIComponent(contentId)}&version_number=lt.${versionNumber}&order=version_number.desc&limit=1`,
        ),
      )[0];
      return row ? serialize(row) : null;
    },
    async reviewHistory(page, pageSize) {
      const offset = (page - 1) * pageSize;
      const reviewRows = rows(
        await get(
          `content_reviews?select=id,content_id,version_id,mentor_id,decision,comment,observed_references,version_hash,created_at&order=created_at.desc&limit=${pageSize}&offset=${offset}`,
        ),
      );
      const totalRows = rows(await get('content_reviews?select=id'));
      const versionIds = reviewRows.map((row) => text(row, 'version_id'));
      const versionRows = versionIds.length
        ? rows(
            await get(
              `learning_content_versions?select=id,title,version_number,editorial_status,author_id&id=in.(${versionIds.join(',')})`,
            ),
          )
        : [];
      const authorIds = versionRows.map((row) => text(row, 'author_id'));
      const profileRows = authorIds.length
        ? rows(
            await get(
              `profiles?select=id,display_name&id=in.(${authorIds.join(',')})`,
            ),
          )
        : [];
      const mentorRows = rows(
        await get('mentor_profiles?select=user_id,professional_name'),
      );
      return {
        items: reviewRows.map((review) => {
          const version = versionRows.find(
            (item) => text(item, 'id') === text(review, 'version_id'),
          );
          const editor = profileRows.find(
            (item) => text(item, 'id') === text(version ?? {}, 'author_id'),
          );
          const mentor = mentorRows.find(
            (item) => text(item, 'user_id') === text(review, 'mentor_id'),
          );
          return {
            reviewId: text(review, 'id'),
            contentId: text(review, 'content_id'),
            versionId: text(review, 'version_id'),
            title: text(version ?? {}, 'title'),
            versionNumber: number(version ?? {}, 'version_number'),
            mentorName:
              nullableText(mentor ?? {}, 'professional_name') ??
              'Mentor responsável',
            editorName: nullableText(editor ?? {}, 'display_name'),
            decision: text(review, 'decision') as
              | 'approved'
              | 'changes_requested'
              | 'rejected',
            comment: nullableText(review, 'comment'),
            status: text(
              version ?? {},
              'editorial_status',
            ) as MentorReviewHistory['items'][number]['status'],
            reviewedAt: text(review, 'created_at'),
            reviewMinutes: null,
            referencesModified: rows(review.observed_references).length,
            versionHash: text(review, 'version_hash'),
          };
        }),
        page,
        pageSize,
        total: totalRows.length,
      };
    },
    async specialties(mentorId) {
      return (await specialtyDashboards(mentorId)).map((item) =>
        medicalSpecialtySummarySchema.parse(item),
      );
    },
    async specialty(mentorId, specialtyId) {
      return (await specialtyDashboards(mentorId, specialtyId))[0] ?? null;
    },
    async competency(mentorId, competencyId) {
      const competencyRows = rows(
        await get(
          `competencies?select=id,code,name,description,subthemes(id,name,themes(id,name,medical_areas(id,name))),competency_objectives(position,description),competency_specialties(relationship,specialty_id,specialties(id,name,medical_specialty_owners(owner_role,status,ends_at,mentor_profiles(professional_name))))&id=eq.${encodeURIComponent(competencyId)}`,
        ),
      );
      const competency = competencyRows[0];
      if (!competency) return null;
      const specialtyLinks = rows(competency.competency_specialties);
      if (mentorId) {
        const ownedIds = new Set(
          rows(
            await get(
              `medical_specialty_owners?select=specialty_id&mentor_id=eq.${encodeURIComponent(mentorId)}&status=in.(active,temporarily_unavailable)&ends_at=is.null`,
            ),
          ).map((row) => text(row, 'specialty_id')),
        );
        if (
          !specialtyLinks.some((link) =>
            ownedIds.has(text(link, 'specialty_id')),
          )
        )
          return null;
      }
      const [
        contentResponse,
        questionResponse,
        referenceResponse,
        blueprintResponse,
      ] = await Promise.all([
        get(
          `learning_contents?select=id,slug,learning_content_versions!learning_content_versions_content_id_fkey(id,title,editorial_status,video,reviewed_at,published_at,learning_content_version_references(is_required,content_references(id,title,url,verification_status)))&competency_id=eq.${encodeURIComponent(competencyId)}`,
        ),
        get(
          `question_version_competencies?select=question_versions(id,stem,status,difficulty,question_version_provenance(external_identifier,source_title,editorial_status))&competency_id=eq.${encodeURIComponent(competencyId)}`,
        ),
        get(
          `competency_references?select=academic_references(id,title,authors,publication_year,url)&competency_id=eq.${encodeURIComponent(competencyId)}`,
        ),
        get(
          `diagnostic_blueprint_competencies?select=exam_blueprints(id,version,is_active,editorial_status,exam_intelligence_profiles(display_name))&competency_id=eq.${encodeURIComponent(competencyId)}`,
        ),
      ]);
      const contentRows = rows(contentResponse);
      const versions = contentRows.flatMap((content) =>
        rows(content.learning_content_versions).map((version) => ({
          content,
          version,
        })),
      );
      const published = versions.filter(
        ({ version }) => text(version, 'editorial_status') === 'published',
      );
      const questionRows = rows(questionResponse).map((link) =>
        object(link.question_versions),
      );
      const eligibleQuestions = questionRows.filter((question) =>
        ['homologated', 'published'].includes(text(question, 'status')),
      );
      const academicReferences = rows(referenceResponse).map((link) =>
        object(link.academic_references),
      );
      const contentReferenceLinks = versions.flatMap(({ version }) =>
        rows(version.learning_content_version_references),
      );
      const verifiedContentReferences = contentReferenceLinks
        .map((link) => object(link.content_references))
        .filter(
          (reference) => text(reference, 'verification_status') === 'verified',
        );
      const referenceMap = new Map<string, Row>();
      for (const reference of [
        ...academicReferences,
        ...verifiedContentReferences,
      ])
        referenceMap.set(text(reference, 'id'), reference);
      const blueprintRows = rows(blueprintResponse).map((link) =>
        object(link.exam_blueprints),
      );
      const activeBlueprints = blueprintRows.filter(
        (blueprint) =>
          boolean(blueprint, 'is_active') &&
          ['approved', 'published'].includes(
            text(blueprint, 'editorial_status'),
          ),
      );
      const videos = published.filter(
        ({ version }) => version.video !== null && version.video !== undefined,
      );
      const lastReviewedAt =
        published
          .map(({ version }) => nullableText(version, 'reviewed_at'))
          .filter((value): value is string => value !== null)
          .sort()
          .at(-1) ?? null;
      const pending: string[] = [];
      if (!published.length) pending.push('Sem conteúdo publicado');
      if (!eligibleQuestions.length) pending.push('Sem questão elegível');
      if (!referenceMap.size) pending.push('Sem referência verificada');
      const needsUpdate =
        lastReviewedAt !== null &&
        Date.parse(lastReviewedAt) < Date.now() - 365 * 24 * 60 * 60 * 1000;
      if (needsUpdate) pending.push('Revisão científica desatualizada');
      const coverageStatus =
        published.length && eligibleQuestions.length && referenceMap.size
          ? needsUpdate
            ? 'needs_update'
            : 'covered'
          : published.length || eligibleQuestions.length || referenceMap.size
            ? 'partially_covered'
            : 'uncovered';
      const subtheme = object(competency.subthemes);
      const theme = object(subtheme.themes);
      const area = object(theme.medical_areas);
      const resource = (
        row: Row,
        title: string,
        status: string,
        detail: string | null,
        href: string | null = null,
      ) => ({ id: text(row, 'id'), title, status, detail, href });
      return competencyWorkspaceSchema.parse({
        id: text(competency, 'id'),
        code: text(competency, 'code'),
        name: text(competency, 'name'),
        description: text(competency, 'description'),
        hierarchy: {
          area: text(area, 'name'),
          theme: text(theme, 'name'),
          subtheme: text(subtheme, 'name'),
        },
        objectives: rows(competency.competency_objectives)
          .sort(
            (left, right) =>
              number(left, 'position') - number(right, 'position'),
          )
          .map((objective) => text(objective, 'description')),
        specialties: specialtyLinks.map((link) => {
          const specialty = object(link.specialties);
          return {
            id: text(specialty, 'id'),
            name: text(specialty, 'name'),
            relationship: text(link, 'relationship'),
            owners: rows(specialty.medical_specialty_owners)
              .filter(
                (owner) =>
                  ['active', 'temporarily_unavailable'].includes(
                    text(owner, 'status'),
                  ) && owner.ends_at === null,
              )
              .map((owner) => ({
                name:
                  nullableText(
                    object(owner.mentor_profiles),
                    'professional_name',
                  ) ?? 'Mentor responsável',
                role: text(owner, 'owner_role'),
                status: text(owner, 'status'),
              })),
          };
        }),
        coverage: {
          status: coverageStatus,
          publishedContents: published.length,
          eligibleQuestions: eligibleQuestions.length,
          validReferences: referenceMap.size,
          videos: videos.length,
          activeBlueprints: activeBlueprints.length,
          pending,
          lastReviewedAt,
        },
        contents: published.map(({ content, version }) =>
          resource(
            version,
            text(version, 'title'),
            'published',
            'Conteúdo científico publicado',
            `/learning/${text(content, 'slug')}`,
          ),
        ),
        questions: eligibleQuestions.map((question) =>
          resource(
            question,
            text(question, 'stem'),
            text(question, 'status'),
            nullableText(question, 'difficulty'),
          ),
        ),
        references: [...referenceMap.values()].map((reference) =>
          resource(
            reference,
            text(reference, 'title'),
            nullableText(reference, 'verification_status') ?? 'catalogued',
            nullableText(reference, 'authors'),
            nullableText(reference, 'url'),
          ),
        ),
        videos: videos.map(({ version }) => {
          const video = object(version.video);
          return resource(
            version,
            nullableText(video, 'caption') ?? text(version, 'title'),
            nullableText(video, 'editorialStatus') ?? 'published',
            nullableText(video, 'provider'),
            nullableText(video, 'url'),
          );
        }),
        blueprints: activeBlueprints.map((blueprint) =>
          resource(
            blueprint,
            `Blueprint ${text(blueprint, 'version')}`,
            'active',
            nullableText(
              object(blueprint.exam_intelligence_profiles),
              'display_name',
            ),
          ),
        ),
        learningUse: {
          diagnostic: activeBlueprints.length
            ? `Avaliada em ${activeBlueprints.length} blueprint${activeBlueprints.length === 1 ? '' : 's'} ativo${activeBlueprints.length === 1 ? '' : 's'}.`
            : 'Ainda não participa de um blueprint diagnóstico ativo.',
          plan: 'Pode originar atividades quando o plano identificar uma necessidade de estudo.',
          tutor: published.length
            ? 'O tutor pode explicar esta competência usando o conteúdo científico publicado.'
            : 'O tutor ainda não possui conteúdo científico publicado para esta competência.',
        },
        gaps: pending.map((reason) => ({
          title: text(competency, 'name'),
          reason,
          nextAction:
            reason === 'Sem conteúdo publicado'
              ? 'Priorizar a produção e revisão de um conteúdo.'
              : reason === 'Sem questão elegível'
                ? 'Relacionar e homologar uma questão adequada.'
                : reason === 'Sem referência verificada'
                  ? 'Vincular e verificar uma referência científica.'
                  : 'Programar uma nova revisão científica.',
        })),
        limitations: [
          'A cobertura indica presença de recursos validados; não representa qualidade clínica.',
          'Diagnóstico e plano continuam sendo calculados pelos motores pedagógicos, sem alteração por esta visão.',
        ],
      });
    },
    async managedSpecialties() {
      return specialtyDashboards(null);
    },
    async ownershipHistory(specialtyId) {
      return rows(
        await get(
          `medical_specialty_ownership_history?select=id,ownership_id,specialty_id,mentor_id,owner_role,status,scope,reason,recorded_at,operation,mentor_profiles(professional_name)&specialty_id=eq.${encodeURIComponent(specialtyId)}&order=recorded_at.desc`,
        ),
      ).map((row) => ({
        id: text(row, 'id'),
        ownershipId: text(row, 'ownership_id'),
        specialtyId: text(row, 'specialty_id'),
        mentorId: text(row, 'mentor_id'),
        professionalName:
          nullableText(object(row.mentor_profiles), 'professional_name') ??
          'Mentor',
        ownerRole: text(row, 'owner_role') as 'primary' | 'co_owner',
        status: text(row, 'status') as
          | 'active'
          | 'temporarily_unavailable'
          | 'inactive'
          | 'pending_assignment',
        scope: text(row, 'scope') as
          | 'scientific'
          | 'operational'
          | 'scientific_and_operational',
        reason: nullableText(row, 'reason'),
        recordedAt: text(row, 'recorded_at'),
        operation: text(row, 'operation') as
          | 'created'
          | 'transitioned'
          | 'snapshot',
      }));
    },
    async assignSpecialtyOwner(specialtyId, input) {
      return String(
        await rpc('assign_medical_specialty_owner', {
          p_specialty_id: specialtyId,
          p_mentor_id: input.mentorId,
          p_owner_role: input.ownerRole,
          p_authorization_reference: input.authorizationReference,
          p_request_id: input.requestId,
        }),
      );
    },
    async setSpecialtyOwnerStatus(ownershipId, input) {
      return String(
        await rpc('set_medical_specialty_owner_status', {
          p_ownership_id: ownershipId,
          p_status: input.status,
          p_reason: input.reason,
          p_unavailable_until: input.unavailableUntil,
          p_request_id: input.requestId,
        }),
      );
    },
    async libraryOverview(mentorId) {
      const dashboards = await specialtyDashboards(mentorId);
      const [contents, questions, references, blueprints, duplicates] =
        await Promise.all([
          buildLibraryItems('contents', mentorId),
          buildLibraryItems('questions', mentorId),
          buildLibraryItems('references', mentorId),
          buildLibraryItems('blueprints', mentorId),
          buildLibraryItems('duplicates', mentorId),
        ]);
      const coverage = dashboards.flatMap((dashboard) => dashboard.coverage);
      return {
        publishedContents: contents.filter(
          ({ status }) => status === 'published',
        ).length,
        contentsInReview: contents.filter(({ status }) =>
          [
            'editorial_review',
            'awaiting_mentor_review',
            'mentor_changes_requested',
          ].includes(status),
        ).length,
        publishedQuestions: questions.filter(
          ({ status }) => status === 'published',
        ).length,
        diagnosticEligibleQuestions: questions.filter(
          ({ metadata }) => metadata.eligible === true,
        ).length,
        verifiedReferences: references.filter(
          ({ status }) => status === 'verified',
        ).length,
        pendingReferences: references.filter(
          ({ status }) => status !== 'verified',
        ).length,
        activeBlueprints: blueprints.filter(
          ({ metadata }) => metadata.active === true,
        ).length,
        coveredCompetencies: coverage.filter(
          ({ status }) => status === 'covered',
        ).length,
        uncoveredCompetencies: coverage.filter(
          ({ status }) => status !== 'covered',
        ).length,
        possibleDuplicates: duplicates.length,
        outdatedItems: [
          ...contents.filter(({ status }) => status === 'archived'),
          ...references.filter(({ status }) => status === 'outdated'),
          ...coverage.filter(({ status }) => status === 'needs_update'),
        ].length,
        priorityGaps: dashboards
          .flatMap(({ gaps }) => gaps)
          .filter(({ priority }) => ['critical', 'high'].includes(priority))
          .length,
      };
    },
    async library(query, mentorId) {
      const all = (await buildLibraryItems(query.kind, mentorId))
        .filter((item) => matchesLibraryQuery(item, query))
        .sort((left, right) =>
          query.order === 'title_asc'
            ? left.title.localeCompare(right.title, 'pt-BR')
            : Date.parse(right.updatedAt ?? '1970-01-01') -
              Date.parse(left.updatedAt ?? '1970-01-01'),
        );
      const offset = (query.page - 1) * query.pageSize;
      return {
        items: all.slice(offset, offset + query.pageSize),
        page: query.page,
        pageSize: query.pageSize,
        total: all.length,
      };
    },
    async resolveDuplicate(input) {
      return String(
        await rpc('resolve_knowledge_duplicate', {
          p_resource_type: input.resourceType,
          p_resource_id: input.resourceId,
          p_candidate_id: input.candidateId,
          p_decision: input.decision,
          p_canonical_id: input.canonicalId,
          p_reason: input.reason,
          p_request_id: input.requestId,
        }),
      );
    },
    async createDraft(input) {
      return String(await rpc('create_learning_content_draft', snake(input)));
    },
    async createVersion(input) {
      return String(
        await rpc('create_learning_content_version', {
          p_content_id: input.contentId,
          p_source_version_id: input.sourceVersionId,
          p_title: input.title,
          p_summary: input.summary,
          p_sections: input.sections,
          p_request_id: input.requestId,
        }),
      );
    },
    async submit(versionId, mentorId, requestId) {
      return String(
        await rpc('submit_content_for_review', {
          p_version_id: versionId,
          p_mentor_id: mentorId,
          p_request_id: requestId,
        }),
      );
    },
    async review(versionId, input) {
      return String(
        await rpc('review_learning_content', {
          p_version_id: versionId,
          ...snake(input),
        }),
      );
    },
    async publish(versionId, requestId) {
      return String(
        await rpc('publish_learning_content', {
          p_version_id: versionId,
          p_request_id: requestId,
        }),
      );
    },
    async requestPriority(versionId, requestId) {
      return String(
        await rpc('request_content_review_priority', {
          p_version_id: versionId,
          p_request_id: requestId,
        }),
      );
    },
    async audit(contentId) {
      return rows(
        await get(
          `editorial_audit_events?select=*&resource_id=eq.${encodeURIComponent(contentId)}&order=created_at.asc`,
        ),
      );
    },
    async notifications() {
      return rows(
        await get(
          'editorial_notifications?select=*&order=created_at.desc&limit=100',
        ),
      );
    },
    async emailEvents(contentId) {
      return rows(
        await get(
          `editorial_email_events?select=*&content_id=eq.${encodeURIComponent(contentId)}&order=created_at.desc`,
        ),
      );
    },
    async reviewAssignmentEmail(versionId) {
      return (await rpc('review_assignment_email_payload', {
        p_version_id: versionId,
      })) as ReviewAssignmentEmail;
    },
    async recordEmailEvent(idempotencyKey, eventType, providerId, errorCode) {
      return String(
        await rpc('record_editorial_email_event', {
          p_idempotency_key: idempotencyKey,
          p_event_type: eventType,
          p_provider_id: providerId,
          p_error_code: errorCode,
        }),
      );
    },
  };
}

const rowsOrStrings = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => String(item)) : [];
const snake = (input: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      `p_${key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)}`,
      value,
    ]),
  );
