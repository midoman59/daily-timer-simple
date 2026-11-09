CHANGEMENTS DEMANDÉS

# Revue 4 : Daily Timer Simple, cahier des charges v2

- Revue : indépendante, adversariale. Aucun fichier de `src/` modifié, rien poussé, rien déployé.
- Sources de vérité : `docs/brief.md` (version 2, working tree), `docs/design.md` (version 2, working tree), `docs/decisions.md` (D1 à D8 ignorées, caduques).
- Commit revu : `ec967cc` (branche `main`), plus les modifications non commitées de `docs/brief.md`, `docs/design.md` et `public/icon.svg`.
- Captures examinées : `docs/captures/02-creation-mobile.png`, `04-preparation-mobile.png`, `05-daily-desktop.png`.

## Vérifications exécutées

| Commande | Résultat |
|---|---|
| `npx ng test --watch=false --browsers=ChromeHeadlessCI` | PASS, 100 tests sur 100 |
| `MSYS_NO_PATHCONV=1 npx ng build --configuration production --base-href "/daily-timer-simple/"` | PASS, aucune erreur |
| `npm run e2e` | PASS, 8 tests sur 8 |

Sondes complémentaires (script de contrôle hors dépôt, sur le build de production servi par `e2e/serve-dist.mjs`) :

- Largeur de document à 320 px, avec des prénoms ordinaires : Mes équipes 320 px, Présentation 320 px, Création 320 px, **Préparation 340 px, Daily 344 px** (défilement horizontal).
- Suppression du membre du milieu (Ben, sur Ana / Ben / Cléo) : `document.activeElement` = BODY.
- Migration d'une clé `daily-timer-simple.team.v1` avec `durationMinutes` : l'équipe s'affiche (« Ancienne | 2 membres »), la clé v1 est retirée.
- Dépassement simulé (+121 s) : décompte « 00:00 », « +00:01 » visible, couleur `rgb(179, 38, 30)`, libellé « Temps dépassé » visible. « Passer au suivant » remet le décompte à « 02:00 ».
- Dialogue d'arrêt : à 1280 px, « Continuer » à gauche (x 509), « Arrêter » à droite (x 674). À 320 px, « Arrêter » est au-dessus (y 327) et « Continuer » en dessous (y 389).
- Contrastes recalculés (WCAG) : les valeurs de `design.md` section 2.2 sont exactes (minimum 4,66:1 pour le texte secondaire ; 3,93:1 pour le filet de champ).
- Aucune URL externe dans `src/` (hors `www.w3.org` des SVG) ; aucune police web ; aucun `transition: all` ; aucun `@keyframes`.

## Cahier des charges v2, point par point

