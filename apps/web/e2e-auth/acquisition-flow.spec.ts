import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';

// Authenticated traces can contain session tokens; publish only explicit screenshots.
test.use({ trace: 'off' });

const supabaseUrl = process.env.E2E_SUPABASE_URL!;
const publishableKey = process.env.E2E_SUPABASE_PUBLISHABLE_KEY!;
const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY!;
const apiBaseUrl = process.env.E2E_API_BASE_URL!;
const mailboxUrl = process.env.MAILPIT_URL;
const entry = '/app/assessment/entry';
const createdIds = new Set<string>();
const fixtureEmails = new Set<string>();

type AdminUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
};

async function admin(path: string, init: RequestInit = {}) {
  if (!serviceRoleKey)
    throw new Error('Fixture administrativa E2E não configurada.');
  return fetch(`${supabaseUrl}/auth/v1/admin${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      'content-type': 'application/json',
      ...init.headers,
    },
  });
}

function credentials() {
  const email = `acquisition-${Date.now()}-${crypto.randomUUID().slice(0, 8)}@example.com`;
  fixtureEmails.add(email);
  return { email, password: `Acquisition-${crypto.randomUUID()}-Aa1!` };
}

async function findFixtureUser(email: string): Promise<AdminUser | undefined> {
  for (let page = 1; page <= 100; page += 1) {
    const response = await admin(`/users?page=${page}&per_page=200`);
    expect(response.ok).toBeTruthy();
    const { users } = (await response.json()) as { users: AdminUser[] };
    const user = users.find((candidate) => candidate.email === email);
    if (user) {
      createdIds.add(user.id);
      return user;
    }
    if (users.length < 200) return undefined;
  }
  throw new Error(
    'Não foi possível localizar a fixture de cadastro no limite de páginas.',
  );
}

async function completeOnboarding(page: Page) {
  await expect(page).toHaveURL(/\/app\/onboarding/);
  expect(new URL(page.url()).searchParams.get('returnTo')).toBe(entry);
  await page.getByLabel('Nome completo').fill('Estudante Aquisição');
  await page.getByRole('button', { name: 'Salvar e continuar' }).click();
  await page
    .getByRole('radio', { name: /Estudo praticamente todos os dias/ })
    .click();
  await page.getByRole('button', { name: 'Salvar e continuar' }).click();
  await page.getByLabel('Buscar prova, instituição ou cidade').fill('AMRIGS');
  await page.getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Salvar e continuar' }).click();
  await page.getByRole('button', { name: 'Começar minha preparação' }).click();
  await expect(page).toHaveURL(/\/app\/assessment\/start$/);
}

async function accessToken(
  request: APIRequestContext,
  email: string,
  password: string,
) {
  const response = await request.post(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    { headers: { apikey: publishableKey }, data: { email, password } },
  );
  expect(response.ok()).toBeTruthy();
  return ((await response.json()) as { access_token: string }).access_token;
}

async function assessmentHistory(request: APIRequestContext, token: string) {
  const response = await request.get(
    `${apiBaseUrl.replace(/\/$/, '')}/v1/assessments`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as Array<{
    id: string;
    status: string;
    answeredCount: number;
  }>;
}

async function enterFromLanding(page: Page) {
  await page.goto('/');
  await page.locator('[data-diagnostic-cta="hero"]').click();
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll, JSON.stringify(dimensions)).toBeLessThanOrEqual(
    dimensions.width,
  );
}

async function answerFirstOption(page: Page) {
  const question = page.getByRole('heading', { name: /Questão \d+ de/ });
  await expect(question).toBeVisible();
  const previous = await question.textContent();
  await page.locator('input[name="selectedOptionId"]').first().check();
  await page.getByLabel(/Quão seguro você está/).selectOption('medium');
  await page.getByRole('button', { name: 'Confirmar resposta' }).click();
  await expect
    .poll(() => page.locator('main h1').first().textContent())
    .not.toBe(previous);
}

// Supports current Mailpit and the legacy Inbucket local Supabase image.
async function confirmationLink(
  request: APIRequestContext,
  email: string,
): Promise<string | null> {
  if (!mailboxUrl) return null;
  let body: string | undefined;
  const list = await request.get(`${mailboxUrl}/api/v1/messages`);
  if (list.ok()) {
    const inbox = (await list.json()) as {
      messages: Array<{ ID: string; To: Array<{ Address: string }> }>;
    };
    const message = inbox.messages.find((item) =>
      item.To.some((recipient) => recipient.Address === email),
    );
    if (!message) return null;
    const detail = await request.get(
      `${mailboxUrl}/api/v1/message/${message.ID}`,
    );
    expect(detail.ok()).toBeTruthy();
    const content = (await detail.json()) as { HTML?: string; Text?: string };
    body = content.HTML || content.Text;
  } else {
    const mailbox = encodeURIComponent(email.split('@')[0]!);
    const legacy = await request.get(`${mailboxUrl}/api/v1/mailbox/${mailbox}`);
    expect(
      legacy.ok(),
      'Mailpit/Inbucket local precisa estar disponível para validar confirmação real.',
    ).toBeTruthy();
    const messages = (await legacy.json()) as Array<{ id: string }>;
    if (!messages.length) return null;
    const detail = await request.get(
      `${mailboxUrl}/api/v1/mailbox/${mailbox}/${messages.at(-1)!.id}`,
    );
    expect(detail.ok()).toBeTruthy();
    const content = (await detail.json()) as {
      body: { html?: string; text?: string };
    };
    body = content.body.html || content.body.text;
  }
  const urls = body?.match(/https?:\/\/[^\s"'<>]+/g) ?? [];
  for (const raw of urls) {
    const url = new URL(raw.replaceAll('&amp;', '&'));
    if (
      url.origin === new URL(supabaseUrl).origin &&
      url.pathname === '/auth/v1/verify'
    )
      return url.toString();
  }
  return null;
}

test('aquisição real preserva intenção, progresso e resultado sem criar avaliações duplicadas', async ({
  page,
  request,
}, testInfo) => {
  const events: string[] = [];
  await page.exposeFunction('captureAcquisitionEvent', (name: string) => {
    if (
      [
        'diagnostic_started',
        'diagnostic_completed',
        'diagnostic_cta_click',
        'diagnostic_entry_view',
        'diagnostic_result_viewed',
        'study_path_opened',
      ].includes(name)
    )
      events.push(name);
  });
  await page.addInitScript(() => {
    window.addEventListener('iatron:acquisition-event', (event) => {
      const detail: unknown = (event as CustomEvent<unknown>).detail;
      if (
        typeof detail === 'object' &&
        detail !== null &&
        'name' in detail &&
        typeof detail.name === 'string'
      ) {
        void (
          window as Window & {
            captureAcquisitionEvent: (name: string) => Promise<void>;
          }
        ).captureAcquisitionEvent(detail.name);
      }
    });
  });
  const count = (name: string) =>
    events.filter((event) => event === name).length;
  const { email, password } = credentials();
  const created = await admin('/users', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: 'Estudante Aquisição' },
    }),
  });
  expect(created.ok).toBeTruthy();
  createdIds.add(((await created.json()) as AdminUser).id);
  await enterFromLanding(page);
  await expect(page).toHaveURL(/\/login\?/);
  expect(new URL(page.url()).searchParams.get('returnTo')).toBe(entry);
  await page.screenshot({
    caret: 'initial',
    path: testInfo.outputPath('acquisition-login.png'),
    fullPage: true,
  });
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha', { exact: true }).fill('Wrong-password1!');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByText('E-mail ou senha inválidos.')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('returnTo')).toBe(entry);
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await completeOnboarding(page);
  await expect(
    page.getByRole('heading', { name: 'Diagnóstico inicial', level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Começar meu diagnóstico', exact: true }),
  ).toBeVisible();
  await page
    .locator('main')
    .screenshot({
      caret: 'initial',
      path: testInfo.outputPath('acquisition-intro.png'),
    });
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole('button', { name: 'Começar meu diagnóstico', exact: true })
    .click();
  await expect(page).toHaveURL(/\/app\/assessment\/session\?id=/);
  await expect.poll(() => count('diagnostic_started')).toBe(1);
  await expect(
    page.getByRole('heading', { name: /Questão \d+ de/, level: 1 }),
  ).toBeVisible();
  await expect(
    page.locator('input[name="selectedOptionId"]').first(),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page
    .locator('main')
    .screenshot({
      caret: 'initial',
      path: testInfo.outputPath('acquisition-question-mobile.png'),
    });
  const id = new URL(page.url()).searchParams.get('id');
  expect(id).toBeTruthy();
  const token = await accessToken(request, email, password);
  await answerFirstOption(page);
  await enterFromLanding(page);
  await expect(
    page.getByRole('heading', { name: 'Continue de onde parou' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Retomar de onde parei' }).click();
  await expect(page).toHaveURL(
    new RegExp(`/app/assessment/session\\?id=${id}$`),
  );
  // Quick screening hides the pause control; use the real authenticated pause API to exercise entry recovery.
  const paused = await request.post(
    `${apiBaseUrl.replace(/\/$/, '')}/v1/assessments/${id}/pause`,
    {
      headers: { authorization: `Bearer ${token}` },
    },
  );
  expect(paused.status()).toBe(204);
  expect(
    (await assessmentHistory(request, token)).find((item) => item.id === id)
      ?.status,
  ).toBe('paused');
  await enterFromLanding(page);
  await page.getByRole('button', { name: 'Retomar de onde parei' }).click();
  await expect(page).toHaveURL(
    new RegExp(`/app/assessment/session\\?id=${id}$`),
  );
  expect(count('diagnostic_started')).toBe(1);
  expect(count('diagnostic_completed')).toBe(0);
  const resumed = await assessmentHistory(request, token);
  expect(resumed).toHaveLength(1);
  expect(resumed[0]).toMatchObject({ id, answeredCount: 1, status: 'active' });
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const finish = page.getByRole('button', {
      name: 'Ver meu resultado',
      exact: true,
    });
    if (await finish.isVisible()) {
      await finish.click();
      break;
    }
    await answerFirstOption(page);
  }
  await expect(page).toHaveURL(
    new RegExp(`/app/assessment/result\\?id=${id}$`),
  );
  await expect.poll(() => count('diagnostic_completed')).toBe(1);
  const resultResponse = await request.get(
    `${apiBaseUrl.replace(/\/$/, '')}/v1/assessments/${id}/result`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  expect(resultResponse.ok()).toBeTruthy();
  const evidence = (await resultResponse.json()) as {
    completionReason: string;
    evidenceSufficient: boolean;
  };
  if (evidence.completionReason === 'content_exhausted')
    expect(evidence.evidenceSufficient).toBe(false);
  if (!evidence.evidenceSufficient)
    await expect(
      page.getByRole('heading', { name: 'Este retrato ainda é parcial' }),
    ).toBeVisible();

  await expect(
    page.getByRole('heading', {
      name: 'Agora já conhecemos seu ponto de partida',
      level: 1,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', {
      name: 'Ver minha trilha de estudos',
      exact: true,
    }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page
    .locator('main')
    .screenshot({
      caret: 'initial',
      path: testInfo.outputPath('acquisition-result-mobile.png'),
    });
  await enterFromLanding(page);
  await expect(
    page.getByRole('heading', {
      name: 'Seu ponto de partida já está registrado',
    }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Ver meu diagnóstico', exact: true })
    .click();
  await expect(page).toHaveURL(
    new RegExp(`/app/assessment/result\\?id=${id}$`),
  );
  const completed = await assessmentHistory(request, token);
  expect(completed).toHaveLength(1);
  expect(completed[0]).toMatchObject({ id, status: 'completed' });
  expect(count('diagnostic_started')).toBe(1);
  expect(count('diagnostic_completed')).toBe(1);
  await page
    .getByRole('link', { name: 'Ver minha trilha de estudos', exact: true })
    .click();
  await expect(page).toHaveURL(/\/app\/plan$/);
  await expect(
    page.getByRole('heading', {
      name: 'Seu plano está pronto para ser criado',
    }),
  ).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(count('study_path_opened')).toBe(0);
  await page
    .getByRole('button', { name: 'Criar meu plano', exact: true })
    .click();
  await expect(page).toHaveURL(/\/app\/plan\/week$/);
  await expect(
    page.getByRole('heading', { name: 'Próximos sete dias', level: 1 }),
  ).toBeVisible();
  await expect.poll(() => count('study_path_opened')).toBe(1);
  await expectNoHorizontalOverflow(page);
  await page
    .locator('main')
    .screenshot({
      caret: 'initial',
      path: testInfo.outputPath('acquisition-plan-mobile.png'),
    });
  await testInfo.attach('acquisition-events', {
    body: JSON.stringify(
      {
        events,
        started: count('diagnostic_started'),
        completed: count('diagnostic_completed'),
        studyPathOpened: count('study_path_opened'),
      },
      null,
      2,
    ),
    contentType: 'application/json',
  });
});

test('cadastro confirma e-mail real local e mantém intenção até o diagnóstico', async ({
  page,
  request,
}) => {
  test.skip(
    !mailboxUrl,
    'Entrega real de e-mail exige Mailpit/Inbucket local; não usar AdminAPI para fingir confirmação.',
  );
  const { email, password } = credentials();
  await enterFromLanding(page);
  await page.getByRole('link', { name: 'Começar agora', exact: true }).click();
  await expect(page).toHaveURL(/\/cadastro\?/);
  expect(new URL(page.url()).searchParams.get('returnTo')).toBe(entry);
  await page
    .getByLabel('Como devemos chamar você?')
    .fill('Estudante Aquisição');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha (mínimo de 8 caracteres)').fill(password);
  await page.getByRole('button', { name: 'Começar minha preparação' }).click();
  await expect(
    page.getByText('Confira seu e-mail para confirmar o cadastro.'),
  ).toBeVisible();
  expect(new URL(page.url()).searchParams.get('returnTo')).toBe(entry);
  await expect
    .poll(async () => (await findFixtureUser(email))?.id)
    .toBeTruthy();
  const pending = await findFixtureUser(email);
  expect(pending?.email_confirmed_at).toBeFalsy();
  let confirmation: string | null = null;
  await expect
    .poll(
      async () => {
        confirmation = await confirmationLink(request, email);
        return Boolean(confirmation);
      },
      { timeout: 30_000 },
    )
    .toBe(true);
  const verification = new URL(confirmation!);
  const redirect = new URL(verification.searchParams.get('redirect_to')!);
  const browserOrigin = new URL(page.url()).origin;
  expect(redirect.origin).toBe(browserOrigin);
  expect(redirect.pathname).toBe('/auth/callback');
  expect(redirect.searchParams.get('next')).toBe(entry);
  await page.goto(confirmation!);
  await completeOnboarding(page);
  expect(new URL(page.url()).origin).toBe(browserOrigin);
  expect((await findFixtureUser(email))?.email_confirmed_at).toBeTruthy();
  await expect(
    page.getByRole('button', { name: 'Começar meu diagnóstico', exact: true }),
  ).toBeVisible();
});

test.afterEach(async () => {
  // A signup may have succeeded even when a UI assertion failed. Locate only this run's unique emails.
  for (const email of fixtureEmails) await findFixtureUser(email);
  for (const id of createdIds) {
    const response = await admin(`/users/${id}`, { method: 'DELETE' });
    expect(response.ok).toBeTruthy();
  }
  createdIds.clear();
  fixtureEmails.clear();
});
