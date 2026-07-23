import type {
  TutorConversation,
  TutorMessage,
  TutorMode,
  TutorOriginType,
  TutorReference,
} from '@iatron/contracts';
import type { ApiEnvironment } from './config/environment.js';
import { RepositoryError } from './student-repository.js';

type Row = Record<string, unknown>;
const rows = (value: unknown): Row[] => (Array.isArray(value) ? value as Row[] : []);
const text = (row: Row, key: string) => String(row[key] ?? '');

export interface TutorContext {
  text: string;
  references: TutorReference[];
}
export interface BeginGeneration {
  generationId: string;
  assistantMessageId: string;
}
export interface FinishGeneration {
  requestId: string;
  content: string;
  status: 'complete' | 'partial' | 'failed' | 'cancelled';
  responseId: string | null;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
  errorCode: string | null;
  references: TutorReference[];
}
export interface TutorRepository {
  create(mode: TutorMode, originType: TutorOriginType | null, originId: string | null): Promise<string>;
  list(): Promise<TutorConversation[]>;
  get(id: string): Promise<TutorConversation | null>;
  messages(id: string, limit?: number): Promise<TutorMessage[]>;
  begin(id: string, requestId: string, content: string, model: string, promptVersion: string): Promise<BeginGeneration>;
  finish(input: FinishGeneration): Promise<void>;
  archive(id: string): Promise<void>;
  context(conversation: TutorConversation): Promise<TutorContext>;
}

