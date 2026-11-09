CHANGEMENTS DEMANDÉS

# Revue indépendante n° 2 : Daily Timer Simple

- Dépôt relu : C:\Projects\daily-timer-simple (branche main), diff `ab51be3..HEAD` (8 commits, de c6a70ba à a4a5b01)
- Sources de vérité : docs\brief.md, docs\design.md, docs\decisions.md (D28 compris)
- Aucun fichier de src\ modifié, aucun push, aucun déploiement
- Méthode de contrôle des correctifs : copie de HEAD dans le scratchpad, avec les fichiers source d'avant correction (`ab51be3`) et les tests de HEAD. Les nouveaux tests doivent alors échouer. Le dépôt n'a pas été modifié.

## Synthèse

- Bloquant : 0
- Important : 1
- Mineur : 2
- Constats de revue-1 non traités et non consignés (M1 à M8, hérités, hors diff) : 8

Les correctifs B1, B3, I1, I2 et I4 sont réels, et leurs tests échouent sur l'ancien code. I5 est corrigé dans le YAML mais n'a pas pu être exécuté ici. I3 est corrigé pour la présentation seulement : l'arrivée sur l'éditeur laisse toujours le focus dans le vide. Les vérifications automatiques passent.

## Vérifications exécutées

| Vérification | Résultat | Preuve |
|---|---|---|
| `npx ng test --watch=false --browsers=ChromeHeadlessCI` | 76/76 SUCCESS, code 0 | Sortie karma, `TOTAL: 76 SUCCESS` |
| `MSYS_NO_PATHCONV=1 npx ng build --configuration production --base-href "/daily-timer-simple/"` | OK, code 0 | Sortie ng build, `Output location: ...dist\daily-timer-simple` |
| `npm run e2e` (après le build ci-dessus) | 7 passed, code 0 | Sortie Playwright, 7 tests dont 3 nouveaux |
| Build et e2e sur le code d'avant correction (scratchpad) | 3 échecs : création (focus), retour arrière (I2), Maj+Tab (I1) | Sortie Playwright du scratchpad |
| Sondes navigateur sur le build courant (Chrome, scripts jetables hors dépôt) | Voir tableau ci-dessous | Sorties des sondes |

## Vérification des constats de revue-1

| Constat | Statut | Preuve |
|---|---|---|
| **B1** Focus perdu au 15e membre | **Corrigé** | Les 2 tests `garde le focus dans la liste après le 15e membre...` (team-editor.spec.ts, fin du describe S3) échouent sans correctif (scratchpad). Navigateur : après le 15e prénom validé par Entrée, `activeElement` = bouton « Supprimer MemM ». Le bouton « Ajouter » devient désactivé, sans perte de focus. |
| **B3** Équipe non enregistrée affichée comme enregistrée | **Corrigé** | `TeamStore.save` écrit avant de modifier la mémoire (team.store.ts lignes 62-73). Les tests `n'affiche pas une équipe non écrite...` et `garde l'équipe précédente...` échouent sans correctif. Le test `reste sur l'écran et affiche une erreur...` (team-editor.save.spec.ts) échoue aussi sans correctif. |
| **I1** Focus du dialogue d'arrêt contournable | **Corrigé**, avec réserves (voir M-N1, M-N2) | `main` est `inert` pendant la confirmation (daily.html ligne 2, test `rend le fond inerte...`), et un écouteur `document:keydown` ramène Tab et Maj+Tab dans le dialogue (daily.ts lignes 84-96). Les tests `rend le fond inerte...` et `ramène le focus...` échouent sans correctif. e2e Maj+Tab : échoue sans correctif, passe avec. Navigateur : clic sur le voile puis Tab reste dans le dialogue. |
| **I2** La Daily continue après retour arrière | **Corrigé** | `ngOnDestroy` appelle `timer.stop()` (daily.ts lignes 65-67). Le test `arrête la Daily quand l'écran est quitté...` échoue sans correctif. e2e `retour arrière pendant la Daily...` échoue sans correctif, passe avec. Navigateur : retour puis avance renvoient à la présentation, sans chronomètre, sans erreur console. |
| **I3** Focus non déplacé sur le titre après changement d'écran | **Partiellement corrigé** (voir I-N1) | Présentation : test `place le focus sur le titre...` et e2e `création...` (`toBeFocused`) échouent sans correctif, et réussissent avec. Navigateur : après « Enregistrer », focus sur H1 « Équipe Probe ». **Éditeur non traité** : depuis la présentation, « Modifier l'équipe » donne `activeElement` = BODY. Aucun test ne couvre l'arrivée sur l'éditeur. |
| **I4** Test S7 « aucun appel réseau » sans valeur | **Corrigé** | Le test espionne désormais `fetch`, `XMLHttpRequest.prototype.open` et `navigator.sendBeacon`. Il ne couvre que `TeamStore`. La vraie garde de bout en bout est le test e2e `aucune requête vers un autre hôte...`, qui enregistre toutes les origines du parcours et passe. Aucun fetch, XHR, sendBeacon ni URL externe dans src\ et public\ (grep). |
| **I5** Déploiement sans barrière de tests | **Corrigé** (relu, non exécuté) | deploy-pages.yml : job `test` qui appelle `ci.yml` (`workflow_call` ajouté), et job `build` avec `needs: test`. Les permissions de `ci.yml` héritent de celles du workflow appelant, sans élévation. Un run GitHub Actions n'a pas pu être lancé ici. |

