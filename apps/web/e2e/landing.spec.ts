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
        const cta = page.getByRole('link', {
          name: /Conhecer minha trilha de estudos/,
        });
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
      name: 'Diagnóstico',
      exact: true,
    });
    await diagnosis.focus();
    await page.keyboard.press('ArrowRight');
    await expect(
      page.getByRole('tab', { name: 'Lacunas', exact: true }),
    ).toBeFocused();
    await expect(
      page.getByRole('tabpanel', { name: 'Lacunas', exact: true }),
    ).toBeVisible();
    await page.keyboard.press('End');
    await expect(
      page.getByRole('tabpanel', { name: 'Trilha', exact: true }),
    ).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(diagnosis).toBeFocused();
    await expect(
      page.getByRole('tabpanel', { name: 'Diagnóstico', exact: true }),
    ).toBeVisible();
    const faq = page.locator('details[data-faq]').first();
    const summary = faq.locator('summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(faq).toHaveAttribute('open', '');
    await expect(faq.locator('p')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(faq).not.toHaveAttribute('open', '');
  });

  test('conversão e acesso chegam aos formulários existentes', async ({
    page,
  }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /Conhecer minha trilha de estudos/ })
      .click();
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
    for (const name of ['Diagnóstico', 'Lacunas', 'Trilha']) {
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