export function createTutorRepository(environment: ApiEnvironment, token: string): TutorRepository {
  const headers = {
    apikey: environment.SUPABASE_PUBLISHABLE_KEY,
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  };
  const request = async (path: string, init?: RequestInit) => {
    const response = await fetch(new URL(`/rest/v1/${path}`, environment.SUPABASE_URL), {
      ...init,
      headers: { ...headers, ...init?.headers },
    });
    if (!response.ok)
      throw new RepositoryError(`Tutor repository failed with ${response.status}`, 'TUTOR_REPOSITORY_ERROR');
    const body = await response.text();
    return body ? JSON.parse(body) as unknown : null;
  };
  const rpc = (name: string, body: object) =>
    request(`rpc/${name}`, { method: 'POST', body: JSON.stringify(body) });
  const mapConversation = (row: Row): TutorConversation => ({
    id: text(row, 'id'),
    title: text(row, 'title'),
    mode: text(row, 'mode') as TutorMode,
    originType: row.origin_type ? text(row, 'origin_type') as TutorOriginType : null,
    originId: row.origin_id ? text(row, 'origin_id') : null,
    status: text(row, 'status') as 'active' | 'archived',
    createdAt: text(row, 'created_at'),
    updatedAt: text(row, 'updated_at'),
  });
  const addReference = (
    references: TutorReference[],
    type: TutorReference['type'],
    row: Row | undefined,
    label: string,
  ) => {
    if (!row) return;
    references.push({
      type,
      entityId: row.id ? text(row, 'id') : null,
      label,
      snapshot: row,
    });
  };
  return {
    async create(mode, originType, originId) {
      return String(await rpc('create_tutor_conversation', {
        p_mode: mode, p_origin_type: originType, p_origin_id: originId,
      }));
    },
    async list() {
      return rows(await request('tutor_conversations?select=*&order=updated_at.desc&limit=50')).map(mapConversation);
    },
    async get(id) {
      const row = rows(await request(`tutor_conversations?select=*&id=eq.${id}&limit=1`))[0];
      return row ? mapConversation(row) : null;
    },
    async messages(id, limit = 30) {
      return rows(await request(`tutor_messages?select=id,role,content,status,request_id,created_at&conversation_id=eq.${id}&order=created_at.asc&limit=${limit}`)).map((row) => ({
        id: text(row, 'id'),
        role: text(row, 'role') as 'user' | 'assistant',
        content: text(row, 'content'),
        status: text(row, 'status') as TutorMessage['status'],
        requestId: row.request_id ? text(row, 'request_id') : null,
        createdAt: text(row, 'created_at'),
      }));
    },
    async begin(id, requestId, content, model, promptVersion) {
      return await rpc('begin_tutor_generation', {
        p_conversation_id: id, p_request_id: requestId, p_content: content,
        p_model: model, p_prompt_version: promptVersion,
      }) as BeginGeneration;
    },
    async finish(input) {
      await rpc('finish_tutor_generation', {
        p_request_id: input.requestId, p_content: input.content, p_status: input.status,
        p_response_id: input.responseId, p_input_tokens: input.inputTokens,
        p_output_tokens: input.outputTokens, p_total_tokens: input.totalTokens,
        p_latency_ms: input.latencyMs, p_error_code: input.errorCode,
        p_references: input.references.map((reference) => ({
          type: reference.type, entityId: reference.entityId, label: reference.label,
          snapshot: reference.snapshot,
        })),
      });
    },
    async archive(id) {
      await rpc('archive_tutor_conversation', { p_conversation_id: id });
    },
    async context(conversation) {
      const references: TutorReference[] = [];
      const [profile, target, mastery, evidence, plan] = await Promise.all([
        request('profiles?select=id,display_name,onboarding_status&limit=1'),
        request('student_target_exams?select=exam_edition_id,exam_editions(year,exam_programs(name))&limit=1'),
        request('current_mastery?select=id,competency_id,mastery,confidence,evidence_count,trend,last_evidence_at,competencies(code,name)&order=confidence.asc&limit=5'),
        request('learning_evidence?select=id,competency_id,is_correct,difficulty,weight,observed_at&order=observed_at.desc&limit=5'),
        request('study_plans?select=id,objective,algorithm_version,status,study_plan_versions(id,version,period_start,period_end,total_planned_minutes,study_plan_items(id,competency_id,item_type,priority,status,justification,competencies(code,name)))&status=eq.active&limit=1'),
      ]);
      addReference(references, 'profile', rows(profile)[0], 'Perfil do estudante');
      addReference(references, 'target_exam', rows(target)[0], 'Prova-alvo');
      rows(mastery).forEach((row) => addReference(references, 'mastery', row, `Mastery: ${text((row.competencies ?? {}) as Row, 'name')}`));
      rows(evidence).forEach((row) => addReference(references, 'evidence', row, 'Evidência recente'));
      addReference(references, 'study_plan', rows(plan)[0], 'Plano de estudos vigente');
      if (conversation.originId && ['competency', 'gap'].includes(conversation.originType ?? '')) {
        const competency = rows(await request(`competencies?select=id,code,name,description,competency_objectives(position,description)&id=eq.${conversation.originId}&limit=1`))[0];
        addReference(references, 'competency', competency, `Competência: ${text(competency ?? {}, 'name')}`);
      }
      if (conversation.originType === 'question' && conversation.originId) {
        const question = rows(await request(`question_versions?select=id,stem,commentary,difficulty,cognitive_level,question_options(label,content,is_correct),question_version_competencies(competencies(id,code,name)),question_version_guidelines(guidelines(id,title,version,url))&id=eq.${conversation.originId}&limit=1`))[0];
        addReference(references, 'question', question, 'Questão acadêmica');
      }
      if (conversation.originType === 'plan_item' && conversation.originId) {
        const item = rows(await request(`study_plan_items?select=id,item_type,priority,status,justification,source_snapshot,competencies(id,code,name,description)&id=eq.${conversation.originId}&limit=1`))[0];
        addReference(references, 'study_plan', item, 'Item do plano');
      }
      if (conversation.originType === 'assessment' && conversation.originId) {
        const assessment = rows(await request(`diagnostic_assessments?select=id,objective,status,overall_confidence,diagnostic_coverage,assessment_results(id,correct_count,answered_count,assessment_result_competencies(competency_id,mastery,confidence,classification,competencies(code,name)))&id=eq.${conversation.originId}&limit=1`))[0];
        addReference(references, 'assessment', assessment, 'Resultado diagnóstico');
      }
      return {
        text: JSON.stringify(references.map(({ type, label, snapshot }) => ({ type, label, data: snapshot }))),
        references,
      };
    },
  };
}
