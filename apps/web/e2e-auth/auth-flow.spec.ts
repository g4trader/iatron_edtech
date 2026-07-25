import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';

const supabaseUrl = process.env.E2E_SUPABASE_URL!;
const publishableKey = process.env.E2E_SUPABASE_PUBLISHABLE_KEY!;
const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY!;
const apiBaseUrl = process.env.E2E_API_BASE_URL!;
const createdUserIds = new Set<string>();

type AdminUser = { id: string };

async function adminRequest(path: string, init: RequestInit = {}) {
  if (!serviceRoleKey)
    throw new Error('Fixture administrativa de staging não configurada.');
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

async function createUser(email: string, password: string) {
  const response = await adminRequest('/users', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: 'Estudante Gate' },
    }),
  });
  expect(response.ok).toBeTruthy();
  const user = (await response.json()) as AdminUser;
  createdUserIds.add(user.id);
}

async function tokenFor(
  request: APIRequestContext,
  email: string,
  password: string,
) {
  const response = await request.post(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      headers: { apikey: publishableKey },
      data: { email, password },
    },
  );
  expect(response.ok()).toBeTruthy();
  return ((await response.json()) as { access_token: string }).access_token;
}

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

const journeyStep = (page: Page, label: string) =>
  page.getByRole('listitem').filter({ hasText: label });

async function expectNoHorizontalOverflow(page: Page) {
  const sizes = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(sizes.scroll, JSON.stringify(sizes)).toBeLessThanOrEqual(sizes.client);
}

