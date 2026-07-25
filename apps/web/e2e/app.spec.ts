import { expect, test } from '@playwright/test';

test('abre a jornada e apresenta o próximo passo real', async ({ page }) => {
  await page.goto('/app');
  await expect(
    page.getByRole('heading', { name: /Olá, Estudante\./ }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', {
      name: /Escolher minha prova|Começar diagnóstico|Continuar diagnóstico|Criar meu plano|Começar atividade|Retomar atividade/,
    }),
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

test('apresenta o tutor antes da primeira conversa', async ({ page }) => {
  await page.goto('/app/tutor');
  await expect(
    page.getByRole('heading', {
      name: 'Orientação médica para cada etapa da sua preparação',
    }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Conversar com Dr. Lucas' })
    .first()
    .click();
  await expect(page).toHaveURL(/\/app\/chat\/new/);
  await expect(
    page.getByRole('heading', { name: 'Por onde vamos começar?' }),
  ).toBeVisible();
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
  await page.getByRole('link', { name: 'Mentores' }).click();
  await expect(page).toHaveURL(/\/app\/tutor/);
});

test('direciona a antiga demonstração para o diagnóstico real', async ({
  page,
}) => {
  await page.goto('/app/assessment/demo');
  await expect(
    page.getByRole('heading', { name: 'Diagnóstico inicial' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Descobrir meu ponto de partida' }),
  ).toBeVisible();
  await expect(
    page.getByRole('radio', { name: /Triagem rápida/ }),
  ).toBeChecked();
  await expect(
    page.getByRole('radio', { name: /Diagnóstico completo/ }),
  ).toBeVisible();
});

test('sidebar não oferece conversas fictícias e separa perfil de logout', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'A conta fica na barra lateral desktop');
  await page.goto('/app');

  await expect(page.getByLabel(/^Usuário:/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Sair da conta' }),
  ).toBeVisible();
  await expect(page.getByText('Revisão de clínica médica')).toHaveCount(0);
  await expect(page.getByText('Questão demonstrativa')).toHaveCount(0);
  await expect(page.getByText('Principais gaps')).toHaveCount(0);

  await page.getByLabel(/^Usuário:/).click();
  await expect(page).toHaveURL(/\/app$/);
});
