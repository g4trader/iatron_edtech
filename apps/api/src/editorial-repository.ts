import {
  learningContentVersionSchema,
  type AppRole,
  type LearningContentVersion,
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
