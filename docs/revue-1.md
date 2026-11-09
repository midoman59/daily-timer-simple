CHANGEMENTS DEMANDÉS

# Revue indépendante n° 1 : Daily Timer Simple

- Dépôt relu : C:\Projects\daily-timer-simple (branche main)
- Sources de vérité : docs\brief.md, docs\design.md, docs\decisions.md
- Périmètre : code de src\, tests unitaires, e2e, package.json, workflows CI
- Aucun fichier de src\ modifié, aucun push, aucun déploiement

## Synthèse

- Bloquant : 2
- Important : 5
- Mineur : 8

Les vérifications automatiques passent : tests unitaires 67/67, e2e 3/3. Le fonctionnel de base (création, présentation, Daily, persistance nominale, 320 px) est en place. Deux défauts bloquent la validation : le focus est perdu au 15e membre, et une équipe dont l'enregistrement a échoué est affichée comme si elle était enregistrée.

## Vérifications exécutées

| Vérification | Résultat | Preuve |
|---|---|---|
| `npx ng test --watch=false --browsers=ChromeHeadlessCI` | 67 SUCCESS, code 0 | C:\Users\HP 840 G6\AppData\Local\Temp\claude\C--Projects-Timer\a0157a9c-cab5-4555-9735-af9e66110600\scratchpad\ngtest.log |
| Build de production avec `--base-href "/daily-timer-simple/"` | OK | dist\daily-timer-simple\browser (ignoré par git) |
| `npm run e2e` | 3 passed | Sortie Playwright, test-results\ et playwright-report\ (ignorés par git) |
| Vérification navigateur des constats B1, B2, I1, I2, I3 | Confirmés | Scripts dans C:\Users\HP 840 G6\AppData\Local\Temp\claude\C--Projects-Timer\a0157a9c-cab5-4555-9735-af9e66110600\scratchpad\verif\ (focus.js, focus2.js, back.js, storage.js) |

Note d'environnement : sous Git Bash, `--base-href "/daily-timer-simple/"` est converti en `C:/Program Files/Git/...`. Le build est alors faux et les 3 tests e2e échouent. Il faut lancer le build avec `MSYS_NO_PATHCONV=1`. Ce n'est pas un défaut du dépôt : la CI tourne sous Ubuntu.

---

## Constats

### Bloquants

**B1. Focus perdu dans le vide au 15e membre**
- Fichiers : `src\app\pages\team-editor\team-editor.ts` lignes 182-195 (addMember) et 198-204 (syncMemberInput) ; `team-editor.html` ligne 81 (`[disabled]="isFull()"` sur « Ajouter »).
- Scénario : l'utilisateur saisit le 15e prénom puis appuie sur Entrée, ou clique sur « Ajouter » au clavier. Le code appelle `syncMemberInput()`, qui désactive le champ, puis `memberField().focus()`. Un champ désactivé ne peut pas recevoir le focus, et le bouton « Ajouter » devient désactivé pendant qu'il a le focus. Résultat vérifié dans le navigateur : `document.activeElement` vaut BODY, le champ est désactivé. Le design (docs\design.md ligne 242) exige « Le focus ne se perd jamais dans le vide ».
- Correction : après la mise à jour, donner le focus au dernier bouton « Supprimer » (ou au titre de la liste) une fois le rendu effectué, par exemple `afterNextRender(() => this.deleteButtons().at(-1)?.nativeElement.focus())`. Ajouter un test qui vérifie `document.activeElement` après le 15e ajout. Le test actuel `team-editor.spec.ts` lignes 137-145 ne vérifie que le compteur et l'état désactivé.

