import { expect, test, type Page } from '@playwright/test';

const supabaseUrl = process.env.E2E_SUPABASE_URL!;
const publishableKey = process.env.E2E_SUPABASE_PUBLISHABLE_KEY!;
const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY!;
const apiBaseUrl = process.env.E2E_API_BASE_URL!;
const personas = {
  student: 'iatron.edtech+student-beta@gmail.com',
  mentor: 'iatron.edtech+mentor-beta@gmail.com',
  editor: 'iatron.edtech+editorial-beta@gmail.com',
  admin: 'iatron.edtech+admin-beta@gmail.com',
} as const;
type Persona = keyof typeof personas;

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
  if (!response.ok) throw new Error(`Fixture recusada: ${response.status}`);
  const text = await response.text();
  return text ? (JSON.parse(text) as unknown) : null;
}
async function ensurePersona(persona: Persona, password: string) {
  const listing = (await service(
    '/auth/v1/admin/users?page=1&per_page=1000',
  )) as { users: { id: string; email?: string }[] };
  const user = listing.users.find(({ email }) => email === personas[persona]);
  if (!user) throw new Error(`Persona ${persona} ausente`);
  await service(`/auth/v1/admin/users/${user.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      password,
      email_confirm: true,
      ban_duration: 'none',
    }),
  });
  await service(`/rest/v1/user_roles?user_id=eq.${user.id}`, {
    method: 'DELETE',
  });
  await service('/rest/v1/user_roles', {
    method: 'POST',
    body: JSON.stringify({ user_id: user.id, role: persona }),
  });
  await service(`/rest/v1/profiles?id=eq.${user.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      onboarding_status: 'completed',
      onboarding_step: 4,
    }),
  });
}
async function accessToken(persona: Persona, password: string) {
  const response = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: { apikey: publishableKey, 'content-type': 'application/json' },
      body: JSON.stringify({ email: personas[persona], password }),
    },
  );
  const body = (await response.json()) as { access_token?: string };
  if (!response.ok || !body.access_token)
    throw new Error(`Login ${persona} falhou`);
  return body.access_token;
}
async function login(page: Page, persona: Persona, password: string) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(personas[persona]);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

test('admin opera o cockpit e os demais papéis permanecem isolados', async ({
  page,
  request,
}) => {
  const password = `Executive-${crypto.randomUUID()}-Aa1!`;
  for (const persona of Object.keys(personas) as Persona[])
    await ensurePersona(persona, password);

  for (const persona of ['student', 'mentor', 'editor'] as Persona[]) {
    const token = await accessToken(persona, password);
    expect(
      (
        await request.get(`${apiBaseUrl}/admin/overview`, {
          headers: { authorization: `Bearer ${token}` },
        })
      ).status(),
    ).toBe(403);
  }

  await login(page, 'admin', password);
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole('heading', { name: 'Como está o Iatron hoje' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Alunos', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Jornada dos alunos' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Ver progresso' }).first().click();
  await expect(page.getByText(/Respostas e conversas privadas/)).toBeVisible();

  await page.getByRole('link', { name: 'Mentores', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Responsáveis pelas especialidades' }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'Ver responsabilidade completa' })
    .first()
    .click();
  await expect(page.getByText(/Áreas sob responsabilidade/)).toBeVisible();

  await page.getByRole('link', { name: 'Acessos' }).click();
  const invitedEmail = `iatron.edtech+executive-${Date.now()}@gmail.com`;
  await page.getByLabel('Nome').fill('Mentor Executive E2E');
  await page.getByLabel('E-mail').fill(invitedEmail);
  await page.getByLabel('Papel inicial').selectOption('mentor');
  await page.getByRole('button', { name: 'Enviar convite seguro' }).click();
  const account = page
    .locator('article')
    .filter({ has: page.getByText(invitedEmail) });
  await expect(account).toBeVisible();
  await account.getByRole('button', { name: 'Desativar' }).click();
  await expect(
    page.locator('article').filter({ has: page.getByText(invitedEmail) }),
  ).toContainText('Conta desativada');
  await page
    .locator('article')
    .filter({ has: page.getByText(invitedEmail) })
    .getByRole('button', { name: 'Reativar' })
    .click();
  await page
    .locator('article')
    .filter({ has: page.getByText(invitedEmail) })
    .getByRole('button', { name: 'Enviar recuperação' })
    .click();

  await page.getByRole('link', { name: 'Platform' }).click();
  await expect(
    page.getByRole('heading', { name: 'Auditoria administrativa recente' }),
  ).toBeVisible();
  await expect(page.getByText('Convite enviado').first()).toBeVisible();
  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/\/login/);
});
