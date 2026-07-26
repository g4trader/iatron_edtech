import type {
  AdminMentorList,
  AdminOverview,
  AdminStudentDetail,
  AdminStudentList,
  AdminUser,
  AppRole,
} from '@iatron/contracts';
import type { ApiEnvironment } from './config/environment.js';

type AccountStatus = 'active' | 'disabled';
type AuthUser = {
  id: string;
  email?: string;
  banned_until?: string;
  last_sign_in_at?: string;
  created_at: string;
};
type RoleRow = { user_id: string; role: AppRole };
type ProfileRow = {
  id: string;
  display_name: string;
  email: string;
  onboarding_status: string;
  onboarding_step: number;
  created_at: string;
};
type AssessmentRow = {
  student_id: string;
  status: string;
  diagnostic_coverage: number | null;
  completed_at: string | null;
  started_at: string;
};
type PlanRow = {
  id: string;
  student_id: string;
  status: string;
  updated_at: string;
};
type StudentRow = {
  id: string;
  displayName: string;
  emailMasked: string;
  status: AccountStatus;
  onboardingStatus: string;
  onboardingStep: number;
  targetExam: string | null;
  diagnosticStatus: string | null;
  diagnosticCoverage: number | null;
  diagnosticCompletedAt: string | null;
  planStatus: string | null;
  planId: string | null;
  lastActivityAt: string | null;
  lastAccessAt: string | null;
  createdAt: string;
};
type MentorSummary = AdminMentorList['items'][number];

export class AdminRepositoryError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

const disabled = (user: AuthUser) =>
  Boolean(user.banned_until && new Date(user.banned_until) > new Date());
const accountStatus = (user: AuthUser): AccountStatus =>
  disabled(user) ? 'disabled' : 'active';
