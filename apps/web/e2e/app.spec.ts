import { expect, test } from '@playwright/test';

test('abre o início autenticado e inicia uma conversa', async ({ page }) => {
  await page.goto('/app');
  await expect(
    page.getByRole('heading', { name: 'Vamos retomar sua preparação.' }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: /conversar com meu tutor/i })
    .first()
    .click();
  await expect(
    page.getByRole('heading', { name: 'Como posso ajudar no seu estudo?' }),
  ).toBeVisible();
});

test('envia mensagem e interrompe streaming', async ({ page }) => {
  await page.goto('/app/chat/new');
  await page.getByRole('textbox', { name: 'Mensagem' }).fill('Explique o tema');
  await page.getByLabel('Enviar mensagem').click();
  await expect(
    page.getByRole('button', { name: /interromper/i }),
  ).toBeVisible();
  await page.getByRole('button', { name: /interromper/i }).click();
  await expect(page.getByText('Explique o tema')).toBeVisible();
});

test('abre uma questão, responde e confirma', async ({ page }) => {
  await page.goto('/app/chat/question');
  await page.getByText(/revisar os dados disponíveis/i).click();
  await page.getByText('Alta').click();
  await page.getByRole('button', { name: 'Confirmar resposta' }).click();
  await expect(
    page.getByRole('button', { name: 'Resposta confirmada' }),
  ).toBeDisabled();
});

test('navega pelo drawer mobile', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Cenário específico para viewport móvel');
  await page.goto('/app');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await page.getByRole('link', { name: /meu plano/i }).click();
  await expect(page).toHaveURL(/\/app\/plan/);
});

test('direciona a antiga demonstração para o diagnóstico real', async ({ page }) => {
  await page.goto('/app/assessment/demo');
  await expect(
    page.getByRole('heading', { name: 'Diagnóstico inicial' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Iniciar diagnóstico' }),
  ).toBeVisible();
});
