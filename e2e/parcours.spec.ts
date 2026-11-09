import { type Page, expect, test } from '@playwright/test';

// Parcours sur le build de production, sous /daily-timer-simple/ (base href GitHub Pages).

/** Crée une équipe depuis l'écran de création et arrive à sa présentation. */
async function createTeam(page: Page, name: string, members: string[]): Promise<void> {
  await page.getByLabel("Nom d'équipe").fill(name);
  for (const member of members) {
    await page.getByLabel('Prénom').fill(member);
    await page.getByLabel('Prénom').press('Enter');
  }
  await page.getByRole('button', { name: "Enregistrer l'équipe" }).click();
  await expect(page.getByRole('heading', { name })).toBeVisible();
}

/** Ouvre la préparation depuis la présentation et lance la Daily. */
async function startDaily(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Démarrer une Daily' }).click();
  await expect(page.getByRole('heading', { name: 'Préparer la Daily' })).toBeVisible();
  await page.getByRole('button', { name: 'Commencer la Daily' }).click();
  await expect(page.getByRole('timer')).toBeVisible();
}

test('parcours complet : Mes équipes, création, présentation, préparation, démarrage, passer un membre, arrêt', async ({ page }) => {
  await page.goto('./');
  // Sans équipe, l'accueil ouvre la création, sans champ de durée.
  await expect(page.getByRole('heading', { name: 'Nouvelle équipe' })).toBeVisible();
  await expect(page.getByLabel('Durée de la Daily')).toHaveCount(0);

  await createTeam(page, 'Équipe Alpha', ['Léa', 'Tom', 'Ana']);
  await expect(page).toHaveURL(/#\/equipe\/[^/]+$/);
  await expect(page.getByText('Équipe enregistrée.')).toBeVisible();

  await startDaily(page);
  await expect(page).toHaveURL(/#\/equipe\/[^/]+\/daily$/);
  await expect(page.getByRole('timer')).toHaveText(/^0[12]:\d\d$/);
  await expect(page.getByText('Temps prévu : 2:00')).toBeVisible();

  // Passer un membre : Tom est absent, il ne reçoit aucun temps.
  await page.getByRole('button', { name: 'Passer Tom' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: 'Tom' })).toContainText('passé');
  // Léa parle, puis la parole passe à Ana, qui est la dernière personne : le bouton devient « Terminer la Daily ».
  await page.getByRole('button', { name: 'Passer au suivant' }).click();
  await expect(page.getByRole('timer')).toHaveAccessibleName('Temps restant pour Ana');
  await expect(page.getByRole('button', { name: 'Terminer la Daily' })).toBeVisible();

  await page.getByRole('button', { name: 'Arrêter la Daily' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Arrêter', exact: true }).click();
  await expect(page).toHaveURL(/#\/equipe\/[^/]+$/);
  await expect(page.getByRole('heading', { name: 'Équipe Alpha' })).toBeVisible();

  await page.getByRole('link', { name: '‹ Mes équipes' }).click();
  await expect(page.getByRole('heading', { name: 'Mes équipes' })).toBeVisible();
  await expect(page.getByText('3 membres')).toBeVisible();
});

test('rechargement : l\'équipe est retrouvée, la Daily ne redémarre pas seule', async ({ page }) => {
  await page.goto('./');
  await createTeam(page, 'Équipe Beta', ['Léa', 'Tom']);
  await startDaily(page);
  await page.reload();
  await expect(page).toHaveURL(/#\/equipe\/[^/]+$/);
  await expect(page.getByRole('heading', { name: 'Équipe Beta' })).toBeVisible();
  await expect(page.getByRole('timer')).toHaveCount(0);
});

test('accueil : « Mes équipes » quand une équipe existe, et plusieurs équipes retrouvées', async ({ page }) => {
  await page.goto('./');
  await createTeam(page, 'Équipe Zeta', ['Léa', 'Tom']);
  await page.getByRole('link', { name: '‹ Mes équipes' }).click();
  await page.getByRole('link', { name: 'Nouvelle équipe' }).click();
  await createTeam(page, 'Équipe Gamma', ['Ana', 'Ben']);

  await page.goto('./');
  await expect(page).toHaveURL(/#\/equipes$/);
  const titles = await page.locator('.row-title').allTextContents();
  expect(titles).toEqual(['Équipe Gamma', 'Équipe Zeta']);
});

test('retour arrière pendant la Daily : la Daily s\'arrête et ne reprend pas seule', async ({ page }) => {
  await page.goto('./');
  await createTeam(page, 'Équipe Delta', ['Léa', 'Tom']);
  await startDaily(page);
  await page.goBack();
  await expect(page).toHaveURL(/#\/equipe\/[^/]+\/preparer$/);
  // Avancer de nouveau ne relance pas la Daily : la garde renvoie à la présentation.
  await page.goForward();
  await expect(page).toHaveURL(/#\/equipe\/[^/]+$/);
  await expect(page.getByRole('timer')).toHaveCount(0);
});

for (const key of ['Tab', 'Shift+Tab']) {
  test(`dialogue d'arrêt : focus sur BODY puis ${key} répété, le focus reste dans le dialogue`, async ({ page }) => {
    await page.goto('./');
    await createTeam(page, 'Équipe Epsilon', ['Léa', 'Tom']);
    await startDaily(page);
    await page.getByRole('button', { name: 'Arrêter la Daily' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();

    await page.locator('.scrim').click({ position: { x: 5, y: 5 } });
    // Le focus est forcé sur BODY : le point de départ de la tabulation est alors hors du dialogue.
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);

    for (let i = 0; i < 3; i++) {
      await page.keyboard.press(key);
      await expect(page.getByRole('alertdialog').locator(':focus')).toHaveCount(1);
    }
  });
}

test('aucune requête vers un autre hôte pendant le parcours (données gardées sur l\'appareil)', async ({
  page,
  baseURL,
}) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));

  await page.goto('./');
  await createTeam(page, 'Équipe Zeta2', ['Léa', 'Tom']);
  await startDaily(page);
  await page.getByRole('button', { name: 'Arrêter la Daily' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Arrêter', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Équipe Zeta2' })).toBeVisible();

  const local = new URL(baseURL!).origin;
  expect(origins.has(local)).toBe(true);
  expect([...origins].filter((origin) => origin !== local)).toEqual([]);
});

test('320 px : aucun défilement horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('./#/equipe/nouvelle');
  await expect(page.getByRole('heading', { name: 'Nouvelle équipe' })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});