## Nouveaux constats

### Bloquants

Aucun.

### Importants

**I-N1. Focus perdu à l'arrivée sur l'éditeur (I3 incomplet)**
- Fichiers : `src\app\pages\team-editor\team-editor.ts` ligne 51 (constructeur, aucun focus) ; `src\app\pages\team-editor\team-editor.html` ligne 2 (`<h1>` sans référence) ; lien de départ `src\app\pages\presentation\presentation.html` ligne 18.
- Scénario : sur la présentation, l'utilisateur active « Modifier l'équipe » au clavier. Le lien disparaît du DOM au changement d'écran, et `document.activeElement` vaut BODY (constaté dans le navigateur). Un lecteur d'écran n'annonce pas l'écran « Modifier l'équipe ». Le design (docs\design.md ligne 379) exige le focus sur le `<h1>` après tout changement d'écran. revue-1 (I3) demandait la présentation et l'éditeur. Le commit 06754b6 ne traite que la présentation.
- Correction : ajouter `private readonly title = viewChild<ElementRef<HTMLElement>>('title');` et `#title` sur le `<h1>` de `team-editor.html`, puis dans le constructeur `afterNextRender(() => this.title()?.nativeElement.focus(), { injector: this.injector });`. Ajouter dans `team-editor.spec.ts` un test « place le focus sur le titre à l'ouverture » (en modification et en création), qui échoue sans correctif.

### Mineurs

**M-N1. Échap sans effet quand le focus est sur BODY pendant la confirmation**
- Fichiers : `src\app\pages\daily\daily.ts` lignes 84-96 (`onDocumentKeydown` ne traite que Tab) et lignes 104-108 (`onDialogKeydown`, qui ne traite Échap que si le focus est dans le dialogue).
- Scénario : clic sur le voile (le focus va sur BODY), puis Échap. Constaté dans le navigateur : le dialogue reste ouvert. Le design (docs\design.md lignes 279 et 401) prévoit « Escape = Continuer ».
- Correction : dans `onDocumentKeydown`, traiter `Escape` par `event.preventDefault(); this.continueDaily();` quand `confirming()` est vrai. Ajouter un test : blur, puis `keydown` Échap sur le document, et vérifier `confirming` faux.

**M-N2. Le test e2e « Tab » ne prouve pas le défaut I1**
- Fichier : `e2e\parcours.spec.ts` lignes 76-88.
- Constat : la variante `Tab` passe sur le build d'avant correction. Après un clic sur le voile, le point de départ de la tabulation est le voile, qui précède la boîte de dialogue : le focus entre dans le dialogue sans piège. Seule la variante `Maj+Tab` échoue sans correctif. Le test unitaire, lui, échoue bien sans correctif.
- Correction : forcer le focus sur BODY avant la touche (par exemple `await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())`), puis vérifier que la variante `Tab` échoue sur le build d'avant correction. Si elle passe encore, s'appuyer sur le test unitaire et le noter.

## Constats de revue-1 non traités (hérités, non bloquants)

M1 (prénoms NFD refusés), M2 (classe `.hint` sans style), M3 (état vide absent), M4 (champ désactivé sans style), M5 (animation `row-in` non réduite), M6 (e2e sur un `dist` préexistant), M7 (sortie d'écran absente), M8 (Échap perd les modifications sans confirmation). Aucun n'est touché par le diff, ni consigné dans docs\decisions.md. Ils peuvent être traités ou consignés, comme le demandait revue-1.

## Verdict

CHANGEMENTS DEMANDÉS.

- Bloquant : 0
- Important : 1 (I-N1, I3 incomplet sur l'éditeur)
- Mineur : 2 (M-N1, M-N2)

Le passage à APPROUVÉ demande la correction de I-N1, avec son test qui échoue sans correctif. M-N1 et M-N2 sont à traiter ou à consigner. Les vérifications automatiques passent (76/76, build, 7/7 e2e).
