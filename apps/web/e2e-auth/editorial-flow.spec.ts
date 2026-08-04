import { expect, test, type Page, type TestInfo } from '@playwright/test';

const supabaseUrl = process.env.E2E_SUPABASE_URL!;
const publishableKey = process.env.E2E_SUPABASE_PUBLISHABLE_KEY!;
const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY!;
const apiBaseUrl = process.env.E2E_API_BASE_URL!;
const specialtyId = '50000000-0000-4000-8000-000000000001';
const competencyId = '54000000-0000-4000-8000-000000000005';
const canonicalKey = 'demo.sepsis.editorial-mvp';

const personas = {
  editor: {
    email: 'iatron.edtech+editorial-beta@gmail.com',
    name: 'Editorial Beta',
  },
  mentor: {
    email: 'iatron.edtech+mentor-beta@gmail.com',
    name: 'Mentor Beta',
  },
  admin: {
    email: 'iatron.edtech+admin-beta@gmail.com',
    name: 'Admin Beta',
  },
  student: {
    email: 'iatron.edtech+student-beta@gmail.com',
    name: 'Student Beta',
  },
} as const;

type Persona = keyof typeof personas;
type AdminUser = { id: string; email?: string };

const adminHeaders = {
  apikey: serviceRoleKey,
  authorization: `Bearer ${serviceRoleKey}`,
  'content-type': 'application/json',
};

async function service(path: string, init: RequestInit = {}) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: { ...adminHeaders, ...init.headers },
  });
  if (!response.ok)
    throw new Error(`Fixture editorial recusada: ${response.status} ${path}`);
  const body = await response.text();
  return body ? (JSON.parse(body) as unknown) : null;
}

