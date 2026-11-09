CHANGEMENTS DEMANDÉS

# Revue 6 : Daily Timer Simple, cahier des charges v3

- Revue : indépendante. Aucun fichier de `src/` modifié, rien poussé, rien déployé. Seul `docs/revue-6.md` a été créé.
- Commit revu : `0bd7f24` (branche `main`, arbre de travail propre au moment de la revue).
- Sources de vérité : `docs/brief.md` (version 3), `docs/design.md` (version 3), `docs/decisions.md` (D29 à D64 ; D1 à D8 et D14, D21, D28 ignorées comme remplacées ou caduques).
- Verdict : **CHANGEMENTS DEMANDÉS**. Un bloquant (contraste du bouton principal en thème sombre) et trois points importants restent ouverts. Les vérifications automatiques passent.

## Vérifications exécutées

| Vérification | Résultat |
|---|---|
| `npx ng test --watch=false --browsers=ChromeHeadlessCI` | PASS, 114 tests sur 114 |
| `MSYS_NO_PATHCONV=1 npx ng build --configuration production --base-href "/daily-timer-simple/"` | PASS, code de sortie 0, aucune erreur ni avertissement |
| `npm run e2e` | PASS, 20 tests sur 20 |
| Captures sombres regardées | `docs/captures/v3/05-daily-dark-desktop.png`, `docs/captures/v3/03-presentation-dark-mobile.png`, `docs/captures/v3/01-mes-equipes-dark-mobile.png` |
| Contrastes calculés (formule WCAG 2.x, script hors dépôt) | Voir bloquant B1 |
| Sonde navigateur hors dépôt sur le build de production (Chrome, Playwright) | Reproduit I1 : `C:\Users\HP840G~1\AppData\Local\Temp\claude\7d12b719b5402191\a0157a9c-cab5-4555-9735-af9e66110600\scratchpad\probe\reopen.mjs` |

Le serveur de la sonde a été arrêté après usage. Le dépôt n'a reçu aucune modification.

## Cahier des charges v3, point par point

