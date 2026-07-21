import { expect, test, type APIRequestContext } from '@playwright/test';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const mailpitUrl = process.env.MAILPIT_URL;
const apiBaseUrl = process.env.E2E_API_BASE_URL ?? 'http://127.0.0.1:8080';
const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY;
const password = 'Staging-validation-2026!';
const createdUserIds = new Set<string>();

type AdminUser = { id: string; email?: string };

async function adminRequest(
  request: APIRequestContext,
  path: string,
  options: Parameters<APIRequestContext['fetch']>[1] = {},
) {
  if (!serviceRoleKey)
    throw new Error('Fixture administrativa não configurada.');
  return request.fetch(`${supabaseUrl}/auth/v1/admin${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      'content-type': 'application/json',
    },
  });
}

async function findAdminUser(request: APIRequestContext, email: string) {
  const response = await adminRequest(request, '/users', { method: 'GET' });
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { users?: AdminUser[] };
  const user = body.users?.find((candidate) => candidate.email === email);
  if (!user) throw new Error('Usuário E2E recém-criado não foi encontrado.');
  createdUserIds.add(user.id);
  return user;
}

async function confirmStagingUser(request: APIRequestContext, email: string) {
  const user = await findAdminUser(request, email);
  const response = await adminRequest(request, `/users/${user.id}`, {
    method: 'PUT',
    data: { email_confirm: true },
  });
  expect(response.ok()).toBeTruthy();
}

async function recoveryLink(request: APIRequestContext, email: string) {
  const response = await adminRequest(request, '/generate_link', {
    method: 'POST',
    data: {
      type: 'recovery',
      email,
      options: { redirect_to: `${process.env.E2E_WEB_BASE_URL}/auth/callback` },
    },
  });
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as {
    action_link?: string;
    properties?: { action_link?: string };
  };
  const link = body.action_link ?? body.properties?.action_link;
  if (!link) throw new Error('Supabase não retornou link de recuperação.');
  return link;
}

async function waitForEmail(
  request: APIRequestContext,
  email: string,
  subject: RegExp,
) {
  if (!mailpitUrl) throw new Error('Mailpit local não configurado.');
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const search = await request.get(`${mailpitUrl}/api/v1/search`, {
      params: { query: `to:${email}` },
    });
    if (search.ok()) {
      const body = (await search.json()) as {
        messages?: { ID: string; Subject: string }[];
      };
      const message = body.messages?.find((item) => subject.test(item.Subject));
      if (message) {
        const detail = await request.get(
          `${mailpitUrl}/api/v1/message/${message.ID}`,
        );
        const content = JSON.stringify(await detail.json());
        const link = content
          .match(/https?:\\?\/\\?\/[^"]+(?:token_hash|token)=[^"\\]+/)?.[0]
          ?.replaceAll('\\u0026', '&')
          .replaceAll('\\/', '/');
        if (link) return link;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`E-mail local esperado não chegou para ${email}.`);
}

async function signUpApi(request: APIRequestContext, email: string) {
  const response = await request.post(`${supabaseUrl}/auth/v1/signup`, {
    headers: { apikey: publishableKey, 'content-type': 'application/json' },
    data: { email, password, data: { display_name: 'Estudante B' } },
  });
  expect(response.ok()).toBeTruthy();
  if (serviceRoleKey) {
    await confirmStagingUser(request, email);
  } else {
    await request.get(await waitForEmail(request, email, /confirm/i));
  }
}

async function tokenFor(request: APIRequestContext, email: string) {
  const response = await request.post(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      headers: { apikey: publishableKey, 'content-type': 'application/json' },
      data: { email, password },
    },
  );
  expect(response.ok()).toBeTruthy();
  return ((await response.json()) as { access_token: string }).access_token;
}

test('cadastro, confirmação, SSR, retomada, RLS, logout e recuperação reais', async ({
  page,
  request,
}) => {
  const run = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const studentA = `student-a-${run}@example.test`;
  const studentB = `student-b-${run}@example.test`;

  await page.goto('/cadastro');
  await page.getByLabel('Como devemos chamar você?').fill('Estudante A');
  await page.getByLabel('E-mail').fill(studentA);
  await page.getByLabel(/Senha/).fill(password);
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/login/);
  if (serviceRoleKey) {
    await expect(async () => {
      const response = await request.post(
        `${supabaseUrl}/auth/v1/token?grant_type=password`,
        {
          headers: {
            apikey: publishableKey,
            'content-type': 'application/json',
          },
          data: { email: studentA, password },
        },
      );
      expect(response.ok()).toBeFalsy();
    }).toPass();
    await confirmStagingUser(request, studentA);
  } else {
    await page.goto(await waitForEmail(request, studentA, /confirm/i));
  }
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(studentA);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/app\/onboarding/);

  await page.getByLabel('Nome').fill('Estudante A Atualizada');
  await page.getByRole('button', { name: 'Salvar e continuar' }).click();
  await page.reload();
  await expect(page.getByText('etapa 2 de 4')).toBeVisible();
  await page.getByLabel('Seg em minutos').fill('90');
  await page.getByRole('button', { name: 'Salvar e continuar' }).click();
  await page.getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Salvar e continuar' }).click();
  await page.getByRole('button', { name: 'Concluir' }).click();
  await expect(page).toHaveURL(/\/app$/);
  await page.reload();
  await expect(page).toHaveURL(/\/app$/);

  const tokenA = await tokenFor(request, studentA);
  await signUpApi(request, studentB);
  const tokenB = await tokenFor(request, studentB);
  const meA = await request.get(`${apiBaseUrl}/v1/me`, {
    headers: { authorization: `Bearer ${tokenA}` },
  });
  expect(meA.status()).toBe(200);
  const userAId = ((await meA.json()) as { profile: { id: string } }).profile
    .id;
  const spoof = await request.get(`${apiBaseUrl}/v1/me?user_id=${userAId}`, {
    headers: { authorization: `Bearer ${tokenB}`, 'x-user-id': userAId },
  });
  expect(spoof.status()).toBe(200);
  expect(
    ((await spoof.json()) as { profile: { id: string } }).profile.id,
  ).not.toBe(userAId);
  const rls = await request.get(`${supabaseUrl}/rest/v1/profiles`, {
    params: { id: `eq.${userAId}` },
    headers: { apikey: publishableKey, authorization: `Bearer ${tokenB}` },
  });
  expect(await rls.json()).toEqual([]);

  await page.getByRole('button', { name: /Estudante A Atualizada/ }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto('/app');
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  await page.goto('/esqueci-minha-senha');
  await page.getByLabel('E-mail').fill(studentA);
  await page.getByRole('button', { name: 'Enviar instruções' }).click();
  await page.goto(
    serviceRoleKey
      ? await recoveryLink(request, studentA)
      : await waitForEmail(request, studentA, /reset|senha|password/i),
  );
  await page.getByLabel('Nova senha').fill('Staging-validation-2026-updated!');
  await page.getByRole('button', { name: 'Salvar senha' }).click();
  await expect(page).toHaveURL(/\/app/);
});

test.afterEach(async ({ request }) => {
  if (!serviceRoleKey) return;
  for (const userId of createdUserIds) {
    const response = await adminRequest(request, `/users/${userId}`, {
      method: 'DELETE',
    });
    expect(response.ok()).toBeTruthy();
  }
  createdUserIds.clear();
});
