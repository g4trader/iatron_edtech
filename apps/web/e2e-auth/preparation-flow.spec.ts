import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.use({ trace: 'off' });
const url = process.env.E2E_SUPABASE_URL!;
const role = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY!;
const headers = {
  apikey: role,
  authorization: `Bearer ${role}`,
  'content-type': 'application/json',
};
async function service(path: string, method = 'GET', data?: unknown) {
  const r = await fetch(`${url}${path}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  expect(r.ok).toBeTruthy();
  const body = await r.text();
  return body ? (JSON.parse(body) as unknown) : null;
}
test('V4: escolhe prova após cadastro completo, persiste e retoma preparação após novo login', async ({
  page,
}, info) => {
  const email = `preparation-${Date.now()}-${crypto.randomUUID().slice(0, 8)}@example.com`;
  const password = `Preparation-${crypto.randomUUID()}-Aa1!`;
  const user = (await service('/auth/v1/admin/users', 'POST', {
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: 'Camila Teste' },
  })) as { id: string };
  try {
    await service(`/rest/v1/profiles?id=eq.${user.id}`, 'PATCH', {
      onboarding_status: 'completed',
      onboarding_step: 4,
    });
    const login = async () => {
      await page.goto('/login');
      await page.getByLabel('E-mail', { exact: true }).fill(email);
      await page.getByLabel('Senha', { exact: true }).fill(password);
      await page.getByRole('button', { name: 'Entrar', exact: true }).click();
      await expect(page).toHaveURL(/\/app$/);
    };
    await login();
    await expect(
      page.getByRole('heading', { name: 'Minha preparação', exact: true }),
    ).toBeVisible();
    await expect(page.getByText('Olá, Camila', { exact: true })).toBeVisible();
    const spaces = page.getByRole('navigation', {
      name: 'Ambientes de aprendizagem',
    });
    await expect(
      spaces.getByRole('link', { name: /Meu diagnóstico/ }),
    ).toHaveAttribute('href', '/app/assessment/entry');
    await expect(
      spaces.getByRole('link', { name: /Minha trilha/ }),
    ).toHaveAttribute('href', '/app/plan');
    await expect(
      spaces.getByRole('link', { name: /Minha evolução/ }),
    ).toHaveAttribute('href', '/app/learning/mastery');

    await expect(
      page.getByRole('listitem').filter({ hasText: 'Prova' }),
    ).toContainText('Agora');
    await page
      .getByRole('link', { name: 'Escolher minha prova', exact: true })
      .click();
    await expect(page).toHaveURL(/\/app\/exams/);
    await page.getByLabel('Buscar prova, instituição ou cidade').fill('AMRIGS');
    const option = page.getByRole('checkbox').first();
    await expect(option).toBeVisible();
    await option.check();
    await info.attach('exam-selection-desktop', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    await page.getByRole('button', { name: 'Confirmar escolha' }).click();
    await expect(
      page.getByText('Provas salvas', { exact: true }),
    ).toBeVisible();
    await page
      .getByRole('link', { name: 'Continuar minha preparação' })
      .click();
    await expect(
      page.getByRole('link', { name: 'Iniciar diagnóstico', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('listitem').filter({ hasText: 'Prova' }),
    ).toContainText('Concluído');
    await page.reload();
    await expect(
      page.getByRole('link', { name: 'Iniciar diagnóstico', exact: true }),
    ).toBeVisible();
    const selected = (await service(
      `/rest/v1/student_target_exams?user_id=eq.${user.id}&select=exam_edition_id`,
    )) as Array<{ exam_edition_id: string }>;
    expect(selected).toHaveLength(1);
    for (const [width, height] of [
      [320, 812],
      [375, 812],
      [390, 844],
      [768, 1024],
      [1024, 768],
      [1366, 768],
      [1440, 900],
      [1920, 1080],
    ]) {
      await page.setViewportSize({ width: width!, height: height! });
      const dimensions = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
      await expect(
        page.getByRole('link', { name: 'Iniciar diagnóstico', exact: true }),
      ).toBeVisible();
      await info.attach(`preparation-${width}`, {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    }
    const violations = (
      await new AxeBuilder({ page }).analyze()
    ).violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact ?? ''),
    );
    expect(violations).toEqual([]);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Ver todas as etapas' }).click();
    await expect(
      page.getByRole('listitem').filter({ hasText: 'Perfil' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Recolher progresso' }).click();
    await page.getByRole('link', { name: 'Alterar provas' }).click();
    await expect(
      page.getByRole('checkbox').filter({ visible: true }).first(),
    ).toBeVisible();
    await expect(page.locator('input[type="checkbox"]:checked')).toHaveCount(1);
    await info.attach('exam-selection-mobile', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    await page.goto('/app');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole('button', { name: 'Sair da conta' }).click();
    // The shell may require explicit confirmation before ending the session.
    const confirm = page.getByRole('button', { name: 'Sair', exact: true });
    if (await confirm.isVisible()) await confirm.click();
    await expect(page).toHaveURL(/\/login/);
    await login();
    await expect(
      page.getByRole('link', { name: 'Iniciar diagnóstico', exact: true }),
    ).toBeVisible();
    await page
      .getByRole('link', { name: 'Iniciar diagnóstico', exact: true })
      .click();
    await expect(page).toHaveURL(/\/app\/assessment\/start$/);
    await expect(
      page.getByRole('button', { name: 'Começar meu diagnóstico' }),
    ).toBeVisible();
    await page.getByRole('link', { name: 'Minha trilha', exact: true }).click();
    await expect(
      page.getByRole('heading', {
        name: 'Sua trilha começa com o diagnóstico',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Criar meu plano' }),
    ).toHaveCount(0);
    await page
      .getByRole('link', { name: 'Minha evolução', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Seu progresso aparecerá aqui' }),
    ).toBeVisible();
    await expect(page.getByRole('meter')).toHaveCount(0);
    await page
      .getByRole('link', { name: 'Histórico de atividades', exact: true })
      .click();
    await expect(page).toHaveURL(/\/app\/learning\/timeline$/);
  } finally {
    await service(`/auth/v1/admin/users/${user.id}`, 'DELETE');
  }
});
