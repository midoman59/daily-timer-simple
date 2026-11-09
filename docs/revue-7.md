CHANGEMENTS DEMANDÉS

# Revue 7 : Daily Timer Simple, corrections de la revue 6

- Revue : indépendante, adversariale. Aucun fichier de `src/` modifié, rien poussé, rien déployé. Seul `docs/revue-7.md` a été créé.
- Commit revu : `573aef4` (branche `main`), après les sept commits de correction `781b6df` à `573aef4`.
- Sources de vérité : `docs/brief.md` (v3), `docs/design.md` (v3), `docs/decisions.md` (D29 à D65).
- Verdict : **CHANGEMENTS DEMANDÉS**. Les corrections B1, I1, I2 et I3 sont réelles et couvertes par des tests. M2 est réelle. M3 n'est pas faite. Deux points importants restent : la documentation de design contredit D65, et le remplacement d'une Daily en cours reste possible par des clics normaux (deux onglets). Ce second point relève d'une décision client.

## Vérifications exécutées

| Vérification | Résultat |
|---|---|
| `npx ng test --watch=false --browsers=ChromeHeadlessCI` | PASS, 119 tests sur 119 (114 à la revue 6, +5 nouveaux) |
| `MSYS_NO_PATHCONV=1 npx ng build --configuration production --base-href "/daily-timer-simple/"` | PASS, code de sortie 0, aucun avertissement |
| `npm run e2e` | PASS, 22 tests sur 22 (20 à la revue 6, +2 nouveaux : réouverture à la racine, contraste) |
| Captures sombres regardées | `docs/captures/v3/05-daily-dark-desktop.png` (« Suivant » lisible, texte sombre sur bleu), `docs/captures/v3/03-presentation-dark-mobile.png` (« Démarrer une Daily » lisible), `docs/captures/v3/05-daily-dernier-membre-dark-desktop.png` (« Passer ce membre » présent au dernier membre) |
| Sonde navigateur hors dépôt, deux onglets, clics seulement (build de production) | Reproduit le remplacement d'une Daily (constat IM-1) et la Daily orpheline (constat m-1). Script : `C:\Users\HP840G~1\AppData\Local\Temp\claude\7d12b719b5402191\a0157a9c-cab5-4555-9735-af9e66110600\scratchpad\two-tabs.mjs` et `...\scratchpad\orphan.mjs` |

Le serveur de la sonde a été arrêté après usage. Les dossiers `dist/`, `playwright-report/` et `test-results/` sont générés et ignorés par git.

## Corrections de la revue 6, vérifiées