| # | Exigence | Statut | Preuve |
|---|---|---|---|
| 1 | Chronomètre démarré au clic « Commencer la Daily » | OK | `src/app/pages/preparation/preparation.ts` `start()` (l.97-110) appelle `timer.start` ; `src/app/services/daily-timer.service.ts` `start()` (l.184-191) ; test unitaire l.29 ; e2e « parcours complet » |
| 2 | Dépassement : décompte négatif rouge « +mm:ss », « Temps dépassé », reste négatif jusqu'à « Suivant » | OK (mineur M8) | `daily.html` l.16 et l.23 ; `daily-timer.service.ts` `countdown` et `overrunLabel` (l.167-171) ; `daily-run.ts` `remainingMs` ; e2e « dépassement » (l.253) et « dépassement reste négatif jusqu'à Suivant » (l.316) |
| 3 | Fin : « Terminer la Daily » remplace « Suivant » au dernier membre, ouvre le bilan, seul bouton qui termine | OK, avec écart I3 sur « Passer ce membre » | `daily.html` l.68 et l.70 ; `daily.ts` `endsDaily`, `advance`, `finish` ; `app.routes.ts` `bilanReady` ; e2e l.296 |
| 4 | Temps non utilisé perdu | OK | `daily-run.ts` `advanceFrom` (l.125-142) remet `elapsedMs` à 0 pour le membre suivant ; tests unitaires |
| 5 | Rechargement ou fermeture : même membre, même temps, même ordre, en pause, rien ne repart sans clic, temps de fermeture non compté | OK après rechargement sur l'écran de la Daily ; KO à la réouverture par la racine | Rechargement : `daily-timer.service.ts` `restore` (l.342-364), `persist` (l.309-331), e2e l.57. Réouverture par la racine : I1 |
| 6 | Bilan : temps parlé, alloué, dépassement, passé ; copie ; retour à l'équipe ; pas d'historique | OK (mineur M6) | `bilan.html` ; `report-text.ts` ; `bilan.ts` `copy` et `back` ; le bilan est un signal, sans stockage (D56) ; e2e l.296 |
| 7 | Garde de sortie : retour arrière ouvre « Quitter la Daily ? », « Continuer » annule, « Quitter » (« Arrêter ») arrête | OK | `app.routes.ts` `leaveDaily` (l.40-47) ; `daily.ts` `leaveDaily` (l.142) ; `daily.html` l.79-91 ; e2e l.84 |
| 8 | Suppression d'équipe depuis « Mes équipes » avec confirmation | OK | `my-teams.html` l.35-46 (dialogue, « Annuler » par défaut) ; `my-teams.ts` `confirmDelete` ; e2e l.354 « suppression d'équipe depuis Mes équipes, avec confirmation » |
| 9 | Confirmation avant un enregistrement qui supprime un membre | OK | `team-editor.ts` `onSave` (l.162-178) et `cancelRemoval` ; `team-editor.html` l.120-130 |
| 10 | Confirmation avant arrêt de la Daily | OK | `daily.html` l.79-102 ; `daily.ts` `stopDaily` ; e2e l.102 et l.284 |
| 11 | « Mes équipes » trié alphabétiquement | OK | `team.store.ts` `sortedTeams` (l.86-89), `localeCompare(…, 'fr')` |
| 12 | Espace de 16 px sous « Nouvelle équipe », ordinateur et mobile | OK (vérifié sur capture mobile sombre et lecture CSS pour l'ordinateur, non mesuré) | `src/styles.css` `.create-button` (l.249-252) et règle mobile (l.820-825) |
| 13 | Prénoms : majuscule à l'ajout, sans text-transform, doublons refusés à la saisie, pas de dédoublonnage au chargement | OK (mineur M5) | `team-editor.ts` `addMember` (l.205-217) ; `team-validation.ts` `capitalizeFirst` (l.54-61) et `validateMemberName` (l.32-48) ; `team.store.ts` `parseTeamFields` (l.29-33, sans dédoublonnage) ; `text-transform` absent hors `bilan.css` (valeur `none`) |
| 14 | Mode sombre suivant prefers-color-scheme, sans bouton | OK | `src/styles.css` l.51-79 ; `index.html` `color-scheme` ; aucun bouton de bascule ; e2e l.345 |
| 15 | Contrastes WCAG AA dans les deux thèmes | KO (bloquant B1) | Bouton principal en sombre : 2,19:1 au repos, 1,90:1 au survol, 1,74:1 à l'appui. Les autres couples vérifiés passent (voir section suivante) |
| 16a | Accessibilité : focus visible | OK, avec écart mineur M4 | `styles.css` l.126-130 (`:focus-visible`) ; M4 pour les champs |
| 16b | Accessibilité : dialogues piégés | OK | `confirm-dialog.ts` `onDocumentKeydown` (l.66-89) ; `inert` sur `main` (`daily.html` l.2, `team-editor.html` l.1, `my-teams.html` l.1) ; e2e l.102 |
| 16c | Accessibilité : réduction des mouvements | OK | `styles.css` l.170-179 (glissement d'entrée désactivé), l.797-807 ; `confirm-dialog.css` (animation de fondu seul) |
| 16d | Accessibilité : 320 px sans défilement horizontal | OK, fallback manquant (mineur M9) | e2e l.141, l.156, l.190 ; `app.css` l.4 (`overflow-x: clip` seul) |
| 17 | Aucune donnée envoyée à l'extérieur | OK | Aucun `fetch`, `XMLHttpRequest`, `WebSocket` ni `sendBeacon` dans `src/` ; `index.html` ne charge aucune ressource externe ; e2e l.121 |
| P1 | Parcours : à l'ouverture, si une Daily est en cours, ouvrir l'écran (e) en pause (brief l.59, S1 et S27) | KO (important I1) | `app.routes.ts` `home` (l.15) et redirection de `''` (l.50) ignorent la Daily enregistrée |
| P2 | « Passer ce membre » disponible pour le membre qui parle (décision 11, brief l.257) | KO (important I3) | `daily.html` l.31 masque le bouton au dernier membre |
| P3 | Écran (a) vide et lien « Annuler » en création (brief l.82 et l.501) | KO (important I2) | `team-editor.html` l.105 ; `my-teams.html` l.31 ; D49 (`decisions.md` l.55) |

### Contrastes vérifiés (formule WCAG 2.x, hors dépôt)

| Couple | Ratio | Seuil | Verdict |
|---|---|---|---|
| Blanc sur `--color-accent` sombre `#64B5FF` (bouton principal) | 2,19:1 | 4,5:1 | KO |
| Blanc sur `--color-accent-hover` sombre `#7EC2FF` | 1,90:1 | 4,5:1 | KO |
| Blanc sur `--color-accent-pressed` sombre `#8ACBFF` | 1,74:1 | 4,5:1 | KO |
| `#1C1C1E` (`--color-on-fill` sombre) sur `#64B5FF` | 7,77:1 | 4,5:1 | OK, valeur attendue par design 2.2 |
| Blanc sur `--color-accent` clair `#0066CC` | 5,57:1 | 4,5:1 | OK |
| `--color-accent` sombre sur `--color-surface-sunken` sombre | 5,19:1 | 4,5:1 | OK |
| `--color-error` sombre sur `--color-surface-sunken` | 4,97:1 | 4,5:1 | OK |
| `--color-text-secondary` sombre sur `--color-surface-sunken` | 5,13:1 | 4,5:1 | OK |
| `--color-border-control` clair sur blanc | 3,93:1 | 3:1 | OK (composant) |

## Constats

### Bloquant

**B1. Texte du bouton principal illisible en thème sombre.**
- Fichier et ligne : `src/styles.css` l.399-403, `.btn-primary { color: #ffffff; }` (l.401). Le jeton `--color-on-fill` est défini (l.14 en clair, l.62 en sombre) mais n'est pas utilisé ici. Concerne tous les boutons `btn-primary` : `daily.html` l.67 et l.70, `my-teams.html` l.10, `presentation.html`, `preparation.html` l.58, `team-editor.html` l.109, `bilan.html` l.45, `confirm-dialog.html` (action principale).
- Scénario d'échec : en thème sombre, « Suivant », « Démarrer une Daily », « Nouvelle équipe », « Enregistrer l'équipe » et « Continuer » ont un texte blanc sur fond bleu clair : 2,19:1 au repos, 1,90:1 au survol, 1,74:1 à l'appui. Seuil WCAG AA : 4,5:1. Les captures le montrent : `docs/captures/v3/05-daily-dark-desktop.png` (« Suivant »), `03-presentation-dark-mobile.png` (« Démarrer une Daily »), `01-mes-equipes-dark-mobile.png` (« Nouvelle équipe »). Le design (2.2 et 2.4, changelog 9) prévoit `#1C1C1E` (7,77:1).
- Correction proposée : dans `.btn-primary`, remplacer `color: #ffffff;` par `color: var(--color-on-fill);`. Le clair reste blanc (`--color-on-fill: #ffffff`). Aucune autre modification nécessaire. Ajouter un test de contraste ou une vérification de couleur calculée en thème sombre.

### Important

**I1. La Daily en cours n'est pas reprise à l'ouverture de l'application, et une nouvelle Daily écrase la première sans avertissement.**
- Fichiers et lignes : `src/app/app.routes.ts` l.15 (`home` ne regarde que les équipes) et l.50 (`path: ''` redirige vers `home`). `src/app/services/daily-timer.service.ts` `start()` (l.184-191) écrase la session et le stockage. `src/app/pages/preparation/preparation.ts` l.107-108.
- Exigence : brief l.59 (« si une Daily est en cours, l'application ouvre (e) en pause (S27) ») et S1 (brief l.288).
- Scénario reproduit (sonde navigateur sur le build de production) : création d'une équipe, « Démarrer une Daily », « Commencer la Daily », puis chargement de l'adresse racine. Résultat : l'URL devient `#/equipes`, « Mes équipes » s'affiche, aucun bandeau « Daily en pause ». La Daily reste dans le stockage. Puis « Ouvrir », « Démarrer une Daily », « Commencer la Daily » : aucun dialogue, la Daily enregistrée est remplacée par une nouvelle à 02:00. La progression est perdue sans avertissement.
- Variante : une équipe supprimée depuis « Mes équipes » pendant qu'une Daily est enregistrée laisse une Daily orpheline, que la garde `dailyRunning` (l.25-28) accepte encore.
- Correction proposée : dans `home`, si `inject(DailyTimerService).session()` n'est pas nul, renvoyer `/equipe/${teamId}/daily`. Dans `Preparation.start()`, si une autre Daily est en cours, demander confirmation avant `timer.start`, ou bloquer la création. Ajouter un test e2e « réouverture à la racine pendant une Daily » et un test unitaire de `home`.

**I2. Lien « Annuler » en création et écran (a) vide : la décision D49 ne reprend pas le défaut du brief.**
- Fichiers et lignes : `src/app/pages/team-editor/team-editor.html` l.105 (« Annuler » toujours présent) ; `src/app/pages/team-editor/team-editor.ts` l.107-114 ; `src/app/pages/my-teams/my-teams.html` l.31 (« Aucune équipe pour l'instant. ») ; `docs/decisions.md` D49 (l.55).
- Exigence : brief l.82, « Vide : non affiché » pour (a) ; brief l.95 et l.501, lien « Annuler » en création, « Ramène à (a) s'il existe au moins une équipe, sinon le lien n'est pas affiché ». D49 annonce ce choix comme « défaut du point à valider 1 », ce qui est faux : le défaut du brief est l'inverse.
- Scénario d'échec : sans aucune équipe, l'écran (b) affiche « Annuler ». Un clic mène à (a) vide, avec « Aucune équipe pour l'instant. », alors que le brief exclut cet écran. Le brief et le code ne disent plus la même chose.
- Correction proposée : soit masquer « Annuler » quand `store.teams().length === 0` (conforme au défaut du brief), soit faire trancher le client et corriger le brief (section 2 et section 6, point 1), puis D49, en retirant l'affirmation « défaut ».

**I3. « Passer ce membre » est masqué pour le dernier membre qui parle : un absent est compté comme ayant parlé.**
- Fichier et ligne : `src/app/pages/daily/daily.html` l.31 (`@if (timer.current() && !isLast())`). Le bouton « Passer » de la ligne n'existe pas non plus pour le membre en cours (`daily.html` l.36-60).
- Exigence : décision 11 (brief, changelog l.27) : « Possible pour le membre qui parle et pour un membre à venir » ; brief l.257 (« Possible pour le membre qui parle »). Le design 5.5.1 (l.576) masque le bouton au dernier membre avec « [à valider] », mais ce point n'est pas listé dans le brief section 6.
- Scénario d'échec : le dernier membre de la liste est absent. Il est le membre qui parle, et aucun « Passer » n'est proposé. Le Scrum Master ne peut qu'appuyer sur « Terminer la Daily ». Le bilan indique alors « parlé » avec un temps (par exemple 00:03), au lieu de « passé ». Le bilan devient faux.
- Correction proposée : afficher « Passer ce membre » aussi au dernier membre. Le code gère déjà l'état terminé (`passMember` → `currentIndex` à -1, « Terminer la Daily » devient l'action principale). Sinon, faire valider le masquage par le client et l'ajouter au brief section 6, sans le laisser en « [à valider] » dans le design seul.

### Mineur

**M1. `prefers-contrast: more` n'est pas appliqué en thème sombre (connu, confirmé).**
- Fichier et lignes : `src/styles.css` l.81-85 (bloc `:root`, spécificité 0,1,0) et l.51-79 (bloc sombre, qui définit `--color-border-control` l.69 avec une spécificité 0,2,0).
- Scénario : système en sombre et contraste renforcé, la bordure reste `#8E8E93` (4,27:1), pas le texte secondaire.
- Correction proposée : placer `@media (prefers-contrast: more) { :root:not([data-theme='light']) { --color-border-control: var(--color-text-secondary); } }` à l'intérieur du bloc sombre, après le bloc des jetons, ou au même niveau de spécificité.

**M2. Règle morte avec une couleur en dur.**
- Fichier et lignes : `src/styles.css` l.496-498, `.row-text-hover:hover { background: #f9f9fb; }`. Aucune utilisation dans `src/`.
- Scénario : si la classe est réutilisée, une bande claire apparaît en thème sombre.
- Correction proposée : supprimer la règle.

**M3. Jeton `--material-edge` défini mais inutilisé ; filet de la barre d'actions en dur.**
- Fichiers et lignes : `src/styles.css` l.26 et l.74 (défini), l.678 (`border-top: 1px solid rgba(255, 255, 255, 0.4)`).
- Scénario : en sombre, un filet blanc à 40 % sur une barre sombre translucide, plus visible que prévu (design : `rgba(255,255,255,0.08)` en sombre).
- Correction proposée : `border-top: 1px solid var(--material-edge);`.

**M4. Champs : l'anneau de focus est supprimé (M2 de la revue 4, toujours ouvert).**
- Fichier et lignes : `src/styles.css` l.561-565, `.field-input:focus-visible { box-shadow: none; border-bottom: 2px solid var(--color-focus); }`.
- Scénario : le focus reste visible par la bordure seulement. Le motif du design (`--shadow-focus`) n'est pas respecté pour les champs.
- Correction proposée : retirer `box-shadow: none;` pour utiliser `--shadow-focus` (la bordure 2 px reste).

**M5. Prénoms dupliqués au chargement : `track member` produit des clés en double (R5-m4, toujours ouvert).**
- Fichier et ligne : `src/app/pages/team-editor/team-editor.html` l.78 (`@for (member of members(); track member)`) ; `src/app/services/team.store.ts` l.29-33 (aucun dédoublonnage, conforme à D45).
- Scénario : un stockage contenant deux « Léa » (modification manuelle ou ancienne version) produit des avertissements Angular NG0955 en développement, et un retrait peut sortir le mauvais élément du DOM, ce qui fausse le focus.
- Correction proposée : ne pas appliquer la correction de la revue 5 (dédoublonner au chargement), qui contredit D45 et le brief section 3.2. Utiliser une clé stable par ligne (identifiant généré au chargement) au lieu du nom.

**M6. Mot « parlé » répété dans chaque ligne du bilan (connu, confirmé).**
- Fichier et ligne : `src/app/pages/bilan/bilan.html` l.14 (libellé de statut « parlé » ou « passé ») et l.18 (`<dt>Parlé</dt>`).
- Scénario : le lecteur d'écran annonce « parlé » deux fois par membre.
- Correction proposée : n'afficher le statut que pour « passé » (le temps parlé suffit pour « parlé »).

**M7. Ordre visuel des boutons du dialogue et ordre de tabulation divergent (R5-m2, toujours ouvert).**
- Fichiers et lignes : `src/styles.css` l.779-794 (`row-reverse`, colonne sous 340 px) ; `src/app/shared/confirm-dialog/confirm-dialog.html` l.12 (ordre DOM : « Continuer » en premier).
- Scénario : à partir de 340 px, « Arrêter » est à gauche et « Continuer » à droite, mais la tabulation atteint « Continuer » en premier (WCAG 2.4.3).
- Correction proposée : consigner l'écart dans `docs/design.md` (4.13) et le faire accepter, ou placer « Arrêter » en premier dans le DOM en adaptant le piège de focus de `daily.ts`.

**M8. Dépassement de moins d'une seconde : écran et bilan divergent.**
- Fichiers et lignes : `src/app/services/daily-timer.service.ts` l.171 (`overrunLabel`, arrondi inférieur) et `daily.html` l.23 (affiche « +00:00 » en rouge dès que le décompte est négatif) ; `src/app/domain/daily-run.ts` l.174-177 et `bilan.html` l.28 (affiche « — » quand le dépassement est inférieur à une seconde).
- Scénario : un membre dépasse de 0,4 s. L'écran affiche « +00:00 » en rouge, le bilan « — ».
- Correction proposée : aligner les deux calculs sur la même règle (par exemple n'afficher « +mm:ss » qu'à partir d'une seconde entière, sur l'écran comme dans le bilan).

**M9. Repli pour le défilement horizontal à 320 px (R5-m1, toujours ouvert).**
- Fichier et ligne : `src/app/app.css` l.4 (`overflow-x: clip;` seul).
- Scénario : sur un navigateur qui ne connaît pas `clip` (Safari antérieur à 16), la déclaration est ignorée et le défilement horizontal revient à 320 px.
- Correction proposée : ajouter `overflow-x: hidden;` juste avant `overflow-x: clip;`.

**M10. Décalage visuel pendant le glissement d'entrée (R5-m5, toujours présent, cosmétique).**
- Fichier et lignes : `src/styles.css` l.161-179 (`@starting-style`, `translateX(±24px)`, 280 ms).
- Scénario : pendant le glissement, le bord de l'écran est coupé de quelques pixels à 320 px. Non bloquant.
- Correction proposée : réduire le décalage à 0 sous 340 px, ou ne garder que le fondu.

Constats de la revue 4 et de la revue 5 non traités dans cette passe, hors périmètre demandé : D1 à D8 non marquées caduques dans `docs/decisions.md` (M6 de la revue 4), et `docs/brief.md` et `docs/design.md` désormais commités.

## Synthèse

- Vérifications : tests unitaires 114/114, build de production OK, e2e 20/20, captures sombres regardées.
- Constats : 1 bloquant (B1), 3 importants (I1, I2, I3), 10 mineurs (M1 à M10).
- Points du cahier v3 KO : contraste en sombre (B1), réouverture pendant une Daily (I1), « Passer » pour le dernier membre (I3), écran (a) vide (I2).
- Verdict : **CHANGEMENTS DEMANDÉS**. Pour passer en APPROUVÉ : corriger B1, traiter I1 à I3 (corriger ou faire trancher le client et mettre à jour le brief), puis relancer les trois vérifications.
