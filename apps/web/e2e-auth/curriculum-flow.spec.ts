import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.use({ trace: 'off' });
const url = process.env.E2E_SUPABASE_URL!;
const key = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY!;
const api = process.env.E2E_API_BASE_URL!;
async function service(path: string, method = 'GET', body?: unknown) {
  const response = await fetch(`${url}${path}`, {
    method,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
      prefer: 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`Curriculum fixture ${response.status}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
test('V5: catálogo filtra, pagina, preserva navegação e salva proposta auditada', async ({
  page,
}, info) => {
  const email = 'iatron.edtech+e2e-curriculum-admin@gmail.com';
  const password = `Curriculum-${crypto.randomUUID()}-Aa1!`;
  const listing = await service('/auth/v1/admin/users?per_page=1000');
  let user = listing.users.find((u: { email: string }) => u.email === email);
  if (!user)
    user = await service('/auth/v1/admin/users', 'POST', {
      email,
      password,
      email_confirm: true,
    });
  else
    await service(`/auth/v1/admin/users/${user.id}`, 'PUT', {
      password,
      email_confirm: true,
    });
  await service('/rest/v1/user_roles', 'POST', {
    user_id: user.id,
    role: 'admin',
  }).catch(async () => {
    const roles = await service(
      `/rest/v1/user_roles?user_id=eq.${user.id}&role=eq.admin`,
    );
    expect(roles).toHaveLength(1);
  });
  await service(`/rest/v1/profiles?id=eq.${user.id}`, 'PATCH', {
    onboarding_status: 'completed',
    onboarding_step: 4,
  });
  const fixtureId = crypto.randomUUID();
  await service('/rest/v1/competencies', 'POST', {
    id: fixtureId,
    subtheme_id: '53000000-0000-4000-8000-000000000001',
    code: `E2E.CURRICULUM.${Date.now()}`,
    name: 'Avaliar cenário curricular de teste isolado',
    description:
      'Registro sintético exclusivo para validar a edição administrativa.',
    is_active: false,
    curriculum_status: 'draft',
    curriculum_source: 'e2e:curriculum',
  });
  try {
    await page.goto('/login');
    await page.getByLabel('E-mail', { exact: true }).fill(email);
    await page.getByLabel('Senha', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page).not.toHaveURL(/\/login/);
    await page.goto('/admin/competencies');
    await expect(
      page.getByRole('heading', { name: 'Competências médicas', exact: true }),
    ).toBeVisible();
    await page
      .getByRole('link', { name: 'Próxima página', exact: true })
      .click();
    await expect(page).toHaveURL(/page=2/);
    await page
      .getByRole('navigation', { name: 'Especialidades médicas' })
      .getByRole('link', { name: /Pediatria/ })
      .click();
    await page.getByLabel('Buscar competência').fill('bronquiolite');
    await page.getByRole('button', { name: 'Aplicar filtros' }).click();
    await expect(
      page.getByRole('heading', {
        name: 'Diagnosticar e manejar bronquiolite viral aguda',
      }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Ver detalhes', exact: true }).click();
    await expect(
      page.getByText(/Proposta inativa: não utilizada/),
    ).toBeVisible();
    await page
      .getByRole('link', { name: /Voltar ao catálogo com os filtros/ })
      .click();
    await expect(page.getByLabel('Buscar competência')).toHaveValue(
      'bronquiolite',
    );
    await page.setViewportSize({ width: 1440, height: 900 });
    await info.attach('curriculum-desktop', {
      body: await page.screenshot({
        path: info.outputPath('curriculum-desktop.png'),
        fullPage: true,
      }),
      contentType: 'image/png',
    });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await info.attach('curriculum-mobile', {
      body: await page.screenshot({
        path: info.outputPath('curriculum-mobile.png'),
        fullPage: true,
      }),
      contentType: 'image/png',
    });
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.goto(`/admin/competencies/${fixtureId}`);
    await page
      .getByLabel('Nome da competência', { exact: true })
      .fill('Avaliar cenário curricular editado em teste isolado');
    await page
      .getByLabel('Objetivos de aprendizagem — um por linha')
      .fill('Identificar dados relevantes no cenário sintético de teste.');
    await page
      .getByLabel('Justificativa da alteração')
      .fill('Validação E2E da persistência auditada da proposta.');
    await page
      .getByRole('button', { name: 'Salvar proposta', exact: true })
      .click();
    await expect(page.getByRole('status')).toContainText('Proposta salva');
    await page.reload();
    await expect(
      page.getByLabel('Nome da competência', { exact: true }),
    ).toHaveValue('Avaliar cenário curricular editado em teste isolado');
    const audits = await service(
      `/rest/v1/editorial_audit_events?resource_id=eq.${fixtureId}&action=eq.curriculum_draft_updated`,
    );
    expect(audits).toHaveLength(1);
    const tokenResponse = await fetch(
      `${url}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          apikey: process.env.E2E_SUPABASE_PUBLISHABLE_KEY!,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      },
    );
    const token = (await tokenResponse.json()).access_token;
    await service(
      `/rest/v1/user_roles?user_id=eq.${user.id}&role=eq.admin`,
      'DELETE',
    );
    expect(
      (
        await fetch(`${api}/v1/admin/curriculum`, {
          headers: { authorization: `Bearer ${token}` },
        })
      ).status,
    ).toBe(403);
  } finally {
    await service(`/rest/v1/competencies?id=eq.${fixtureId}`, 'DELETE');
    await service(
      `/rest/v1/user_roles?user_id=eq.${user.id}&role=eq.admin`,
      'DELETE',
    );
  }
});