| Constat | Statut | Preuve | Le test échoue sans la correction ? |
|---|---|---|---|
| **B1** contraste du bouton principal en sombre | Corrigé | `src/styles.css` l.399 : `.btn-primary { color: var(--color-on-fill); }`. Sombre : `#1c1c1e` (l.61), contraste d'environ 8,9:1 au survol (calcul à la main). Captures sombres lisibles. | Oui. e2e « contraste » (`e2e/parcours.spec.ts` l.385-393) mesure le contraste calculé par le navigateur sur « Démarrer une Daily » dans les deux thèmes. Sans la correction, le ratio mesuré en revue 6 était 2,19:1. Pas de test unitaire, couverture par e2e seul. |
| **I1** réouverture à la racine pendant une Daily | Corrigé, partiellement | `src/app/app.routes.ts` l.16-23 : `home` renvoie vers `/equipe/:id/daily` si une session existe et que l'équipe est connue. Test unitaire `src/app/app.routes.spec.ts` (fin du fichier), e2e `e2e/parcours.spec.ts` l.71-83. Le remplacement par « Démarrer une Daily » n'est pas traité (voir IM-1). | Oui pour les deux : sans le garde, la racine renvoie vers `/equipes`. |
| **I2** « Annuler » seulement avec au moins une équipe, liste vide sans bloc | Corrigé | `team-editor.html` l.105 : `@if (isEdit \|\| hasTeams())` ; `team-editor.ts` `hasTeams` ; `my-teams.html` : bloc `@else` « Aucune équipe pour l'instant » supprimé. D49 réécrit dans `decisions.md`. Conforme au brief v3 l.82, l.95 et l.501. | Oui. `team-editor.spec.ts` (« sans aucune équipe, n'affiche pas Annuler ») et `my-teams.spec.ts` (« sans aucune équipe, n'affiche ni liste ni message vide ») échouent sans la correction. |
| **I3** « Passer ce membre » au dernier membre, absent compté « passé » | Corrigé | `daily.html` l.31 : `@if (timer.current())`, sans `!isLast()`. Le domaine (`daily-run.ts`, `passMember`, `advanceFrom`, `reportRows`) était déjà correct : le membre passé reçoit `passed: true` et `spokenSeconds: null`. Test `daily.spec.ts` « un absent en dernier est compté passé au bilan ». D57 remplacé par D65. | Oui. Sans le bouton, `button(el, 'Passer ce membre')!.click()` échoue. |
| **M2** règle morte `.row-text-hover` | Corrigé | Règle supprimée de `src/styles.css`. `grep` sur `src/` et `e2e/` : aucune occurrence restante. | Sans objet (suppression sans effet fonctionnel, pas de test possible). |
| **M3** jeton `--material-edge` inutilisé, filet en dur | **Non corrigé** | Commit `6a3eee6` supprime le jeton (`:root` et bloc sombre). Le filet en dur subsiste : `src/styles.css` l.672 `border-top: 1px solid rgba(255, 255, 255, 0.4);`, en sombre. La revue demandait `var(--material-edge)`. Le design v3 définit ce jeton (`docs/design.md` l.278 : 0,4 clair, 0,08 sombre). Visible en sombre sur `03-presentation-dark-mobile.png`. | Sans objet. |

## Constats

### Bloquant

Aucun bloquant nouveau. Les deux constats connus ne sont comptés comme bloquants que s'ils sont déclenchés par un usage normal. Le remplacement l'est (IM-1), mais seulement avec deux onglets, et il reste une décision client : il est classé important, et non bloquant.

### Important

**IM-1. Remplacement d'une Daily en cours par « Démarrer une Daily » (constat connu, reproduit par clics normaux).**
- Fichiers et lignes : `src/app/pages/preparation/preparation.ts` l.98-110 (`start()`, appel à `timer.start` l.109, sans contrôle de session existante) ; `src/app/services/daily-timer.service.ts` l.184-191 (`start()` écrase la session et le stockage).
- Scénario reproduit (sonde à deux onglets, clics seulement) : onglet 2 ouvert sur « Mes équipes » avant la Daily. Onglet 1 : Daily d'« Alpha » lancée et avancée d'un membre. Onglet 2 : « Ouvrir Beta », « Démarrer une Daily », « Commencer la Daily ». Aucun avertissement. Le stockage contient ensuite la Daily de « Beta » ; la progression d'« Alpha » est perdue. Un onglet ouvert après le début de la Daily est renvoyé vers la Daily grâce à I1, donc l'exposition vient d'un onglet ouvert avant.
- Pourquoi important et non mineur : même perte silencieuse de progression que I1 en revue 6, qui était classé important. Ce n'est pas une URL manuelle.
- Correction proposée (décision client) : dans `Preparation.start()`, si une Daily est en cours pour une autre équipe, demander confirmation (« Remplacer la Daily en cours de Alpha ? », « Continuer » par défaut), ou bloquer avec un lien « Reprendre la Daily en cours ». Si le client accepte le risque, l'enregistrer dans `docs/decisions.md` (D66) et l'écrire dans le brief. Test e2e à deux pages, sur le modèle de `two-tabs.mjs`.

**IM-2. Design v3 contredit D65 et le code, alors que la revue 6 demandait de ne pas laisser « [à valider] » dans le design seul.**
- Fichier et ligne : `docs/design.md` l.576 : « Masqué si le membre qui parle est le dernier (aucun membre à passer à sa place) [à valider] ». `docs/decisions.md` D65 (ligne 71) déclare ce masquage remplacé, et `daily.html` l.31 l'a supprimé. Le commit `0208c83` ne modifie pas `docs/design.md`.
- Scénario d'échec : un développeur ou le client qui relit le design v3 (source de vérité) remettra le bouton masqué au dernier membre, et le bilan indiquera « parlé » pour un absent. C'est exactement le défaut I3.
- Correction proposée : dans `docs/design.md` l.576, écrire « Visible, y compris au dernier membre qui parle (D65) », sans « [à valider] ». Vérifier que l.551 reste cohérent. Mettre à jour le changelog du design.

### Mineur

**m-1. M3 non corrigé, et jeton supprimé alors que le design le définit (revue 6, M3).**
- Fichier et ligne : `src/styles.css` l.672 (`rgba(255, 255, 255, 0.4)` en dur, en sombre). Jeton supprimé dans `:root` et dans le bloc sombre. `docs/design.md` l.278, l.754, l.794 le définissent encore.
- Scénario : en sombre, filet blanc à 40 % au-dessus de la barre d'actions mobile, au lieu de 8 % selon le design.
- Correction proposée : rétablir le jeton (0,4 clair, 0,08 sombre), puis `border-top: 1px solid var(--material-edge);` à la ligne 672. Ou, si la suppression est voulue, mettre à jour le design et décrire le choix dans `decisions.md`.

**m-2. Daily orpheline : une Daily reste ouvrable après la suppression de son équipe (constat connu, reproduit par clics normaux).**
- Fichiers et lignes : `src/app/app.routes.ts` l.33-36 (`dailyRunning` ne vérifie que `session.teamId === id`, pas l'existence de l'équipe).
- Scénario reproduit (sonde à deux onglets) : onglet 1 en Daily sur « Alpha ». Onglet 2 : « Supprimer l'équipe » sur Alpha. Onglet 1 rechargé : la Daily d'« Alpha » reste affichée (titre « Alpha »), avec les commandes habituelles.
- Impact limité : la Daily se termine et le bilan fonctionne. Seule la présence d'une équipe supprimée à l'écran pose problème.
- Correction proposée (décision client) : ajouter `inject(TeamStore).find(id)` au garde `dailyRunning` ; si l'équipe n'existe plus, arrêter la session et renvoyer à « Mes équipes ».

**m-3 à m-10. Constats de la revue 6 restant ouverts, hors de ce lot (non traités, non bloquants).**
- M1 `prefers-contrast: more` non appliqué en sombre (`src/styles.css` l.81-85).
- M4 anneau de focus des champs supprimé (`src/styles.css` l.561-565).
- M5 `track member` avec des prénoms dupliqués (`team-editor.html` l.78).
- M6 « parlé » répété dans chaque ligne du bilan (`bilan.html` l.14 et l.18).
- M7 ordre visuel des boutons du dialogue et ordre de tabulation (`confirm-dialog.html` l.12, `styles.css` l.779-794).
- M8 dépassement inférieur à une seconde : « +00:00 » à l'écran, « — » au bilan (`daily-timer.service.ts` l.171, `bilan.html` l.28).
- M9 repli `overflow-x: hidden` absent avant `clip` (`src/app/app.css` l.4).
- M10 glissement d'entrée qui coupe le bord à 320 px (`src/styles.css` l.161-179).

## Synthèse

- Vérifications : tests unitaires 119/119, build de production OK sans avertissement, e2e 22/22, captures sombres regardées.
- Corrections de la revue 6 : B1, I1, I2, I3 et M2 réelles, avec des tests qui échoueraient sans elles. M3 non faite.
- Constats : 0 bloquant, 2 importants (IM-1, IM-2), 10 mineurs (m-1 à m-10).
- Constats connus de l'équipe : le remplacement d'une Daily (IM-1) est reproduit par clics normaux avec deux onglets, donc classé important. La Daily orpheline (m-2) est reproduite, mais d'impact limité.
- Pour passer en APPROUVÉ : corriger IM-2 (une modification de `docs/design.md`) et corriger ou faire trancher par le client IM-1 (dialogue de confirmation, ou acceptation documentée en D66). Corriger m-1 est recommandé, sans bloquer.
