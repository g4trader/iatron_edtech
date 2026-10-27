import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const viewports = [
  [320, 812],
  [375, 812],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
] as const;

async function expectNoOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    available: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content, JSON.stringify(dimensions)).toBeLessThanOrEqual(
    dimensions.available,
  );
}

test.describe('landing premium', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://www.youtube-nocookie.com/**', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><html lang="pt-BR"><title>Player de teste</title><body></body></html>',
      }),
    );
  });

  test('preserva layout e primeira dobra na matriz de larguras', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop-chromium',
      'Matriz exata executada uma vez',
    );
    test.setTimeout(120_000);
    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expectNoOverflow(page);
      if (width < 600) {
        const cta = page.locator('[data-lp-event="hero_primary_cta_click"]');
        await expect(cta).toBeVisible();
        const bounds = await cta.boundingBox();
        expect(bounds, `CTA ausente em ${width}px`).not.toBeNull();
        expect(
          bounds!.y,
          `CTA acima da primeira dobra em ${width}px`,
        ).toBeGreaterThanOrEqual(0);
        expect(
          bounds!.y + bounds!.height,
          `CTA abaixo da primeira dobra em ${width}px`,
        ).toBeLessThanOrEqual(height);
      }
      if (width < 1100) {
        await page.getByRole('button', { name: 'Abrir menu' }).click();
        await expect(
          page.getByRole('navigation', { name: 'Navegação principal' }),
        ).toBeVisible();
        await expectNoOverflow(page);
        await page.getByRole('button', { name: 'Fechar menu' }).click();
      }
      await page.screenshot({
        path: `/tmp/iatron-lp-${width}.png`,
        fullPage: true,
        animations: 'disabled',
      });
      if (width === 390 || width === 1440) {
        const device = width === 390 ? 'mobile' : 'desktop';
        await page.screenshot({
          path: `/tmp/iatron-lp-hero-${device}.png`,
          animations: 'disabled',
        });
        for (const section of [
          'como-funciona',
          'plataforma',
          'mentores',
          'comunidade',
          'mentoria',
        ]) {
          await page.locator(`#${section}`).screenshot({
            path: `/tmp/iatron-lp-${section}-${device}.png`,
            animations: 'disabled',
          });
        }
        await page
          .locator('section[aria-labelledby="curation-title"]')
          .screenshot({
            path: `/tmp/iatron-lp-curation-${device}.png`,
            animations: 'disabled',
          });
        for (const [tab, slug] of [
          ['Meu diagnóstico', 'diagnostico'],
          ['Minha trilha', 'trilha'],
          ['Minha evolução', 'evolucao'],
        ] as const) {
          await page.getByRole('tab', { name: tab, exact: true }).click();
          await page
            .locator('#plataforma')
            .screenshot({
              path: `/tmp/iatron-lp-demo-${slug}-${device}.png`,
              animations: 'disabled',
            });
        }
        for (const [section, event] of [
          ['comunidade', 'community_cta_click'],
          ['mentoria', 'career_mentoring_cta_click'],
        ] as const) {
          await page.locator(`[data-lp-event="${event}"]`).click();
          await page
            .locator(`#${section}`)
            .screenshot({
              path: `/tmp/iatron-lp-${section}-open-${device}.png`,
              animations: 'disabled',
            });
        }
      }
    }
  });

  test('menu funciona por teclado e fecha ao seguir uma seção', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const toggle = page.locator('button[aria-controls="landing-navigation"]');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Tab');
    const nav = page.getByRole('navigation', { name: 'Navegação principal' });
    await expect(
      nav.getByRole('link', { name: 'Como funciona' }),
    ).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await expect(nav).toBeHidden();
    await page.keyboard.press('Enter');
    await nav.getByRole('link', { name: 'Plataforma', exact: true }).click();
    await expect(page).toHaveURL(/#plataforma$/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).toBeHidden();
    await expectNoOverflow(page);
  });

  test('demonstração oferece abas por setas e FAQ acessível por teclado', async ({
    page,
  }) => {
    await page.goto('/');
    const diagnosis = page.getByRole('tab', {
      name: 'Meu diagnóstico',
      exact: true,
    });
    await diagnosis.focus();
    await page.keyboard.press('ArrowRight');
    await expect(
      page.getByRole('tab', { name: 'Minha trilha', exact: true }),
    ).toBeFocused();
    await expect(
      page.getByRole('tabpanel', { name: 'Minha trilha', exact: true }),
    ).toBeVisible();
    await page.keyboard.press('End');
    await expect(
      page.getByRole('tabpanel', { name: 'Minha evolução', exact: true }),
    ).toBeVisible();
    const evolution = page.getByRole('tabpanel', {
      name: 'Minha evolução',
      exact: true,
    });
    await expect(
      evolution
        .getByRole('list', { name: 'Comparação fictícia de domínio por área' })
        .locator(':scope > li'),
    ).toHaveCount(4);
    await expect(
      evolution.getByText('Evolução fictícia', { exact: true }),
    ).toBeVisible();
    await expect(
      evolution.getByText('em 2 semanas ilustrativas'),
    ).toBeVisible();
    await expect(
      evolution.getByText('Semana 1 · diagnóstico e estudo'),
    ).toBeVisible();
    await expect(
      evolution.getByText('Semana 2 · prática e reavaliação'),
    ).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(diagnosis).toBeFocused();
    await expect(
      page.getByRole('tabpanel', { name: 'Meu diagnóstico', exact: true }),
    ).toBeVisible();
    const faq = page
      .locator('section[aria-labelledby="faq-title"] details[data-faq]')
      .first();
    const summary = faq.locator('summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(faq).toHaveAttribute('open', '');
    await expect(faq.locator('p')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(faq).not.toHaveAttribute('open', '');
  });

  test('jornada mostra quatro etapas e ofertas planejadas abrem detalhes reais', async ({
    page,
  }) => {
    await page.goto('/');
    const journey = page
      .locator('#como-funciona')
      .getByRole('list', { name: 'Etapas da preparação', exact: true });
    await expect(journey.locator(':scope > li')).toHaveCount(4);
    for (const name of ['Diagnóstico', 'Lacunas', 'Trilha', 'Evolução']) {
      await expect(
        journey.getByRole('heading', { name, exact: true }),
      ).toBeVisible();
    }
    await expect(
      journey
        .getByRole('list', { name: 'Percentuais ilustrativos por área' })
        .locator(':scope > li'),
    ).toHaveCount(4);
    await expect(
      page.getByText(
        'Dados e atividades fictícios para demonstrar a experiência.',
        { exact: false },
      ),
    ).toBeVisible();
    for (const [id, event, expected] of [
      [
        'comunidade',
        'community_cta_click',
        /Acesso, regras e condições serão divulgados/,
      ],
      [
        'mentoria',
        'career_mentoring_cta_click',
        /Não há contratação disponível nesta página/,
      ],
    ] as const) {
      const section = page.locator(`#${id}`);
      const details = section.locator('details');
      const summary = section.locator(`[data-lp-event="${event}"]`);
      await expect(details).not.toHaveAttribute('open', '');
      await expect(section.getByText(/EM PREPARAÇÃO/)).toBeVisible();
      await summary.focus();
      await page.keyboard.press('Enter');
      await expect(details).toHaveAttribute('open', '');
      await expect(details.getByText(expected)).toBeVisible();
      await expect(
        section.locator('form, input, a[href="/cadastro"]'),
      ).toHaveCount(0);
      await expectNoOverflow(page);
      await page.keyboard.press('Enter');
      await expect(details).not.toHaveAttribute('open', '');
    }
    await expect(
      page.getByRole('figure', {
        name: 'Exemplo ilustrativo de conversa na comunidade',
      }),
    ).toBeVisible();
  });

  test('conversão e acesso chegam aos formulários existentes', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('[data-lp-event="hero_primary_cta_click"]').click();
    await expect(page).toHaveURL(/\/cadastro$/);
    await expect(
      page.getByRole('heading', { name: 'Criar conta' }),
    ).toBeVisible();
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(
      page.getByLabel('Senha (mínimo de 8 caracteres)'),
    ).toBeVisible();
    await page
      .getByRole('banner')
      .getByRole('link', { name: 'Entrar', exact: true })
      .click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Entrar', exact: true }),
    ).toBeVisible();
  });

  test('não apresenta violações axe críticas ou sérias nas três abas', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.goto('/');
    for (const name of ['Meu diagnóstico', 'Minha trilha', 'Minha evolução']) {
      await page.getByRole('tab', { name, exact: true }).click();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(
        results.violations.filter(({ impact }) =>
          ['critical', 'serious'].includes(impact ?? ''),
        ),
        `Aba ${name}`,
      ).toEqual([]);
    }
  });
});