**B3. Équipe non enregistrée affichée comme enregistrée**
- Fichiers : `src\app\services\team.store.ts` lignes 65-74 (`save`) ; `team-editor.ts` lignes 175-178.
- Scénario : l'écriture dans localStorage échoue (quota, stockage bloqué). `TeamStore.save` met l'équipe en mémoire (ligne 66) avant d'écrire, puis renvoie false. L'éditeur affiche le bandeau et reste ouvert, comme prévu par la décision D17. Mais l'utilisateur peut ensuite aller sur `#/presentation` : le garde `hasTeam` lit la mémoire et affiche l'équipe « Fantome », avec le bouton « Démarrer une Daily ». Après rechargement, l'équipe a disparu et l'app renvoie vers `#/equipe`. Vérifié dans le navigateur.
- Le test `team.store.spec.ts` lignes 48-53 (« garde l'équipe en mémoire ») fige ce comportement, donc il ne le détecte pas.
- Correction : n'affecter `this.team` qu'après une écriture réussie (écrire d'abord, puis `team.set`). Si l'écriture échoue, ne pas modifier la mémoire. Corriger le test pour qu'il vérifie que `team()` reste à la valeur précédente.

### Importants

**I1. Focus du dialogue d'arrêt contournable**
- Fichiers : `src\app\pages\daily\daily.ts` lignes 57-60 et 73-94 ; `daily.html` lignes 38 et 43-53.
- Scénario : le dialogue est ouvert, l'utilisateur clique sur le voile, puis appuie sur Tab. Le focus va sur « Arrêter la Daily », le bouton situé derrière le dialogue (vérifié : `BUTTON Arrêter la Daily`). Le gestionnaire Tab est attaché à l'élément `[role=alertdialog]` : il n'intercepte pas un événement dont la cible est `body`. Rien n'est rendu inerte, et `role="alertdialog"` n'empêche pas les lecteurs d'écran d'atteindre le fond.
- Le design (docs\design.md lignes 278-279 et 401) exige un focus piégé dans le dialogue.
- Correction : utiliser un élément `<dialog>` natif avec `showModal()` (piège et Échap natifs), ou mettre `inert` sur le contenu principal pendant la confirmation. Ajouter un test du piège qui envoie un clic sur le voile puis Tab.

**I2. La Daily continue après un retour arrière du navigateur**
- Fichiers : `src\app\services\daily-timer.service.ts` lignes 51-57 (start), 64-67 (stop) ; `src\app\pages\daily\daily.ts` (aucun ngOnDestroy) ; `src\app\app.routes.ts` lignes 22-25.
- Scénario : l'utilisateur démarre la Daily, puis revient en arrière avec le navigateur. Il arrive sur la présentation sans indication qu'une Daily tourne, mais le `setInterval` et la session restent actifs. Vérifié : après environ 7 s hors écran, revenir sur `#/daily` affiche 14:53. Le chronomètre n'a pas été arrêté par l'utilisateur et n'a pas eu de confirmation (décisions D13 et D14).
- Correction : arrêter la session quand le composant Daily est détruit sans passer par « Arrêter » (`ngOnDestroy` dans `Daily` qui appelle `timer.stop()`, ou une garde `canDeactivate`). Ajouter un test unitaire.

**I3. Focus non déplacé sur le titre après un changement d'écran**
- Fichiers : `src\app\pages\presentation\presentation.ts` (aucun focus), `team-editor.ts` ligne 179 (navigate sans focus), seul `daily.ts` déplace le focus.
- Scénario : après « Enregistrer l'équipe », le bouton est retiré du DOM et le focus va sur BODY (vérifié). Le lecteur d'écran n'annonce pas le titre « Équipe ». Le design (docs\design.md ligne 379) exige que le focus aille sur le `<h1>` du nouvel écran.
- Correction : sur la présentation et l'éditeur, `afterNextRender(() => this.title().nativeElement.focus())`, comme le fait déjà `daily.ts` ligne 42. Le `<h1>` a déjà `tabindex="-1"`.

**I4. Test S7 « aucun appel réseau » sans valeur**
- Fichier : `src\app\services\team.store.spec.ts` lignes 15-20.
- Le test espionne `window.fetch`, que l'application n'utilise jamais. Il réussirait même si un `XMLHttpRequest` ou un `navigator.sendBeacon` était ajouté. Le critère du client « aucune donnée envoyée à l'extérieur » n'est donc pas couvert par un test. Aucun `fetch`, `XMLHttpRequest`, `sendBeacon` ni URL externe n'existe dans src\ (vérifié par grep).
- Lacunes de couverture à compléter : focus au 15e membre (B1), piège du dialogue (I1), échec d'écriture et mémoire (B3), Daily après retour arrière (I2), et focus sur le titre après changement d'écran (I3).
- Correction : espionner `XMLHttpRequest.prototype.open`, `navigator.sendBeacon` et `fetch`, ou ajouter un contrôle de build qui échoue si ces API apparaissent dans src\.

**I5. Déploiement sans barrière de tests**
- Fichier : `.github\workflows\deploy-pages.yml` lignes 1-12 et le job `build`.
- Le déploiement se déclenche sur chaque push sur main, sans dépendre de `ci.yml` (pas de `needs` ni de `workflow_run` vers les tests). Une régression sur main est donc publiée sur GitHub Pages même si les tests échouent.
- Correction : exécuter les tests unitaires et e2e dans le workflow de déploiement avant le build, ou déclencher le déploiement via `workflow_run` sur le succès de `CI`.

### Mineurs

**M1. Prénoms en Unicode décomposé refusés**
- `src\app\domain\team-validation.ts` ligne 55 : la regex `[\p{L}\s'’-]` n'accepte pas les marques diacritiques `\p{M}`. Vérifié : « Le\u0301a » (Léa en NFD) est refusé avec le message de caractères invalides. Un prénom collé depuis certaines sources est donc rejeté sans raison visible.
- Correction : normaliser en NFC avant validation (`value.normalize('NFC')`) dans `normalizeSpaces` ou dans `validateMemberName`.

**M2. Classe `.hint` sans style**
- `src\app\pages\presentation\presentation.html` ligne 29 utilise `class="hint"`, mais aucune règle `.hint` n'existe dans src\. Le message « Ajoutez au moins 2 membres pour démarrer. » s'affiche en texte par défaut, sans le style secondaire du design.
- Correction : ajouter `.hint` dans `presentation.css` (texte `--color-text-secondary`, 15 px, comme `.help`).

**M3. État vide absent**
- Le design (docs\design.md section 3.7) prévoit « Aucun membre pour l'instant. » quand la liste est vide. Le code n'affiche que le message d'aide. L'écart n'est pas consigné dans decisions.md.
- Correction : ajouter le texte, ou consigner l'écart dans decisions.md.

**M4. Champ désactivé sans style visible**
- `src\app\pages\team-editor\team-editor.css` : aucune règle `:disabled` sur `.field-input`. Au 15e membre, le champ « Prénom » ressemble à un champ actif. Le design (docs\design.md ligne 214 et section 1.3) demande un fond `--color-surface-muted`, un texte `--color-text-disabled` et un curseur `not-allowed`.
- Correction : ajouter `.field-input:disabled { background: var(--color-surface-muted); color: var(--color-text-disabled); cursor: not-allowed; }`.

**M5. Animation d'ajout de membre non réduite**
- `team-editor.css` lignes 234 et 237-245 : `row-in` dure 180 ms et `styles.css` (lignes 90-102) ne l'excepte pas en mouvement réduit. Le design (docs\design.md section 4.6, ligne 407) limite les fondus à 120 ms en mouvement réduit.
- Correction : ajouter `.member-row { animation: none; }` (ou 120 ms) dans le bloc `prefers-reduced-motion` de `styles.css`.

**M6. E2E dépendant d'un build préexistant**
- `npm run e2e` ne construit pas l'application. Il sert le dossier `dist\` existant, avec un préfixe `/daily-timer-simple` figé dans `e2e\serve-dist.mjs` ligne 6. Un `dist\` obsolète ou construit sans le bon base href fait échouer les tests sans raison apparente (c'est ce qui m'est arrivé).
- Correction : ajouter un script `"e2e": "ng build --configuration production --base-href \"/daily-timer-simple/\" && playwright test"`, ou documenter l'étape dans le README (il l'est déjà, mais pas dans le script).

**M7. Transition de sortie entre écrans absente**
- Le design (docs\design.md section 4.4, ligne 377) prévoit une sortie en fondu de 150 ms avant l'entrée du nouvel écran. Le code n'a que l'entrée (`app.css` / `styles.css` lignes 60-74).
- Correction : mineure, à consigner dans decisions.md si l'écart est accepté.

**M8. Échap annule les modifications sans confirmation**
- `team-editor.ts` lignes 55-59 et `team-editor.html` ligne 1 : en modification, Échap revient à la présentation et perd les changements non enregistrés. C'est le choix D25 et le design 4.5, donc ce n'est pas un écart. Le client doit le confirmer, car une frappe accidentelle fait perdre des modifications.

---

## Cahier des charges

| # | Exigence | Statut | Preuve |
|---|---|---|---|
| 1 | Le chronomètre n'est jamais l'écran d'entrée et ne démarre qu'après « Démarrer une Daily » | Conforme (réserve I2) | `app.routes.ts` lignes 9-10 (accueil) et 22-25 (garde) ; `presentation.ts` ligne 23 (seul `start`) ; test « ne démarre jamais tout seul » (`daily-timer.service.spec.ts`) ; e2e « rechargement ». Réserve : un retour arrière laisse la Daily tourner (I2). |
| 2 | Récupère automatiquement les membres et la durée configurés | Conforme | `daily.html` lignes 19-29 ; `daily.spec.ts` lignes 42-48 (« sur 15 min », membres) ; e2e « sur 15 min ». |
| 3a | Création : nom d'équipe et durée en minutes (défaut 15) | Conforme | `team-editor.html` lignes 18-47 ; `team-editor.spec.ts` lignes 17-35 ; `team-validation.ts` lignes 14-39. |
| 3b | Ajout de membres par prénom (Entrée ou bouton, champ vidé, focus conservé) | Conforme | `team-editor.spec.ts` lignes 66-90 ; e2e « création ». |
| 3c | Liste, suppression avant enregistrement, focus après suppression | Conforme | `team-editor.spec.ts` lignes 148-209 (describe S4 : libellés des boutons, retrait, réajout, focus) ; `team-editor.ts` lignes 210-215. |
| 3d | Compteur dynamique (« N membres », annoncé) | Conforme | `team-editor.html` ligne 60 (role=status, aria-live=polite) ; `team-editor.spec.ts` lignes 124-135. |
| 3e | Compteur au 15e membre : champ désactivé avec message | Conforme pour le message, non conforme pour le focus (B1) | `team-editor.spec.ts` lignes 137-145 ; focus perdu, voir B1. |
| 3f | Validation des champs obligatoires, focus sur le premier champ fautif | Conforme | `team-editor.spec.ts` lignes 245-285 ; `team-editor.ts` lignes 156-168. |
| 4 | Présentation après enregistrement : nom, durée, membres, liste, « Démarrer une Daily », « Modifier » | Conforme | `presentation.html` lignes 2-31 ; `presentation.spec.ts` lignes 130-149 ; e2e. |
| 5 | Équipe et membres retrouvés après rechargement | Conforme (cas nominal) ; non conforme si l'écriture échoue | `team.store.spec.ts` ligne 10-13 ; e2e « rechargement » ; échec d'écriture : B3 (vérifié). |
| 6a | Accessibilité : libellés | Conforme | `label for=` sur tous les champs (`team-editor.html` lignes 18, 35, 65) ; `aria-describedby` sur les erreurs. |
| 6b | Accessibilité : focus | Non conforme | B1 (focus perdu au 15e membre), I1 (focus du dialogue), I3 (focus absent sur le titre). |
| 6c | Accessibilité : contrastes | Conforme | Calcul WCAG : bouton principal 6.02:1 ; texte secondaire 6.10 à 6.64:1 ; erreur 6.54:1 ; bordure de champ 3.44:1 ; désactivé 4.15:1 (exempté). |
| 6d | Accessibilité : 320 px | Conforme pour l'éditeur | e2e « 320 px » (dépassement horizontal 0) ; `styles.css` lignes 77-87 (actions empilées). Non vérifié pour l'écran Daily à 320 px. |
| 7a | Aucune donnée envoyée à l'extérieur | Conforme dans le code (grep : aucun fetch, XHR, sendBeacon, HttpClient, URL externe) | Test unitaire insuffisant (I4). |
| 7b | Aucune dépendance de runtime inutile | Conforme | `package.json` : dépendances Angular, rxjs, tslib, zone.js (requises par Angular). Aucune librairie tierce d'interface. |
| 8 | Tests : chaque story a un test qui échouerait si elle était cassée | Partiel | S1 à S4, S6, S8, S9 couverts. S5 (doublon côté interface) couvert seulement en domaine. S7 test réseau vacuous (I4). S10 : pas de test de focus visible ni de mouvement réduit. |
| 9 | Vérifications : tests unitaires et e2e | Conforme | 67/67 unitaires, 3/3 e2e (après build correct). |

---

## Verdict

CHANGEMENTS DEMANDÉS : 2 bloquants (B1, B3), 5 importants (I1 à I5), 8 mineurs (M1 à M8). Les bloquants et les importants doivent être corrigés et couverts par un test qui échoue avant la correction. Les mineurs peuvent être traités ou consignés dans decisions.md.