const maskEmail = (email: string) => {
  const [local = '', domain = ''] = email.split('@');
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(3, local.length - 2))}@${domain}`;
};

export function createAdminRepository(environment: ApiEnvironment) {
  const serviceKey = environment.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey)
    throw new AdminRepositoryError(
      'ADMIN_SERVICE_ROLE_NOT_CONFIGURED',
      'A camada administrativa não está configurada.',
    );
  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    'content-type': 'application/json',
  };
  const request = async <T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> => {
    const response = await fetch(`${environment.SUPABASE_URL}${path}`, {
      ...init,
      headers: { ...headers, ...init.headers },
    });
    const text = await response.text();
    if (!response.ok) {
      const code =
        response.status === 404
          ? 'ADMIN_NOT_FOUND'
          : response.status === 409 || response.status === 422
            ? 'ADMIN_CONFLICT'
            : response.status === 429
              ? 'ADMIN_RATE_LIMITED'
              : 'ADMIN_UPSTREAM_ERROR';
      throw new AdminRepositoryError(
        code,
        'Operação administrativa indisponível.',
      );
    }
    return (text ? JSON.parse(text) : null) as T;
  };
  const rest = <T>(path: string, init?: RequestInit) =>
    request<T>(`/rest/v1/${path}`, init);
  const auth = <T>(path: string, init?: RequestInit) =>
    request<T>(`/auth/v1/${path}`, init);
  const listAuthUsers = async () =>
    (await auth<{ users: AuthUser[] }>('admin/users?page=1&per_page=1000'))
      .users;
  const rolesForUsers = async () => {
    const rows = await rest<RoleRow[]>('user_roles?select=user_id,role');
    const roles = new Map<string, AppRole[]>();
    for (const row of rows)
      roles.set(row.user_id, [...(roles.get(row.user_id) ?? []), row.role]);
    return roles;
  };
  const getAuthUser = (id: string) =>
    auth<AuthUser>(`admin/users/${encodeURIComponent(id)}`);
  const assertNotLastActiveAdmin = async (userId: string) => {
    const [allUsers, adminRows] = await Promise.all([
      listAuthUsers(),
      rest<RoleRow[]>(
        'user_roles?select=user_id,role&role=in.(admin,super_admin)',
      ),
    ]);
    const userMap = new Map(allUsers.map((user) => [user.id, user]));
    const activeAdmins = new Set(
      adminRows
        .filter(({ user_id }) => {
          const user = userMap.get(user_id);
          return user && !disabled(user);
        })
        .map(({ user_id }) => user_id),
    );
    if (activeAdmins.has(userId) && activeAdmins.size <= 1)
      throw new AdminRepositoryError(
        'ADMIN_LAST_ACTIVE',
        'O último administrador ativo está protegido.',
      );
  };

  const authorize = async (actorId: string) => {
    const [rows, user] = await Promise.all([
      rest<{ role: AppRole }[]>(
        `user_roles?select=role&user_id=eq.${encodeURIComponent(actorId)}`,
      ),
      getAuthUser(actorId),
    ]);
    const roles = rows.map(({ role }) => role);
    if (disabled(user))
      throw new AdminRepositoryError(
        'ADMIN_ACCOUNT_DISABLED',
        'Conta desativada.',
      );
    if (!roles.includes('admin') && !roles.includes('super_admin'))
      throw new AdminRepositoryError(
        'ADMIN_FORBIDDEN',
        'Permissão insuficiente.',
      );
    return {
      roles,
      elevated: roles.includes('super_admin'),
      role: roles.includes('super_admin') ? 'super_admin' : 'admin',
    };
  };

  const audit = (
    actorId: string,
    actorRole: string,
    action: string,
    resourceId: string,
    requestId: string,
    previousState: string | null,
    nextState: string | null,
    metadata: Record<string, string | number | boolean | null> = {},
  ) =>
    rest<null>('editorial_audit_events', {
      method: 'POST',
      headers: { prefer: 'return=minimal' },
      body: JSON.stringify({
        actor_id: actorId,
        actor_role: actorRole,
        resource_type: 'admin_user',
        resource_id: resourceId,
        action,
        previous_state: previousState,
        next_state: nextState,
        request_id: requestId,
        metadata,
      }),
    });

  const studentIds = async () => {
    const roles = await rolesForUsers();
    const staff = new Set<AppRole>([
      'mentor',
      'editor',
      'admin',
      'medical_reviewer',
      'legal_reviewer',
      'super_admin',
    ]);
    return [...roles.entries()]
      .filter(
        ([, values]) =>
          values.includes('student') && !values.some((role) => staff.has(role)),
      )
      .map(([id]) => id);
  };
  const idFilter = (ids: string[]) => `in.(${ids.join(',')})`;

  const studentRows = async (): Promise<StudentRow[]> => {
    const ids = await studentIds();
    if (ids.length === 0) return [];
    const filter = idFilter(ids);
    const [profiles, authUsers, assessments, plans, events, targets] =
      await Promise.all([
        rest<ProfileRow[]>(
          `profiles?select=id,display_name,email,onboarding_status,onboarding_step,created_at&id=${filter}`,
        ),
        listAuthUsers(),
        rest<AssessmentRow[]>(
          `diagnostic_assessments?select=student_id,status,diagnostic_coverage,completed_at,started_at&student_id=${filter}&order=started_at.desc`,
        ),
        rest<PlanRow[]>(
          `study_plans?select=id,student_id,status,updated_at&student_id=${filter}&order=updated_at.desc`,
        ),
        rest<{ student_id: string; occurred_at: string }[]>(
          `learning_events?select=student_id,occurred_at&student_id=${filter}&order=occurred_at.desc`,
        ),
        rest<
          {
            user_id: string;
            exam_editions: {
              year: number;
              exam_programs: {
                name: string;
                institutions: { acronym: string } | null;
              } | null;
            } | null;
          }[]
        >(
          `student_target_exams?select=user_id,exam_editions(year,exam_programs(name,institutions(acronym)))&user_id=${filter}`,
        ),
      ]);
    const users = new Map(authUsers.map((user) => [user.id, user]));
    const latestAssessment = new Map<string, AssessmentRow>();
    const latestPlan = new Map<string, PlanRow>();
    const latestEvent = new Map<string, string>();
    const target = new Map<string, string>();
    for (const item of assessments)
      if (!latestAssessment.has(item.student_id))
        latestAssessment.set(item.student_id, item);
    for (const item of plans)
      if (!latestPlan.has(item.student_id))
        latestPlan.set(item.student_id, item);
    for (const item of events)
      if (!latestEvent.has(item.student_id))
        latestEvent.set(item.student_id, item.occurred_at);
    for (const item of targets) {
      const edition = item.exam_editions;
      if (edition)
        target.set(
          item.user_id,
          `${edition.exam_programs?.institutions?.acronym ?? edition.exam_programs?.name ?? 'Prova'} ${edition.year}`,
        );
    }
    return profiles.flatMap((profile) => {
      const user = users.get(profile.id);
      if (!user) return [];
      const assessment = latestAssessment.get(profile.id);
      const plan = latestPlan.get(profile.id);
      return [
        {
          id: profile.id,
          displayName: profile.display_name,
          emailMasked: maskEmail(profile.email),
          status: accountStatus(user),
          onboardingStatus: profile.onboarding_status,
          onboardingStep: profile.onboarding_step,
          targetExam: target.get(profile.id) ?? null,
          diagnosticStatus: assessment?.status ?? null,
          diagnosticCoverage: assessment?.diagnostic_coverage ?? null,
          diagnosticCompletedAt: assessment?.completed_at ?? null,
          planStatus: plan?.status ?? null,
          planId: plan?.id ?? null,
          lastActivityAt: latestEvent.get(profile.id) ?? null,
          lastAccessAt: user.last_sign_in_at ?? null,
          createdAt: profile.created_at,
        },
      ];
    });
  };

  const mentors = async (actorId: string): Promise<AdminMentorList> => {
    await authorize(actorId);
    const [
      mentorRows,
      specialties,
      areas,
      contents,
      versions,
      reviews,
      requests,
    ] = await Promise.all([
      rest<
        {
          user_id: string;
          professional_name: string;
          authorization_status: string;
          specialty_id: string | null;
        }[]
      >(
        'mentor_profiles?select=user_id,professional_name,authorization_status,specialty_id',
      ),
      rest<{ id: string; name: string }[]>('specialties?select=id,name'),
      rest<
        {
          specialty_id: string;
          medical_areas: { name: string } | null;
        }[]
      >('specialty_areas?select=specialty_id,medical_areas(name)'),
      rest<
        {
          id: string;
          assigned_mentor_id: string | null;
          current_published_version_id: string | null;
        }[]
      >(
        'learning_contents?select=id,assigned_mentor_id,current_published_version_id',
      ),
      rest<
        {
          content_id: string;
          editorial_status: string;
          video: unknown;
        }[]
      >('learning_content_versions?select=content_id,editorial_status,video'),
      rest<{ mentor_id: string; created_at: string }[]>(
        'content_reviews?select=mentor_id,created_at',
      ),
      rest<{ content_id: string; active: boolean }[]>(
        'content_review_requests?select=content_id,active',
      ),
    ]);
    const specialtyNames = new Map(
      specialties.map((item) => [item.id, item.name]),
    );
    const versionsByContent = new Map<string, (typeof versions)[number][]>();
    for (const version of versions)
      versionsByContent.set(version.content_id, [
        ...(versionsByContent.get(version.content_id) ?? []),
        version,
      ]);
    const items: MentorSummary[] = mentorRows.map((mentor) => {
      const owned = contents.filter(
        ({ assigned_mentor_id }) => assigned_mentor_id === mentor.user_id,
      );
      const ownedIds = new Set(owned.map(({ id }) => id));
      const mentorReviews = reviews
        .filter(({ mentor_id }) => mentor_id === mentor.user_id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
      const ownedVersions = owned.flatMap(
        ({ id }) => versionsByContent.get(id) ?? [],
      );
      return {
        id: mentor.user_id,
        professionalName: mentor.professional_name,
        status: mentor.authorization_status,
        specialty: mentor.specialty_id
          ? (specialtyNames.get(mentor.specialty_id) ?? null)
          : null,
        areas: areas
          .filter(({ specialty_id }) => specialty_id === mentor.specialty_id)
          .flatMap(({ medical_areas }) =>
            medical_areas?.name ? [medical_areas.name] : [],
          ),
        assignedContents: owned.length,
        publishedContents: owned.filter(
          ({ current_published_version_id }) =>
            current_published_version_id !== null,
        ).length,
        pendingReviews: ownedVersions.filter(
          ({ editorial_status }) =>
            editorial_status === 'awaiting_mentor_review',
        ).length,
        completedReviews: mentorReviews.length,
        lastReviewAt: mentorReviews[0]?.created_at ?? null,
        studentRequests: requests.filter(
          ({ content_id, active }) => active && ownedIds.has(content_id),
        ).length,
        videos: {
          value: ownedVersions.filter(({ video }) => video !== null).length,
          available: true,
          note: 'Vídeos registrados nas versões atribuídas.',
        },
        questions: {
          value: null,
          available: false,
          note: 'A relação direta entre mentor e questões ainda não existe.',
        },
        averageReviewMinutes: {
          value: null,
          available: false,
          note: 'O início da revisão ainda não é registrado.',
        },
      };
    });
    return { items, total: items.length };
  };

  return {
    authorize,
    async overview(actorId: string): Promise<AdminOverview> {
      await authorize(actorId);
      const [
        students,
        assessments,
        plans,
        items,
        mentorRows,
        versions,
        requests,
        references,
        jobs,
      ] = await Promise.all([
        studentRows(),
        rest<{ status: string }[]>('diagnostic_assessments?select=status'),
        rest<{ status: string }[]>('study_plans?select=status'),
        rest<{ status: string }[]>('study_plan_items?select=status'),
        rest<{ authorization_status: string }[]>(
          'mentor_profiles?select=authorization_status',
        ),
        rest<
          {
            editorial_status: string;
            ai_assisted: boolean;
            created_at: string;
          }[]
        >(
          'learning_content_versions?select=editorial_status,ai_assisted,created_at',
        ),
        rest<{ active: boolean }[]>('content_review_requests?select=active'),
        rest<{ verification_status: string }[]>(
          'content_references?select=verification_status',
        ),
        rest<
          {
            status: string;
            input_tokens: number | null;
            output_tokens: number | null;
          }[]
        >('content_generation_jobs?select=status,input_tokens,output_tokens'),
      ]);
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const activeCutoff = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      const completedItems = items.filter(
        ({ status }) => status === 'completed',
      ).length;
      const actionableItems = items.filter(
        ({ status }) => status !== 'unallocated',
      ).length;
      const unavailable = (note: string) => ({
        value: null,
        available: false,
        note,
      });
      return {
        generatedAt: now.toISOString(),
        students: {
          registered: students.length,
          activeLast30Days: students.filter(
            ({ lastAccessAt }) =>
              lastAccessAt && new Date(lastAccessAt).getTime() >= activeCutoff,
          ).length,
          newToday: students.filter(({ createdAt }) =>
            createdAt.startsWith(today),
          ).length,
          diagnosticsCompleted: assessments.filter(
            ({ status }) => status === 'completed',
          ).length,
          diagnosticsInProgress: assessments.filter(
            ({ status }) => status === 'active',
          ).length,
          activePlans: plans.filter(({ status }) => status === 'active').length,
          activitiesCompleted: completedItems,
          completionRate:
            actionableItems > 0 ? completedItems / actionableItems : null,
          inactive: students.filter(
            ({ lastAccessAt }) =>
              !lastAccessAt || new Date(lastAccessAt).getTime() < activeCutoff,
          ).length,
        },
        mentors: {
          active: mentorRows.filter(
            ({ authorization_status }) => authorization_status === 'authorized',
          ).length,
          awaitingReview: versions.filter(
            ({ editorial_status }) =>
              editorial_status === 'awaiting_mentor_review',
          ).length,
          pendingRequests: requests.filter(({ active }) => active).length,
        },
        editorial: {
          published: versions.filter(
            ({ editorial_status }) => editorial_status === 'published',
          ).length,
          drafts: versions.filter(({ editorial_status }) =>
            ['draft', 'ai_draft'].includes(editorial_status),
          ).length,
          inReview: versions.filter(({ editorial_status }) =>
            ['editorial_review', 'awaiting_mentor_review'].includes(
              editorial_status,
            ),
          ).length,
          readyToPublish: versions.filter(
            ({ editorial_status }) => editorial_status === 'mentor_approved',
          ).length,
          pendingReferences: references.filter(
            ({ verification_status }) => verification_status !== 'verified',
          ).length,
          newVersionsLast30Days: versions.filter(
            ({ created_at }) => new Date(created_at).getTime() >= activeCutoff,
          ).length,
        },
        ai: {
          drafts: versions.filter(
            ({ editorial_status, ai_assisted }) =>
              ai_assisted && ['draft', 'ai_draft'].includes(editorial_status),
          ).length,
          awaitingReview: versions.filter(
            ({ editorial_status, ai_assisted }) =>
              ai_assisted && editorial_status === 'awaiting_mentor_review',
          ).length,
          approved: versions.filter(
            ({ editorial_status, ai_assisted }) =>
              ai_assisted &&
              ['mentor_approved', 'published'].includes(editorial_status),
          ).length,
          rejected: versions.filter(
            ({ editorial_status, ai_assisted }) =>
              ai_assisted && editorial_status === 'mentor_rejected',
          ).length,
          queued: jobs.filter(({ status }) =>
            ['queued', 'running'].includes(status),
          ).length,
          usage: {
            value: jobs.reduce(
              (sum, job) =>
                sum + (job.input_tokens ?? 0) + (job.output_tokens ?? 0),
              0,
            ),
            available: true,
            note: 'Tokens registrados em trabalhos editoriais.',
          },
        },
        platform: {
          health: 'ok',
          ready: 'ready',
          buildSha: environment.BUILD_SHA,
          migrationBaseline: environment.MIGRATION_BASELINE,
          failures: unavailable(
            'Telemetria agregada ainda não está disponível.',
          ),
          averageResponseTimeMs: unavailable(
            'A latência ainda não está consolidada.',
          ),
        },
      };
    },

    async students(
      actorId: string,
      input: {
        page: number;
        pageSize: number;
        search?: string;
        status?: AccountStatus;
        sort: 'name' | 'created' | 'lastAccess';
      },
    ): Promise<AdminStudentList> {
      await authorize(actorId);
      let rows = await studentRows();
      const search = input.search?.toLocaleLowerCase('pt-BR');
      if (search)
        rows = rows.filter(({ displayName, emailMasked }) =>
          `${displayName} ${emailMasked}`
            .toLocaleLowerCase('pt-BR')
            .includes(search),
        );
      if (input.status)
        rows = rows.filter(({ status }) => status === input.status);
      rows.sort((left, right) => {
        if (input.sort === 'name')
          return left.displayName.localeCompare(right.displayName, 'pt-BR');
        const leftDate =
          input.sort === 'created' ? left.createdAt : left.lastAccessAt;
        const rightDate =
          input.sort === 'created' ? right.createdAt : right.lastAccessAt;
        return (rightDate ?? '').localeCompare(leftDate ?? '');
      });
      const start = (input.page - 1) * input.pageSize;
      return {
        items: rows.slice(start, start + input.pageSize),
        page: input.page,
        pageSize: input.pageSize,
        total: rows.length,
      };
    },

    async student(
      actorId: string,
      studentId: string,
      requestId: string,
    ): Promise<AdminStudentDetail | null> {
      const actor = await authorize(actorId);
      const summary = (await studentRows()).find(({ id }) => id === studentId);
      if (!summary) return null;
      const [events, actions, planItems] = await Promise.all([
        rest<{ id: string }[]>(
          `learning_events?select=id&student_id=eq.${studentId}`,
        ),
        rest<{ actual_minutes: number | null }[]>(
          `study_plan_item_actions?select=actual_minutes&student_id=eq.${studentId}&action=eq.completed`,
        ),
        summary.planId
          ? rest<{ status: string }[]>(
              `study_plan_items?select=status,study_plan_versions!inner(plan_id)&study_plan_versions.plan_id=eq.${summary.planId}`,
            )
          : [],
      ]);
      await audit(
        actorId,
        actor.role,
        'student_detail_viewed',
        studentId,
        requestId,
        null,
        null,
      );
      return {
        ...summary,
        planItemsTotal: planItems.length,
        planItemsCompleted: planItems.filter(
          ({ status }) => status === 'completed',
        ).length,
        studyMinutes: actions.reduce(
          (sum, item) => sum + (item.actual_minutes ?? 0),
          0,
        ),
        learningEvents: events.length,
      };
    },

    mentors,
    async mentor(actorId: string, mentorId: string) {
      const result = await mentors(actorId);
      return result.items.find(({ id }) => id === mentorId) ?? null;
    },

    async users(
      actorId: string,
    ): Promise<{ items: AdminUser[]; total: number }> {
      await authorize(actorId);
      const [users, profiles, roles] = await Promise.all([
        listAuthUsers(),
        rest<
          Pick<ProfileRow, 'id' | 'display_name' | 'email' | 'created_at'>[]
        >('profiles?select=id,display_name,email,created_at'),
        rolesForUsers(),
      ]);
      const names = new Map(profiles.map((item) => [item.id, item]));
      const items = users.flatMap((user) => {
        const profile = names.get(user.id);
        if (!profile || !user.email) return [];
        return [
          {
            id: user.id,
            displayName: profile.display_name,
            email: user.email,
            status: accountStatus(user),
            roles: roles.get(user.id) ?? [],
            lastAccessAt: user.last_sign_in_at ?? null,
            createdAt: user.created_at,
          },
        ];
      });
      return { items, total: items.length };
    },

    async invite(
      actorId: string,
      input: {
        email: string;
        displayName: string;
        role: 'mentor' | 'editor' | 'admin';
      },
      requestId: string,
    ) {
      const actor = await authorize(actorId);
      if (input.role === 'admin' && !actor.elevated)
        throw new AdminRepositoryError(
          'ADMIN_ELEVATED_REQUIRED',
          'Permissão elevada necessária.',
        );
      const user = await auth<AuthUser>(
        `invite?redirect_to=${encodeURIComponent('https://go.iatron.com.br/auth/callback?next=/app')}`,
        {
          method: 'POST',
          body: JSON.stringify({
            email: input.email,
            data: { display_name: input.displayName },
          }),
        },
      );
      await rest<null>('user_roles', {
        method: 'POST',
        headers: {
          prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({
          user_id: user.id,
          role: input.role,
          granted_by: actorId,
        }),
      });
      await rest<null>(`user_roles?user_id=eq.${user.id}&role=eq.student`, {
        method: 'DELETE',
        headers: { prefer: 'return=minimal' },
      });
      await audit(
        actorId,
        actor.role,
        'user_invited',
        user.id,
        requestId,
        null,
        input.role,
        { delivery: 'email' },
      );
      return { id: user.id, status: 'invited' };
    },

    async setEnabled(
      actorId: string,
      userId: string,
      enabled: boolean,
      requestId: string,
    ) {
      const actor = await authorize(actorId);
      if (!enabled && actorId === userId)
        throw new AdminRepositoryError(
          'ADMIN_SELF_DISABLE',
          'Não é possível desativar a própria conta.',
        );
      const target = await getAuthUser(userId);
      const targetRoles = (
        await rest<{ role: AppRole }[]>(
          `user_roles?select=role&user_id=eq.${userId}`,
        )
      ).map(({ role }) => role);
      if (
        !enabled &&
        targetRoles.some((role) => ['admin', 'super_admin'].includes(role))
      )
        await assertNotLastActiveAdmin(userId);
      await auth<AuthUser>(`admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ban_duration: enabled ? 'none' : '876000h',
        }),
      });
      await audit(
        actorId,
        actor.role,
        enabled ? 'user_enabled' : 'user_disabled',
        userId,
        requestId,
        accountStatus(target),
        enabled ? 'active' : 'disabled',
      );
      return { id: userId, status: enabled ? 'active' : 'disabled' };
    },

    async resetAccess(actorId: string, userId: string, requestId: string) {
      const actor = await authorize(actorId);
      const target = await getAuthUser(userId);
      if (!target.email)
        throw new AdminRepositoryError(
          'ADMIN_NOT_FOUND',
          'Conta não encontrada.',
        );
      await auth<null>(
        `recover?redirect_to=${encodeURIComponent('https://go.iatron.com.br/auth/callback?next=/redefinir-senha')}`,
        {
          method: 'POST',
          body: JSON.stringify({ email: target.email }),
        },
      );
      await audit(
        actorId,
        actor.role,
        'access_reset_requested',
        userId,
        requestId,
        null,
        'recovery_email_requested',
        { delivery: 'email' },
      );
      return { id: userId, status: 'recovery_requested' };
    },

    async updateRoles(
      actorId: string,
      userId: string,
      roles: AppRole[],
      requestId: string,
    ) {
      const actor = await authorize(actorId);
      const previous = (
        await rest<{ role: AppRole }[]>(
          `user_roles?select=role&user_id=eq.${userId}`,
        )
      ).map(({ role }) => role);
      const changesAdmin =
        previous.some((role) => ['admin', 'super_admin'].includes(role)) !==
          roles.some((role) => ['admin', 'super_admin'].includes(role)) ||
        roles.includes('super_admin');
      if (changesAdmin && !actor.elevated)
        throw new AdminRepositoryError(
          'ADMIN_ELEVATED_REQUIRED',
          'Permissão elevada necessária.',
        );
      if (
        actorId === userId &&
        previous.some((role) => ['admin', 'super_admin'].includes(role)) &&
        !roles.some((role) => ['admin', 'super_admin'].includes(role))
      )
        throw new AdminRepositoryError(
          'ADMIN_SELF_ROLE_REMOVAL',
          'Não é possível remover o próprio acesso administrativo.',
        );
      if (
        previous.some((role) => ['admin', 'super_admin'].includes(role)) &&
        !roles.some((role) => ['admin', 'super_admin'].includes(role))
      )
        await assertNotLastActiveAdmin(userId);
      await rest<null>('user_roles', {
        method: 'POST',
        headers: {
          prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(
          roles.map((role) => ({
            user_id: userId,
            role,
            granted_by: actorId,
          })),
        ),
      });
      for (const role of previous.filter((role) => !roles.includes(role)))
        await rest<null>(`user_roles?user_id=eq.${userId}&role=eq.${role}`, {
          method: 'DELETE',
          headers: { prefer: 'return=minimal' },
        });
      await audit(
        actorId,
        actor.role,
        'user_roles_changed',
        userId,
        requestId,
        previous.sort().join(','),
        [...roles].sort().join(','),
      );
      return { id: userId, status: 'roles_updated' };
    },

    async auditEvents(actorId: string) {
      await authorize(actorId);
      return rest<
        {
          id: string;
          actor_id: string;
          action: string;
          resource_id: string;
          previous_state: string | null;
          next_state: string | null;
          created_at: string;
          request_id: string;
        }[]
      >(
        'editorial_audit_events?select=id,actor_id,action,resource_id,previous_state,next_state,created_at,request_id&resource_type=eq.admin_user&order=created_at.desc&limit=100',
      );
    },
  };
}

export type AdminRepository = ReturnType<typeof createAdminRepository>;