test('critical journey: onboarding, diagnóstico, plano, persistência e mobile', async ({
  page,
  request,
}) => {
  const run = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const email = `critical-journey-${run}@example.com`;
  const password = `Gate-${crypto.randomUUID()}-Aa1!`;
  await createUser(email, password);

  // Cenário A — usuário novo e onboarding real.
  await login(page, email, password);
  await expect(page).toHaveURL(/\/app\/onboarding/);
  await page.getByLabel('Nome completo').fill('Estudante Gate');
  await page.getByRole('button', { name: 'Salvar e continuar' }).click();
  await page
    .getByRole('radio', { name: /Estudo praticamente todos os dias/ })
    .click();
  await page.getByRole('button', { name: 'Salvar e continuar' }).click();
  await page.getByLabel('Buscar prova, instituição ou cidade').fill('AMRIGS');
  await page.getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Salvar e continuar' }).click();
  await page.getByRole('button', { name: 'Começar minha preparação' }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(journeyStep(page, 'Perfil')).toContainText('Concluído');
  await expect(journeyStep(page, 'Banca')).toContainText('Concluído');
  await expect(journeyStep(page, 'Diagnóstico')).toContainText('Agora');

  // Cenário B — primeira resposta, segurança, retry e retomada.
  await page.getByRole('link', { name: 'Começar diagnóstico' }).click();
  await expect(
    page.getByRole('radio', { name: /Triagem rápida/ }),
  ).toBeChecked();
  await expect(
    page.getByRole('radio', { name: /Diagnóstico completo/ }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Descobrir meu ponto de partida' })
    .click();
  await expect(page).toHaveURL(/\/app\/assessment\/session/);
  const assessmentId = new URL(page.url()).searchParams.get('id');
  expect(assessmentId).toBeTruthy();
  const questionVersionId = await page
    .locator('input[name="questionVersionId"]')
    .inputValue();
  const firstOption = page.locator('input[name="selectedOptionId"]').first();
  const selectedOptionId = await firstOption.inputValue();
  await firstOption.check();
  await page.getByLabel(/Quão seguro você está/).selectOption('medium');
  await page.getByRole('button', { name: 'Confirmar resposta' }).click();

  const token = await tokenFor(request, email, password);
  const retry = await request.post(
    `${apiBaseUrl}/v1/assessments/${assessmentId}/answers`,
    {
      headers: { authorization: `Bearer ${token}` },
      data: {
        questionVersionId,
        selectedOptionId,
        responseTimeMs: 30_000,
        statedConfidence: 'medium',
      },
    },
  );
  expect(retry.status()).toBe(201);
  const historyAfterRetry = await request.get(`${apiBaseUrl}/v1/assessments`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const current = (
    (await historyAfterRetry.json()) as {
      id: string;
      answeredCount: number;
    }[]
  ).find(({ id }) => id === assessmentId);
  expect(current?.answeredCount).toBe(1);
  await page.reload();
  await expect(page).toHaveURL(/\/app\/assessment\/session/);

  // Cenário C — conclusão e retorno coerente à Jornada.
  for (let answered = 1; answered <= 10; answered += 1) {
    const resultButton = page.getByRole('button', {
      name: 'Ver meu resultado',
    });
    if (await resultButton.isVisible().catch(() => false)) {
      await resultButton.click();
      break;
    }
    const questionHeading = page.getByRole('heading', {
      name: /Questão \d+ de/,
    });
    await expect(questionHeading).toBeVisible();
    const previousQuestion = await questionHeading.textContent();
    await page.locator('input[name="selectedOptionId"]').first().check();
    await page.getByLabel(/Quão seguro você está/).selectOption('medium');
    await page.getByRole('button', { name: 'Confirmar resposta' }).click();
    await expect
      .poll(() => page.locator('main h1').first().textContent())
      .not.toBe(previousQuestion);
  }
  await expect(
    page.getByRole('heading', {
      name: 'Agora já conhecemos seu ponto de partida',
    }),
  ).toBeVisible();
  await page.goto('/app');
  await expect(journeyStep(page, 'Banca')).toContainText('Concluído');
  await expect(journeyStep(page, 'Diagnóstico')).toContainText('Concluído');
  await expect(
    page.getByRole('heading', {
      name: 'Transformar seu diagnóstico em um plano',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Continuar diagnóstico' }),
  ).toHaveCount(0);
  await page.reload();
  await expect(journeyStep(page, 'Diagnóstico')).toContainText('Concluído');

  // Cenário D — plano e atividade reais.
  await page.getByRole('link', { name: 'Criar meu plano' }).click();
  await page.getByRole('button', { name: 'Criar meu plano' }).click();
  await expect(page).toHaveURL(/\/app\/plan\/week/);
  await page.goto('/app');
  await expect(journeyStep(page, 'Fundamentos')).toContainText('Agora');
  await expect(page.getByText('Mentor da área')).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Começar atividade|Retomar atividade/ }),
  ).toHaveAttribute('href', '/app/plan/today');

  // Cenário E — Tutor real responde dentro do limite operacional.
  await page.goto('/app/tutor');
  await page
    .getByRole('button', { name: /Conversar com/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/app\/tutor\/[0-9a-f-]+/);
  await page
    .getByRole('textbox', { name: 'Mensagem' })
    .fill('Por que devo seguir este plano de estudos?');
  await page.getByLabel('Enviar mensagem').click();
  const tutorAnswer = page.getByLabel('Resposta de IA do Iatron').last();
  await expect(tutorAnswer).toHaveAttribute('data-status', 'streaming');
  await expect(tutorAnswer).toHaveAttribute('data-status', 'complete', {
    timeout: 50_000,
  });
  await expect(tutorAnswer).not.toContainText('Resposta interrompida');

  // Cenário F — mobile, logout e persistência após novo login.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();
  await expectNoHorizontalOverflow(page);
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  const mobileDrawer = page.getByTestId('mobile-drawer-layer');
  await expect(
    mobileDrawer.getByLabel('Usuário: Estudante Gate'),
  ).toBeVisible();
  await expect(
    mobileDrawer.getByRole('button', { name: 'Sair' }),
  ).toBeVisible();
  await mobileDrawer.getByRole('button', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/\/login/);
  await login(page, email, password);
  await expect(page).toHaveURL(/\/app$/);
  await expect(journeyStep(page, 'Banca')).toContainText('Concluído');
  await expect(journeyStep(page, 'Diagnóstico')).toContainText('Concluído');
  await expect(journeyStep(page, 'Fundamentos')).toContainText('Agora');
  await expectNoHorizontalOverflow(page);
});

test.afterEach(async () => {
  for (const userId of createdUserIds) {
    const response = await adminRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
    expect(response.ok).toBeTruthy();
  }
  createdUserIds.clear();
});