async function ensureUser(persona: Persona, password: string) {
  const listing = (await service(
    '/auth/v1/admin/users?page=1&per_page=1000',
  )) as { users: AdminUser[] };
  let user = listing.users.find(
    ({ email }) => email === personas[persona].email,
  );
  if (!user) {
    user = (await service('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: personas[persona].email,
        password,
        email_confirm: true,
        user_metadata: { display_name: personas[persona].name },
      }),
    })) as AdminUser;
  } else {
    await service(`/auth/v1/admin/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        password,
        email_confirm: true,
        user_metadata: { display_name: personas[persona].name },
      }),
    });
  }
  return user.id;
}

async function upsert(table: string, values: unknown) {
  await service(`/rest/v1/${table}`, {
    method: 'POST',
    headers: { prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(values),
  });
}

async function ensureSpecialtyOwner(mentorId: string) {
  const existing = (await service(
    `/rest/v1/medical_specialty_owners?select=id&specialty_id=eq.${specialtyId}&owner_role=eq.primary&status=eq.active`,
  )) as { id: string }[];
  const values = {
    specialty_id: specialtyId,
    mentor_id: mentorId,
    owner_role: 'primary',
    status: 'active',
    authorization_reference: 'e2e:documented-beta-authorization',
  };
  if (existing[0]) {
    await service(`/rest/v1/medical_specialty_owners?id=eq.${existing[0].id}`, {
      method: 'PATCH',
      body: JSON.stringify(values),
    });
    return;
  }
  await service('/rest/v1/medical_specialty_owners', {
    method: 'POST',
    body: JSON.stringify(values),
  });
}

async function login(page: Page, persona: Persona, password: string) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(personas[persona].email);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

async function logout(page: Page) {
  const desktop = page.getByRole('button', { name: 'Sair da conta' });
  if (await desktop.isVisible().catch(() => false)) await desktop.click();
  else {
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page
      .getByTestId('mobile-drawer-layer')
      .getByRole('button', { name: 'Sair' })
      .click();
  }
  await expect(page).toHaveURL(/\/login/);
}

async function validateWorkspaceShell(
  page: Page,
  testInfo: TestInfo,
  workspace: string,
  path: string,
  role: string,
) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(path);
  await expect(
    page.getByRole('complementary', { name: 'Barra lateral' }),
  ).toBeVisible();
  await expect(page.getByText(role, { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Sair da conta' }),
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Breadcrumb' }),
  ).toBeVisible();
  const desktopWidth = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(desktopWidth.scroll).toBeLessThanOrEqual(desktopWidth.client);
  const contentScroll = await page
    .locator('.app-content')
    .evaluate((element) => {
      const container = element as HTMLElement;
      container.scrollTop = container.scrollHeight;
      return {
        clientHeight: container.clientHeight,
        overflowY: getComputedStyle(container).overflowY,
        scrollHeight: container.scrollHeight,
        scrollTop: container.scrollTop,
      };
    });
  expect(contentScroll.overflowY).toBe('auto');
  if (contentScroll.scrollHeight > contentScroll.clientHeight)
    expect(contentScroll.scrollTop).toBeGreaterThan(0);
  await page.locator('.app-content').evaluate((element) => {
    (element as HTMLElement).scrollTop = 0;
  });
  await testInfo.attach(`${workspace}-desktop`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeVisible();
  const mobileWidth = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(mobileWidth.scroll).toBeLessThanOrEqual(mobileWidth.client);
  await testInfo.attach(`${workspace}-mobile-390`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  const drawer = page.getByRole('dialog', { name: 'Menu de navegação' });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText(role, { exact: true })).toBeVisible();
  await expect(drawer.getByRole('button', { name: 'Sair' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await page.setViewportSize({ width: 1280, height: 900 });
}

test('os quatro perfis compartilham shell, scroll, navegação e logout', async ({
  page,
}, testInfo) => {
  const password = `Workspace-${crypto.randomUUID()}-Aa1!`;
  const editorId = await ensureUser('editor', password);
  const mentorId = await ensureUser('mentor', password);
  const adminId = await ensureUser('admin', password);
  const studentId = await ensureUser('student', password);
  await upsert('user_roles', [
    { user_id: editorId, role: 'editor' },
    { user_id: mentorId, role: 'mentor' },
    { user_id: adminId, role: 'admin' },
  ]);
  await service(
    `/rest/v1/profiles?id=in.(${editorId},${mentorId},${adminId},${studentId})`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        onboarding_status: 'completed',
        onboarding_step: 4,
      }),
    },
  );

  await login(page, 'editor', password);
  await validateWorkspaceShell(
    page,
    testInfo,
    'editorial',
    '/editorial',
    'Editorial',
  );
  await page.goto('/editorial/content');
  await expect(
    page.getByRole('heading', { name: 'Criar conteúdo estruturado' }),
  ).toBeVisible();
  await page.goto('/editorial/library');
  await expect(page).toHaveURL(/\/editorial$/);
  await logout(page);

  await login(page, 'mentor', password);
  await validateWorkspaceShell(page, testInfo, 'mentor', '/review', 'Mentor');
  await page.getByRole('link', { name: /Minha fila/ }).click();
  await expect(page).toHaveURL(/\/review\/queue$/);
  await page.getByRole('link', { name: /Perfil/ }).click();
  await expect(page).toHaveURL(/\/review\/profile$/);
  await page.goto('/review/library');
  await expect(page).toHaveURL(/\/review$/);
  await logout(page);

  await login(page, 'admin', password);
  await validateWorkspaceShell(
    page,
    testInfo,
    'admin',
    '/admin',
    'Administrador',
  );
  await page.getByRole('link', { name: /Alunos/ }).click();
  await expect(page).toHaveURL(/\/admin\/students$/);
  await page.getByRole('link', { name: /Mentores/ }).click();
  await expect(page).toHaveURL(/\/admin\/mentors$/);
  await page.getByRole('link', { name: /Platform/ }).click();
  await expect(page).toHaveURL(/\/admin\/platform$/);
  await page.goto('/admin/library');
  await expect(page).toHaveURL(/\/admin$/);
  await logout(page);

  await login(page, 'student', password);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/app');
  await expect(
    page.getByRole('complementary', { name: 'Barra lateral' }),
  ).toBeVisible();
  await page.getByRole('link', { name: /Perfil/ }).click();
  await expect(page).toHaveURL(/\/app\/profile$/);
  const studentContent = page.locator('.app-content');
  await expect(studentContent).toHaveCSS('overflow-y', 'auto');
  await testInfo.attach('student-desktop', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
  await page.setViewportSize({ width: 390, height: 640 });
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  const drawer = page.getByRole('dialog', { name: 'Menu de navegação' });
  await expect(drawer.getByRole('button', { name: 'Sair' })).toBeVisible();
  await testInfo.attach('student-mobile-390', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
  await page.keyboard.press('Escape');
  await logout(page);
});

test('editor → mentor → admin → estudante: conteúdo versionado e revisão real', async ({
  page,
  request,
}, testInfo) => {
  const password = `Editorial-${crypto.randomUUID()}-Aa1!`;
  const editorId = await ensureUser('editor', password);
  const mentorId = await ensureUser('mentor', password);
  const adminId = await ensureUser('admin', password);
  const studentId = await ensureUser('student', password);
  await upsert('user_roles', [
    { user_id: editorId, role: 'editor' },
    { user_id: mentorId, role: 'mentor' },
    { user_id: adminId, role: 'admin' },
  ]);
  await upsert('mentor_profiles', {
    user_id: mentorId,
    specialty_id: specialtyId,
    professional_name: 'Mentor Médico de Demonstração',
    authorization_status: 'authorized',
    mfa_required: true,
  });
  await ensureSpecialtyOwner(mentorId);
  await service(
    `/rest/v1/profiles?id=in.(${editorId},${mentorId},${adminId},${studentId})`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        onboarding_status: 'completed',
        onboarding_step: 4,
      }),
    },
  );
  await service('/rest/v1/student_availability?on_conflict=user_id,weekday', {
    method: 'POST',
    headers: { prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(
      Array.from({ length: 7 }, (_, weekday) => ({
        user_id: studentId,
        weekday,
        minutes_available: 45,
      })),
    ),
  });

  const runKey = crypto.randomUUID();
  const runCanonicalKey = `${canonicalKey}.${runKey}`;

  // Editor cria rascunho sintético assistido, sem autoridade médica.
  await login(page, 'editor', password);
  await validateWorkspaceShell(
    page,
    testInfo,
    'editorial',
    '/editorial',
    'Editorial',
  );
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/app$/);
  await page.goto('/editorial/library');
  await expect(page).toHaveURL(/\/editorial$/);
  await expect(
    page.getByRole('heading', { name: 'Conteúdo médico em operação' }),
  ).toBeVisible();
  await page.goto('/editorial/content');
  await expect(
    page.getByRole('heading', { name: 'Criar conteúdo estruturado' }),
  ).toBeVisible();
  await page.getByLabel('Chave canônica').fill(runCanonicalKey);
  await page
    .getByLabel('Slug')
    .fill(`ressuscitacao-inicial-choque-septico-${runKey}`);
  await page
    .getByLabel('Título', { exact: true })
    .fill('Ressuscitação inicial do choque séptico');
  await page
    .getByLabel('Resumo')
    .fill(
      'Material sintético para validar uma experiência didática estruturada e auditável.',
    );
  await page.getByLabel('Duração estimada').fill('20');
  await page
    .getByLabel('Objetivo')
    .fill('Reconhecer as prioridades da ressuscitação inicial.');
  await page.getByLabel('Título da seção').fill('Primeiros passos');
  await page
    .getByLabel('Conteúdo da seção')
    .fill(
      'Conteúdo demonstrativo: organize a abordagem inicial, reconheça hipoperfusão e reavalie a resposta clínica. Este texto não é uma conduta assistencial.',
    );
  await page
    .getByLabel('Ponto-chave')
    .fill('Reavaliar continuamente a resposta clínica.');
  await page
    .getByLabel('Aplicação em prova')
    .fill('Questões costumam explorar a sequência de prioridades iniciais.');
  await page
    .getByLabel('Conclusão')
    .fill('Use esta revisão para organizar o raciocínio em provas.');
  await page.getByLabel('Especialidade (ID)').fill(specialtyId);
  await page.getByLabel('Competência (ID)').fill(competencyId);
  await page.getByLabel('Rascunho produzido com apoio de IA').check();
  await page.getByLabel('Material demonstrativo sintético').check();
  await page.getByRole('button', { name: 'Criar rascunho' }).click();
  await expect(page).toHaveURL(/\/editorial$/);

  const versions = (await service(
    `/rest/v1/learning_content_versions?select=id,content_id,content_hash,learning_contents!learning_content_versions_content_id_fkey!inner(canonical_key)&learning_contents.canonical_key=eq.${runCanonicalKey}`,
  )) as { id: string; content_id: string; content_hash: string }[];
  const version = versions[0]!;
  const referenceId = crypto.randomUUID();
  await upsert('content_references', {
    id: referenceId,
    title: 'Surviving Sepsis Campaign Guidelines 2021',
    authors_or_organization: 'Surviving Sepsis Campaign',
    reference_type: 'guideline',
    publication_year: 2021,
    url: 'https://www.sccm.org/clinical-resources/surviving-sepsis-campaign-guidelines-2021',
    origin: 'official_repository_seed',
    verification_status: 'verified',
    verified_by: editorId,
    verified_at: new Date().toISOString(),
    notes: 'Referência oficial já catalogada no repositório.',
  });
  await upsert('learning_content_version_references', {
    version_id: version.id,
    reference_id: referenceId,
    is_required: true,
    position: 1,
  });
  await upsert('content_reference_specialties', {
    reference_id: referenceId,
    specialty_id: specialtyId,
  });
  await page.getByLabel('ID do mentor autorizado').first().fill(mentorId);
  await page
    .getByRole('button', { name: 'Enviar para revisão' })
    .first()
    .click();
  await expect(page.getByText('awaiting_mentor_review')).toBeVisible();
  const emailEvents = (await service(
    `/rest/v1/editorial_email_events?select=event_type,idempotency_key&version_id=eq.${version.id}`,
  )) as { event_type: string; idempotency_key: string }[];
  expect(emailEvents).toHaveLength(1);
  expect(emailEvents[0]?.idempotency_key).toBe(
    `review-assignment:${version.id}`,
  );
  await logout(page);

  // Mentor autenticado revisa a versão exata.
  await login(page, 'mentor', password);
  await validateWorkspaceShell(page, testInfo, 'mentor', '/review', 'Mentor');
  await page.goto('/editorial');
  await expect(page).toHaveURL(/\/app$/);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/app$/);
  await page.goto('/review/library');
  await expect(page).toHaveURL(/\/review$/);
  await expect(page.getByRole('heading', { name: 'Bom dia' })).toBeVisible();
  await page.goto('/review');
  await page.getByRole('link', { name: 'Especialidades' }).click();
  await expect(
    page.getByRole('heading', { name: 'Suas especialidades' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Abrir especialidade' }).click();
  await expect(
    page.getByText('Responsáveis científicos:', { exact: false }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Minha fila' }).click();
  await page.getByRole('link', { name: 'Revisar esta versão' }).click();
  await expect(
    page.getByText(/Rascunho preparado com apoio de IA/),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Visualizar como aluno' }),
  ).toBeVisible();
  await page.getByLabel('Aprovar versão').check();
  await page.getByLabel(/Li e confirmo esta declaração/).check();
  await page.getByRole('button', { name: 'Confirmar decisão' }).click();
  await expect(page).toHaveURL(/\/review$/);
  const reviews = (await service(
    `/rest/v1/content_reviews?select=id,version_hash,decision&version_id=eq.${version.id}`,
  )) as { id: string; version_hash: string; decision: string }[];
  expect(reviews[0]).toMatchObject({
    decision: 'approved',
    version_hash: version.content_hash,
  });
  await logout(page);

  // Admin publica; aprovação e publicação permanecem separadas.
  await login(page, 'admin', password);
  await validateWorkspaceShell(
    page,
    testInfo,
    'admin',
    '/admin',
    'Administrador',
  );
  await page.goto('/admin');
  await expect(
    page.getByRole('heading', { name: 'Console administrativo' }),
  ).toBeVisible();
  await page.goto('/admin/library');
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole('heading', { name: 'Como está o Iatron hoje' }),
  ).toBeVisible();
  await page.goto('/admin');
  await expect(page.getByText('Fila editorial')).toHaveCount(0);
  await page.goto('/editorial');
  await page
    .getByRole('button', { name: 'Publicar versão aprovada' })
    .first()
    .click();
  let audit: { action: string }[] = [];
  await expect
    .poll(async () => {
      audit = (await service(
        `/rest/v1/editorial_audit_events?select=action&resource_id=eq.${version.content_id}`,
      )) as { action: string }[];
      return audit.map(({ action }) => action);
    })
    .toEqual(expect.arrayContaining(['published']));
  expect(audit.map(({ action }) => action)).toEqual(
    expect.arrayContaining([
      'created',
      'submitted_for_review',
      'mentor_approved',
      'published',
    ]),
  );
  await logout(page);

  // Cria um plano real e fixa a versão publicada na atividade.
  await service(
    `/rest/v1/study_plans?student_id=eq.${studentId}&status=eq.active`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status: 'superseded' }),
    },
  );
  const planId = crypto.randomUUID();
  const planVersionId = crypto.randomUUID();
  const itemId = crypto.randomUUID();
  const today = new Date().toISOString().slice(0, 10);
  await upsert('study_plans', {
    id: planId,
    student_id: studentId,
    objective: 'Validar material editorial',
    status: 'active',
    current_version: 1,
  });
  await upsert('study_plan_versions', {
    id: planVersionId,
    plan_id: planId,
    version: 1,
    period_start: today,
    period_end: today,
    status: 'current',
    total_planned_minutes: 20,
    total_available_minutes: 315,
    availability_snapshot: [],
    input_snapshot: {},
    input_hash: 'b'.repeat(64),
    trigger_reason: 'editorial_e2e',
    algorithm_version: 'study-plan-v1',
  });
  await upsert('study_plan_items', {
    id: itemId,
    plan_version_id: planVersionId,
    competency_id: competencyId,
    item_type: 'competency_study',
    priority: 0.9,
    estimated_minutes: 20,
    planned_date: today,
    position: 1,
    status: 'planned',
    recommendation_origin: 'learning_gap',
    justification: {
      reasons: [
        {
          code: 'gap_priority',
          contribution: 0.9,
          detail: 'Prioridade sintética do cenário editorial.',
        },
      ],
    },
    source_snapshot: {},
    algorithm_version: 'study-plan-v1',
  });
  await upsert('plan_item_material_versions', {
    plan_item_id: itemId,
    content_id: version.content_id,
    version_id: version.id,
  });

  // Estudante acessa conteúdo publicado, selo e conclui a atividade.
  await login(page, 'student', password);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/app');
  await expect(
    page.getByRole('complementary', { name: 'Barra lateral' }),
  ).toBeVisible();
  await testInfo.attach('student-desktop', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeVisible();
  await testInfo.attach('student-mobile-390', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
  for (const protectedRoute of ['/review', '/editorial', '/admin']) {
    await page.goto(protectedRoute);
    await expect(page).toHaveURL(/\/app$/);
  }
  await page.goto(`/app/plan/items/${itemId}`);
  await expect(
    page.getByRole('heading', {
      name: 'Ressuscitação inicial do choque séptico',
    }),
  ).toBeVisible();
  await page.getByText('✓ Revisado pelo Mentor').click();
  await expect(
    page.getByText(/Mentor Médico de Demonstração · Clínica Médica/),
  ).toBeVisible();
  await expect(
    page.getByText(/aula em vídeo ainda não está disponível/i),
  ).toBeVisible();
  await expect(
    page.getByText(/Surviving Sepsis Campaign Guidelines 2021/),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar atividade' }).click();
  await expect(page).toHaveURL(new RegExp(`/app/plan/items/${itemId}`));
  await page
    .getByRole('button', { name: 'Finalizar e atualizar minha jornada' })
    .click();
  await expect(page).toHaveURL(/\/app$/);
  const itemActions = (await service(
    `/rest/v1/study_plan_item_actions?select=action,learning_event_id&item_id=eq.${itemId}&order=occurred_at.asc`,
  )) as { action: string; learning_event_id: string }[];
  expect(itemActions.map(({ action }) => action)).toEqual([
    'started',
    'completed',
  ]);
  const activityEvents = (await service(
    `/rest/v1/learning_events?select=event_type&id=in.(${itemActions.map(({ learning_event_id }) => learning_event_id).join(',')})`,
  )) as { event_type: string }[];
  expect(activityEvents.map(({ event_type }) => event_type).sort()).toEqual([
    'StudyPlanItemStarted',
    'StudySessionCompleted',
  ]);

  // Mobile crítico: estudante, mentor, menu e ausência de overflow.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/app/plan/items/${itemId}`);
  const size = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(size.scroll).toBeLessThanOrEqual(size.client);
  await logout(page);
  await login(page, 'mentor', password);
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 414, height: 896 },
    { width: 768, height: 1024 },
    { width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/review');
    const reviewSize = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(reviewSize.scroll).toBeLessThanOrEqual(reviewSize.client);
  }

  const tokenResponse = await request.post(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      headers: { apikey: publishableKey },
      data: { email: personas.student.email, password },
    },
  );
  expect(tokenResponse.ok()).toBeTruthy();
  const accessToken = ((await tokenResponse.json()) as { access_token: string })
    .access_token;
  const publishedResponse = await request.get(
    `${apiBaseUrl}/v1/learning-content`,
    { headers: { authorization: `Bearer ${accessToken}` } },
  );
  expect(publishedResponse.ok()).toBeTruthy();
  const expiredSession = await request.get(`${apiBaseUrl}/v1/me`, {
    headers: { authorization: 'Bearer expired-private-beta-session' },
  });
  expect(expiredSession.status()).toBe(401);
  await expect(expiredSession.json()).resolves.toMatchObject({
    error: { code: 'AUTHENTICATION_ERROR' },
  });
  const recovery = await request.post(`${supabaseUrl}/auth/v1/recover`, {
    headers: { apikey: publishableKey },
    data: {
      email: personas.student.email,
      gotrue_meta_security: {},
    },
  });
  expect(recovery.ok()).toBeTruthy();
});