| # | Exigence | Statut | Preuve |
|---|---|---|---|
| 1 | Création d'équipe : nom et membres seulement, aucune durée | OK | `team-editor.html` (aucun champ durée) ; e2e `parcours.spec.ts` l.28 (`Durée de la Daily` absent) |
| 2 | Accueil : « Mes équipes » si une équipe existe, création sinon | OK | `app.routes.ts` l.14 (`home`) ; e2e l.27 et l.67-78 |
| 3 | Présentation : nom, nombre de membres, liste, « Démarrer une Daily », « Modifier l'équipe » | OK | `presentation.html` ; `docs/captures/03-*` non examinée, rendu lu dans le code |
| 4 | Préparation : temps 1 à 5 min, défaut 2 min, par membre | OK | `preparation.ts` l.19, l.22 (`DEFAULT_MINUTES = '2'`), `validateMinutes` ; e2e l.37 (« Temps prévu : 2:00 ») |
| 5 | Ordre de l'équipe ou aléatoire, tiré une fois au démarrage | OK (unitaire) | `daily-run.ts` `createDailyRun` l.48-61 (tirage à la création, ordre fixe ensuite) |
| 6 | Rien n'est enregistré dans l'équipe par la Daily | OK | `preparation.ts` n'écrit pas dans `TeamStore` ; seul `team-editor.ts` appelle `save` |
| 7 | Le chronomètre démarre au clic « Commencer la Daily » et jamais avant | OK | `preparation.ts` l.97-110 (`start`) ; `daily-timer.service.ts` l.88-95 ; e2e l.34-36 |
| 8 | « Passer au suivant » ; le décompte repart du temps alloué au suivant | OK | `daily-run.ts` `nextMember` ; e2e l.43 ; sonde : « 02:00 » après passage |
| 9 | Passer un membre, y compris celui qui parle | OK | `daily.html` l.28 (« Passer ce membre ») et l.54 (« Passer » par ligne) ; `daily-run.ts` `passMember` l.108-118 ; e2e l.40 (membre à venir) |
| 10 | Décompte qui continue après la durée, rouge, « +mm:ss » et texte | OK | `daily.html` l.10, l.17, l.21 ; sonde : « +00:01 », « Temps dépassé », couleur rouge |
| 11 | Arrêt avec confirmation | PARTIEL | Dialogue OK (`daily.html` l.72-90, e2e l.92-110). Mais un retour arrière arrête la Daily sans confirmation (constat I3) |
| 12 | Un membre passé ne revient pas | OK | `daily-run.ts` `passMember` : statut `passed` jamais réinitialisé ; `advanceFrom` ne reprend que `waiting` |
| 13 | Équipes retrouvées au rechargement | OK | `team.store.ts` `load()` ; e2e l.57-65 et l.67-78 |
| 14 | Rechargement pendant une Daily ramène à la présentation, sans relancer le chronomètre | OK | `app.routes.ts` l.24-27 (garde `dailyRunning`) ; e2e l.57-65 (`timer` absent) ; e2e l.80-90 |
| 15 | Équipe v1 (avec durée) reste utilisable, durée ignorée | OK | `team.store.ts` `loadLegacy` l.155-183 ; sonde : équipe affichée, clé v1 retirée |
| 16 | Accessibilité : focus | PARTIEL | Anneau de focus présent (`styles.css` l.81-85). Focus perdu à la suppression d'un membre (constat I1) |
| 17 | Accessibilité : dialogue piégé | OK | `daily.ts` l.139-184 ; e2e l.92-110 (Tab et Maj+Tab répétés). Ordre des boutons contraire au design (constat I2) |
| 18 | Accessibilité : contrastes | OK | Recalcul de 16 couples : tous conformes, valeurs identiques à `design.md` 2.2 |
| 19 | Accessibilité : réduction des mouvements | OK (lecture du code, non testé dans le navigateur) | `styles.css` l.125-134, l.688-697, l.732-743 ; `design.md` section 10 |
| 20 | 320 px sans défilement horizontal | ÉCHEC | Sonde : Préparation 340 px et Daily 344 px pour un viewport de 320 px. Le test e2e ne couvre que `#/equipe/nouvelle` (constat B1) |
| 21 | Aucune donnée envoyée à l'extérieur | OK | Aucune URL externe dans `src/` ; e2e l.112-130 (origines contrôlées) |
| 22 | Tests unitaires, build, e2e | OK | Voir « Vérifications exécutées » |

Captures contre `design.md` :
- `05-daily-desktop.png` : le décompte, le « Temps prévu », « Passer ce membre », les statuts « fait », « En cours », « Passer » suivent le design. Écart : « Arrêter la Daily » est à droite, le design (5.5) le place en bas à gauche (constat M3).
- `04-preparation-mobile.png` : libellés, « Appliquer à tous », contrôle segmenté, barre d'actions avec « Annuler » au-dessus de « Commencer la Daily » : conforme. Le design 4.7 (capsule, chevron, 44 px) est respecté.
- `02-creation-mobile.png` : champ à filet, compteur, bouton texte « Ajouter » : conforme sauf le placement (constat M4). Le filet et la bordure ne sont pas des boîtes.

## Constats

### Bloquant

