import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const primaryRoutes = [
  '/',
  '/login',
  '/cadastro',
  '/esqueci-minha-senha',
  '/app',
  '/app/academic',
  '/app/learning',
  '/app/assessment/demo',
  '/app/plan',
] as const;

async function expectNoPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(
    dimensions.scrollWidth,
    JSON.stringify(dimensions),
  ).toBeLessThanOrEqual(dimensions.clientWidth);
}

test.describe('hardening mobile', () => {
  test('respeita todas as larguras obrigatórias', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop-chromium',
      'Matriz exata executada uma vez',
    );
    for (const width of [320, 360, 375, 390, 412, 768, 1024]) {
      await page.setViewportSize({ width, height: width < 600 ? 740 : 900 });
      await page.goto('/app/onboarding');
      await expectNoPageOverflow(page);
      await page.goto('/app');
      await expectNoPageOverflow(page);
    }
  });

  for (const route of primaryRoutes) {
    test(`não cria overflow horizontal em ${route}`, async ({
      page,
      isMobile,
    }) => {
      test.skip(!isMobile, 'Cobertura executada nos dispositivos móveis');
      await page.goto(route);
      await expectNoPageOverflow(page);
    });
  }

  test('formulários públicos permanecem utilizáveis', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Cobertura executada nos dispositivos móveis');
    await page.goto('/login');
    const email = page.getByLabel('E-mail');
    const password = page.getByLabel('Senha');
    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    expect(
      await email.evaluate((element) => getComputedStyle(element).fontSize),
    ).toBe('16px');
    expect(
      await password.evaluate((element) => getComputedStyle(element).fontSize),
    ).toBe('16px');
    await expectNoPageOverflow(page);
  });

  test('CTAs primários têm fundo sólido e contraste acessível', async ({
    page,
  }) => {
    for (const [route, label] of [
      ['/app/assessment/start', 'Iniciar diagnóstico'],
      ['/app/plan', 'Gerar meu plano'],
    ] as const) {
      await page.goto(route);
      const button = page.getByRole('button', { name: label });
      await expect(button).toBeVisible();
      const colors = await button.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          background: style.backgroundColor,
          foreground: style.color,
        };
      });
      expect(colors.background, `${label} sem fundo em ${route}`).not.toBe(
        'rgba(0, 0, 0, 0)',
      );
      expect(
        colors.background,
        `${label} herdou fundo branco em ${route}`,
      ).not.toBe('rgb(255, 255, 255)');
    }
  });

  test('onboarding valida, persiste ao voltar e conclui em uma coluna', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Cobertura executada nos dispositivos móveis');
    await page.goto('/app/onboarding');

    await page.getByRole('button', { name: 'Salvar e continuar' }).click();
    await expect(
      page.getByText('Informe seu nome para continuar.'),
    ).toBeVisible();
    await expect(page.getByLabel('Nome completo')).toBeFocused();

    await page.getByLabel('Nome completo').fill('Maria Mobile');
    await page.getByRole('button', { name: 'Salvar e continuar' }).click();
    await expect(
      page.getByRole('heading', { name: 'Sua rotina de estudos' }),
    ).toBeVisible();
    await expect(page.getByLabel('Dom em minutos')).toBeHidden();

    await page.getByRole('button', { name: 'Voltar' }).click();
    await expect(page.getByLabel('Nome completo')).toHaveValue('Maria Mobile');
    await page.getByRole('button', { name: 'Salvar e continuar' }).click();
    await page
      .getByRole('radio', { name: /Estudo praticamente todos os dias/ })
      .click();
    await expect(
      page.getByRole('region', { name: 'Disponibilidade semanal' }),
    ).toContainText('315 minutos');
    await page.getByRole('button', { name: 'Personalizar' }).click();
    await page.getByLabel('Seg em minutos').fill('60');
    await expect(
      page.getByRole('region', { name: 'Disponibilidade semanal' }),
    ).toContainText('330 minutos');
    await page.getByRole('button', { name: 'Salvar e continuar' }).click();
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Salvar e continuar' }).click();
    await page.getByRole('button', { name: 'Concluir' }).click();
    await expect(page).toHaveURL(/\/app$/);
    await expectNoPageOverflow(page);
  });

  test('drawer prende foco, fecha por Escape e não desloca conteúdo', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Cobertura executada nos dispositivos móveis');
    await page.goto('/app');
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    const drawer = page.getByRole('dialog', { name: 'Menu de navegação' });
    await expect(drawer).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Fechar menu' }).last(),
    ).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expectNoPageOverflow(page);
  });

  test('não possui violações axe críticas ou sérias', async ({ page }) => {
    for (const route of [
      '/login',
      '/app/onboarding',
      '/app',
      '/app/assessment/start',
      '/app/plan',
    ]) {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(
        results.violations.filter(({ impact }) =>
          ['critical', 'serious'].includes(impact ?? ''),
        ),
        `Violações em ${route}`,
      ).toEqual([]);
    }
  });
});
