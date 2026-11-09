import { type Page, expect, test } from '@playwright/test';

// Parcours complet sur le build de production, sous /daily-timer-simple/ (base href GitHub Pages).

test('création, présentation, démarrage et arrêt de la Daily', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Créer votre équipe' })).toBeVisible();

  await page.getByLabel("Nom d'équipe").fill('Équipe Alpha');
  await expect(page.getByLabel('Durée de la Daily')).toHaveValue('15');

  const member = page.getByLabel('Prénom');
  await member.fill('Léa');
  await member.press('Enter');
  await member.fill('Tom');
  await member.press('Enter');
  await member.fill('Ana');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  await expect(page.getByText('3 membres')).toBeVisible();

  await page.getByRole('button', { name: "Enregistrer l'équipe" }).click();
  await expect(page).toHaveURL(/#\/presentation$/);
  await expect(page.getByRole('heading', { name: 'Équipe Alpha' })).toBeFocused();

  await page.getByRole('button', { name: 'Démarrer une Daily' }).click();
  await expect(page).toHaveURL(/#\/daily$/);
  await expect(page.getByRole('timer')).toHaveText(/^1[45]:\d\d$/);
  await expect(page.getByText('sur 15 min')).toBeVisible();

  await page.getByRole('button', { name: 'Arrêter la Daily' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Arrêter', exact: true }).click();
  await expect(page).toHaveURL(/#\/presentation$/);
});

test('rechargement : l\'équipe est retrouvée, la Daily ne redémarre pas seule', async ({ page }) => {
  await page.goto('./');
  await page.getByLabel("Nom d'équipe").fill('Équipe Beta');
  await page.getByLabel('Prénom').fill('Léa');
  await page.getByLabel('Prénom').press('Enter');
  await page.getByLabel('Prénom').fill('Tom');
  await page.getByLabel('Prénom').press('Enter');
  await page.getByRole('button', { name: "Enregistrer l'équipe" }).click();
  await expect(page.getByRole('heading', { name: 'Équipe Beta' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Équipe Beta' })).toBeVisible();

  await page.goto('./#/daily');
  await expect(page).toHaveURL(/#\/presentation$/);
});

/** Crée une équipe de deux membres et lance la Daily. */
async function startDaily(page: Page): Promise<void> {
  await page.goto('./');
  await page.getByLabel("Nom d'équipe").fill('Équipe Gamma');
  await page.getByLabel('Prénom').fill('Léa');
  await page.getByLabel('Prénom').press('Enter');
  await page.getByLabel('Prénom').fill('Tom');
  await page.getByLabel('Prénom').press('Enter');
  await page.getByRole('button', { name: "Enregistrer l'équipe" }).click();
  await page.getByRole('button', { name: 'Démarrer une Daily' }).click();
  await expect(page).toHaveURL(/#\/daily$/);
}

test('retour arrière pendant la Daily : la Daily s\'arrête et ne reprend pas seule', async ({ page }) => {
  await startDaily(page);
  await page.goBack();
  await expect(page).toHaveURL(/#\/presentation$/);

  await page.goForward();
  await expect(page).toHaveURL(/#\/presentation$/);
  await expect(page.getByRole('timer')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Démarrer une Daily' })).toBeVisible();
});

for (const key of ['Tab', 'Shift+Tab']) {
  test(`dialogue d'arrêt : après un clic sur le voile puis ${key}, le focus reste dans le dialogue`, async ({ page }) => {
    await startDaily(page);
    await page.getByRole('button', { name: 'Arrêter la Daily' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();

    await page.locator('.scrim').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press(key);

    await expect(page.getByRole('alertdialog').locator(':focus')).toHaveCount(1);
  });
}

test('aucune requête vers un autre hôte pendant le parcours (données gardées sur l\'appareil)', async ({
  page,
  baseURL,
}) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));

  await startDaily(page);
  await page.getByRole('button', { name: 'Arrêter la Daily' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Arrêter', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Équipe Gamma' })).toBeVisible();

  const local = new URL(baseURL!).origin;
  expect(origins.has(local)).toBe(true);
  expect([...origins].filter((origin) => origin !== local)).toEqual([]);
});

test('320 px : aucun défilement horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('./#/equipe');
  await expect(page.getByRole('heading', { name: 'Créer votre équipe' })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});
