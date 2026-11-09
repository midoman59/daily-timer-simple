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
  await page.getByRole('button', { name: 'Suivant' }).click();
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

test('rechargement : la Daily reprend figée, rien ne repart sans clic, et les équipes sont retrouvées', async ({ page }) => {
  await page.goto('./');
  await createTeam(page, 'Équipe Beta', ['Léa', 'Tom']);
  await startDaily(page);
  await page.reload();
  await expect(page.getByRole('timer')).toBeVisible();
  await expect(page.getByText('Daily en pause')).toBeVisible();
  const before = await page.getByRole('timer').textContent();
  await page.waitForTimeout(1500);
  expect(await page.getByRole('timer').textContent()).toBe(before);
  await page.getByRole('button', { name: 'Reprendre la Daily' }).click();
  await expect(page.getByText('Daily en pause')).toHaveCount(0);
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

test('garde de sortie : le retour arrière ouvre « Quitter la Daily ? », « Continuer » reste sur la Daily (S28)', async ({ page }) => {
  await page.goto('./');
  await createTeam(page, 'Équipe Delta', ['Léa', 'Tom']);
  await startDaily(page);
  await page.goBack();
  await expect(page.getByRole('alertdialog')).toContainText('Quitter la Daily ?');
  await expect(page).toHaveURL(/#\/equipe\/[^/]+\/daily$/);
  await page.getByRole('button', { name: 'Continuer' }).click();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await expect(page).toHaveURL(/#\/equipe\/[^/]+\/daily$/);
  await page.goBack();
  await page.getByRole('button', { name: 'Arrêter', exact: true }).click();
  // La navigation demandée se poursuit une fois la Daily effacée : le chronomètre n'existe plus.
  await expect(page.getByRole('timer')).toHaveCount(0);
  await expect(page).not.toHaveURL(/\/daily$/);
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

/** Écart entre la largeur du document et la fenêtre : 0 quand il n'y a aucun défilement horizontal. */
async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test('320 px : préparation et Daily sans défilement horizontal, avec des prénoms longs', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('./');
  await createTeam(page, 'Équipe Théta', ['Marie-Christine', 'Jean-Baptiste', 'Hortense-Lou']);

  await page.getByRole('button', { name: 'Démarrer une Daily' }).click();
  await expect(page.getByRole('heading', { name: 'Préparer la Daily' })).toBeVisible();
  expect(await horizontalOverflow(page)).toBe(0);

  await page.getByRole('button', { name: 'Commencer la Daily' }).click();
  await expect(page.getByRole('timer')).toBeVisible();
  expect(await horizontalOverflow(page)).toBe(0);
});

test('dialogue d\'arrêt : « Arrêter » à gauche et « Continuer » à droite ; empilés sous 340 px, « Continuer » en haut (I2)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./');
  await createTeam(page, 'Équipe Iota', ['Léa', 'Tom']);
  await startDaily(page);
  await page.getByRole('button', { name: 'Arrêter la Daily' }).click();
  const dialog = page.getByRole('alertdialog');
  const continueBox = await dialog.getByRole('button', { name: 'Continuer' }).boundingBox();
  const stopBox = await dialog.getByRole('button', { name: 'Arrêter', exact: true }).boundingBox();
  expect(stopBox!.x).toBeLessThan(continueBox!.x);
  expect(Math.abs(stopBox!.y - continueBox!.y)).toBeLessThan(2);

  await page.setViewportSize({ width: 320, height: 640 });
  const narrowContinue = await dialog.getByRole('button', { name: 'Continuer' }).boundingBox();
  const narrowStop = await dialog.getByRole('button', { name: 'Arrêter', exact: true }).boundingBox();
  expect(narrowContinue!.y).toBeLessThan(narrowStop!.y);
});

test('320 px : aucun défilement horizontal sur chaque écran, dès l\'arrivée et après le glissement (I4)', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  // Mesure à l'arrivée (glissement en cours) puis une fois l'écran stabilisé.
  const expectNoOverflow = async (label: string) => {
    expect(await horizontalOverflow(page), `${label} : à l'arrivée`).toBe(0);
    await page.waitForTimeout(400);
    expect(await horizontalOverflow(page), `${label} : stabilisé`).toBe(0);
  };

  await page.goto('./');
  await createTeam(page, 'Équipe Kappa', ['Marie-Christine', 'Jean-Baptiste', 'Hortense-Lou']);
  await expectNoOverflow('présentation');

  await page.getByRole('link', { name: "Modifier l'équipe" }).click();
  await expect(page.getByRole('heading', { name: "Modifier l'équipe" })).toBeVisible();
  await expectNoOverflow('modification');

  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Équipe Kappa' })).toBeVisible();
  await page.getByRole('link', { name: '‹ Mes équipes' }).click();
  await expect(page.getByRole('heading', { name: 'Mes équipes' })).toBeVisible();
  await expectNoOverflow('Mes équipes');

  await page.getByRole('link', { name: 'Nouvelle équipe' }).click();
  await expect(page.getByRole('heading', { name: 'Nouvelle équipe' })).toBeVisible();
  await expectNoOverflow('création');

  await page.goBack();
  await page.getByRole('link', { name: 'Équipe Kappa' }).click();
  await expect(page.getByRole('heading', { name: 'Équipe Kappa' })).toBeVisible();
  await page.getByRole('button', { name: 'Démarrer une Daily' }).click();
  await expect(page.getByRole('heading', { name: 'Préparer la Daily' })).toBeVisible();
  await expectNoOverflow('préparation');

  await page.getByRole('button', { name: 'Commencer la Daily' }).click();
  await expect(page.getByRole('timer')).toBeVisible();
  await expectNoOverflow('Daily');

  await page.getByRole('button', { name: 'Arrêter la Daily' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await expectNoOverflow('dialogue d\'arrêt');
});

test('migration v1 : l\'équipe de l\'ancienne version reste utilisable, sa durée est ignorée (I4)', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() =>
    localStorage.setItem(
      'daily-timer-simple.team.v1',
      JSON.stringify({ version: 1, name: 'Équipe Ancienne', durationMinutes: 15, members: ['Léa', 'Tom'] }),
    ),
  );
  // Nouvelle navigation vers l'accueil : la lecture du stockage (et la migration) se fait au démarrage.
  await page.goto('./');
  await expect(page).toHaveURL(/#\/equipes$/);
  await expect(page.getByText('Équipe Ancienne')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('daily-timer-simple.team.v1'))).toBeNull();

  await page.getByRole('link', { name: 'Équipe Ancienne' }).click();
  await page.getByRole('button', { name: 'Démarrer une Daily' }).click();
  await page.getByRole('button', { name: 'Commencer la Daily' }).click();
  await expect(page.getByRole('timer')).toHaveText(/^0[12]:\d\d$/);
});

test('dépassement : le décompte continue en « +mm:ss », « Temps dépassé » en rouge', async ({ page }) => {
  await page.clock.install();
  await page.goto('./');
  await createTeam(page, 'Équipe Lambda', ['Léa', 'Tom']);
  await startDaily(page);
  // Le membre qui parle a deux minutes : au-delà, le décompte passe en dépassement.
  await page.clock.runFor(2 * 60 * 1000 + 3000);
  await expect(page.locator('.overrun-title')).toHaveText('Temps dépassé');
  await expect(page.getByText(/^\+00:0[23]$/)).toBeVisible();
  await expect(page.getByRole('timer')).toHaveText(/^\+00:\d\d$/);
  // Couleur du token --color-overrun (design 2.2) : la transition de couleur se termine, l'assertion attend.
  await expect(page.getByRole('timer')).toHaveCSS('color', 'rgb(179, 38, 30)');
});

test('suppression au clavier : Entrée sur « Supprimer » retire le membre et le focus reste dans la liste', async ({
  page,
}) => {
  await page.goto('./');
  await createTeam(page, 'Équipe Mu', ['Léa', 'Tom', 'Ana']);
  await page.getByRole('link', { name: "Modifier l'équipe" }).click();
  await expect(page.getByRole('heading', { name: "Modifier l'équipe" })).toBeVisible();

  await page.getByRole('button', { name: 'Supprimer Tom' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('listitem').filter({ hasText: 'Tom' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Supprimer Ana' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Supprimer Ana' })).toHaveCount(0);
  await expect(page.getByLabel('Prénom')).toBeFocused();
});

test('dialogue d\'arrêt : Échap équivaut à « Continuer », la Daily reprend sans être arrêtée (I4)', async ({ page }) => {
  await page.goto('./');
  await createTeam(page, 'Équipe Nu', ['Léa', 'Tom']);
  await startDaily(page);
  await page.getByRole('button', { name: 'Arrêter la Daily' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await expect(page.getByRole('timer')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Arrêter la Daily' })).toBeFocused();
});

test('parcours v3 : « Terminer la Daily » ouvre le bilan, copie et retour à l\'équipe (S26, S29, S30)', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./');
  await createTeam(page, 'Équipe Bilan', ['Léa', 'Tom']);
  await startDaily(page);
  await page.getByRole('button', { name: 'Suivant' }).click();
  await expect(page.getByRole('button', { name: 'Terminer la Daily' })).toBeVisible();
  await page.getByRole('button', { name: 'Terminer la Daily' }).click();
  await expect(page.getByRole('heading', { name: 'Bilan de la Daily' })).toBeVisible();
  await expect(page.getByText('Aucun dépassement')).toBeVisible();
  await page.getByRole('button', { name: 'Copier le bilan' }).click();
  await expect(page.getByText('Bilan copié.')).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied.split('\n')[0]).toMatch(/^Daily : Équipe Bilan, /);
  expect(copied).toContain('Léa : ');
  await page.getByRole('button', { name: "Retour à l'équipe" }).click();
  await expect(page).toHaveURL(/#\/equipe\/[^/]+$/);
  await expect(page.getByRole('heading', { name: 'Équipe Bilan' })).toBeVisible();
});

test('dépassement reste négatif jusqu\'à « Suivant » (S16)', async ({ page }) => {
  await page.clock.install();
  await page.goto('./');
  await createTeam(page, 'Équipe Nu2', ['Léa', 'Tom']);
  await startDaily(page);
  await page.clock.runFor(2 * 60 * 1000 + 30_000);
  await expect(page.getByText(/^\+00:3\d$/)).toBeVisible();
  await page.clock.runFor(60_000);
  await expect(page.getByRole('timer')).toHaveAccessibleName('Temps restant pour Léa');
  await expect(page.getByText(/^\+01:\d\d$/)).toBeVisible();
  await page.getByRole('button', { name: 'Suivant' }).click();
  await expect(page.getByRole('timer')).toHaveAccessibleName('Temps restant pour Tom');
  await expect(page.getByRole('timer')).toHaveText(/^01:\d\d$/);
});

test('majuscule : la première lettre de chaque prénom ajouté passe en majuscule (S23)', async ({ page }) => {
  await page.goto('./');
  await page.getByLabel("Nom d'équipe").fill('Équipe Maj');
  await page.getByLabel('Prénom').fill('jean-pierre');
  await page.getByLabel('Prénom').press('Enter');
  await page.getByLabel('Prénom').fill('élodie');
  await page.getByLabel('Prénom').press('Enter');
  await expect(page.locator('.member-list .row-title').first()).toHaveText('Jean-pierre');
  await expect(page.locator('.member-list .row-title').nth(1)).toHaveText('Élodie');
  await page.getByRole('button', { name: "Enregistrer l'équipe" }).click();
  await expect(page.getByRole('heading', { name: 'Équipe Maj' })).toBeVisible();
  await expect(page.getByText('Jean-pierre')).toBeVisible();
});

test('mode sombre : suit prefers-color-scheme sans bouton de bascule (S25)', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Nouvelle équipe' })).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(28, 28, 30)');
  await page.emulateMedia({ colorScheme: 'light' });
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(245, 245, 247)');
});

test('suppression d\'équipe depuis Mes équipes, avec confirmation (S21)', async ({ page }) => {
  await page.goto('./');
  await createTeam(page, 'Équipe Supp', ['Léa', 'Tom']);
  await page.getByRole('link', { name: '‹ Mes équipes' }).click();
  await page.getByRole('button', { name: 'Supprimer Équipe Supp' }).click();
  await expect(page.getByRole('alertdialog')).toContainText('Cette action est définitive.');
  await page.getByRole('button', { name: 'Supprimer l\'équipe' }).click();
  await expect(page.getByRole('heading', { name: 'Nouvelle équipe' })).toBeVisible();
});