**B1. Défilement horizontal à 320 px sur Préparation et Daily.**
- Preuve : sonde à 320 px avec des prénoms ordinaires (« Léa », « Tom », « Ana », équipe « Équipe Alpha »). `scrollWidth` = 340 px sur la Préparation et 344 px sur la Daily, pour un viewport de 320 px. La barre d'actions fixe mesure 340 et 344 px de bord droit. Les lignes de temps (`li.row-time`) et le libellé `.row-time .row-title` sont déjà à 324 px.
- Fichiers : `src/app/pages/preparation/preparation.css` l.10-12 (`.row-time .row-title { flex: none }`) et l.18-21 (`.select { flex: none; padding: 0 36px 0 16px }`) ; `src/styles.css` l.589-624 (barre d'actions) et l.102-108 (`.screen`).
- Scénario d'échec : un Scrum Master sur un téléphone de 320 px ouvre « Préparer la Daily ». La page défile horizontalement. Sur la Daily, le même défaut apparaît.
- Correction proposée : rendre la ligne de temps réductible (`min-width: 0` sur `.row-main` et `.row-title`, retirer `flex: none` du libellé, laisser le `select` se réduire sous 320 px, réduire son padding horizontal). Vérifier la largeur de `.action-bar` et des `.btn` (`width: 100%` avec `padding: 0 28px` et `min-width: 160px`). Ajouter un test e2e à 320 px sur chaque écran (a) à (e), avec la mesure de `scrollWidth`, pas seulement sur la création.

### Important

**I1. Focus perdu après la suppression d'un membre.**
- Preuve : sonde. Suppression de Ben (position 2 sur 3) : `document.activeElement` = BODY. Le design (5.2) impose « Le focus ne se perd jamais dans le vide » et « le focus passe au bouton Supprimer de la ligne suivante ».
- Fichiers : `src/app/pages/team-editor/team-editor.ts` l.221-226 (`removeMember` récupère `deleteButtons()[index + 1]` avant la mise à jour) ; `team-editor.html` l.78 (`track $index`).
- Cause : avec `track $index`, Angular retire le dernier nœud DOM, qui est précisément le bouton visé (`next`). Le focus part sur un élément détaché.
- Scénario d'échec : clavier seul, supprimer l'avant-dernier membre. Le focus tombe sur BODY, l'utilisateur doit recommencer la navigation depuis le début de la page.
- Correction proposée : `track member` (les prénoms sont uniques, insensible à la casse, par `validateMemberName`), ou sélectionner le bouton à focaliser après le rendu avec `afterNextRender`. Ajouter un test e2e de suppression au clavier.

**I2. Dialogue d'arrêt : ordre des boutons contraire au design, et « Arrêter » placé en premier sur mobile.**
- Preuve : sonde. À 1280 px, « Continuer » est à gauche (x 509) et « Arrêter » à droite (x 674). À 320 px, « Arrêter » est au-dessus (y 327) et « Continuer » en dessous (y 389). `design.md` 4.13 impose « Arrêter » à gauche, « Continuer » à droite, et « Continuer » en premier quand les boutons sont empilés. `decisions.md` D27 écrit « action sûre en haut », ce que le code ne fait pas.
- Fichiers : `src/styles.css` l.715-729 (`.dialog-actions`, `flex-direction: column-reverse` sous 340 px) ; `src/app/pages/daily/daily.html` l.84-87 (ordre DOM « Continuer », puis « Arrêter ») ; `src/app/pages/daily/daily.ts` l.141-184 (le piège de focus suppose « Continuer » en premier).
- Scénario d'échec : sur un téléphone de 320 px, le bouton destructif est au-dessus. Un tap dans la zone haute arrête la Daily.
- Correction proposée : ordre DOM « Arrêter », puis « Continuer ». En ligne, « Arrêter » est à gauche et « Continuer » à droite. Sous 340 px, `column-reverse` met « Continuer » en haut. Adapter le piège de focus de `daily.ts` (le premier et le dernier élément de tabulation changent). Garder le focus initial sur « Continuer ».

**I3. Retour arrière pendant la Daily : arrêt sans confirmation.**
- Preuve : le test e2e `retour arrière pendant la Daily` (`e2e/parcours.spec.ts` l.80-90) vérifie que la Daily s'arrête sans dialogue. `daily.ts` l.93-95 (`ngOnDestroy` appelle `timer.stop()`). La décision D28 l'assume, mais elle n'est pas listée comme point « à valider » dans `brief.md`.
- Exigence : `brief.md` S17 : « Arrêter la Daily demande une confirmation » ; section 2, écran (e) : « arrêt avec confirmation ». Le retour arrière (bouton du navigateur, geste de retour sur mobile) supprime le chronomètre sans confirmation.
- Scénario d'échec : en pleine Daily, le Scrum Master fait un retour arrière par erreur. Le chronomètre et la progression sont perdus sans avertissement.
- Correction proposée : intercepter la sortie (`CanDeactivate` ou garde sur la route `daily`) pour afficher le dialogue d'arrêt, avec « Continuer » qui annule la navigation. À défaut, inscrire D28 dans `brief.md` comme point « à valider » et le signaler au client.

**I4. Couverture e2e insuffisante pour le critère 320 px et les parcours à risque.**
- Preuve : `e2e/parcours.spec.ts` l.132-140 ne mesure que `#/equipe/nouvelle`. Aucun test pour Mes équipes, Présentation, Préparation ou Daily à 320 px, ni pour la migration v1, le dépassement, la suppression de membre au clavier, le tirage aléatoire, la touche Échap du dialogue.
- Conséquence : B1 et I1 ne sont pas détectés par la suite de tests, qui reste verte.
- Correction proposée : ajouter ces cas à la suite e2e (les sondes de cette revue en donnent le modèle).

### Mineur

**M1. Message d'erreur du prénom sans icône.** `src/app/pages/team-editor/team-editor.html` l.64-68 : le champ Prénom n'affiche pas l'icône d'alerte de 16 px requise par `design.md` 4.6 (le champ Nom d'équipe l'affiche, l.35-37). Le texte reste lu, donc la règle « la couleur seule ne porte pas l'information » est respectée. Correction : reprendre le bloc SVG du nom d'équipe.

**M2. Focus clavier d'un champ sans ombre de focus.** `src/styles.css` l.501-505 : `.field-input:focus-visible` retire `box-shadow`. `design.md` 4.6 demande le filet 2 px et `--shadow-focus`. Correction : retirer `box-shadow: none` ou reprendre `var(--shadow-focus)`.

**M3. « Arrêter la Daily » à droite sur ordinateur.** `src/app/pages/daily/daily.html` l.61-66 et `daily.css` l.76-84 (`space-between`). `design.md` 5.5 : « Arrêter la Daily en bas à gauche, secondaire ». Capture `05-daily-desktop.png` : à droite. Correction : ordre DOM ou `justify-content: flex-start` pour la barre de la Daily sur ordinateur.

**M4. Bouton « Ajouter » sur mobile.** `src/app/pages/team-editor/team-editor.html` l.50-74 : il reste à droite du champ, alors que `design.md` 5.2 demande qu'il passe sous le champ, pleine largeur, en gardant le style texte. Capture `02-creation-mobile.png` : à droite. Correction : passer le conteneur en colonne sous 600 px.

**M5. Données illisibles sur la présentation.** `src/app/app.routes.ts` l.16-18 : une équipe absente du stockage (par exemple une entrée invalide écartée au chargement) renvoie à l'accueil, sans le bandeau « Recréez l'équipe » requis par `design.md` 5.3 (retour à l'écran b avec le bandeau). Le bandeau n'apparaît que sur « Mes équipes ». Cas non reproduit dans le navigateur, constaté dans le code. Correction : rediriger vers `/equipe/nouvelle` avec l'état `unreadable` quand `readError` est vrai.

**M6. `decisions.md` non mis à jour.** D1 à D8 restent présentées comme les décisions en vigueur, alors que le cahier v2 les déclare caduques. Correction : marquer D1 à D8 « caduque (brief v2) », sans les supprimer.

**M7. Sources de référence non commitées.** `git status` : `docs/brief.md`, `docs/design.md` et `public/icon.svg` sont modifiés et non commités. La version 2 des documents qui font foi n'existe donc pas dans l'historique. Avertissements CRLF à l'échange. Correction : commiter les documents v2 (sans rien pousser sans instruction).

## Synthèse

- Vérifications : tests unitaires 100/100, build production OK, e2e 8/8. Ces succès ne couvrent pas le critère 320 px sur quatre écrans, la suppression au clavier ni le dialogue sur petit écran.
- Verdict : **CHANGEMENTS DEMANDÉS**. Un bloquant (B1), quatre constats importants (I1 à I4), sept mineurs (M1 à M7).
