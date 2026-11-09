APPROUVÉ

# Revue indépendante n° 3 : Daily Timer Simple

- Dépôt relu : C:\Projects\daily-timer-simple (branche main, HEAD 8830b29)
- Périmètre : diff `ab51be3..HEAD` (commits de c6a70ba à 8830b29), constats B1, B3, I1 à I5, I-N1, M-N1, M-N2 de revue-1 et revue-2
- Sources de vérité : docs\brief.md, docs\design.md, docs\decisions.md
- Aucun fichier de src\ modifié, aucun push, aucun déploiement. Les contrôles « sans correctif » ont été faits dans une copie jetable du scratchpad.

## Synthèse

- Bloquant : 0
- Important : 0
- Mineur : 2

Les constats demandés sont corrigés. Chaque correction est couverte par un test qui échoue sur le code d'avant correction (ab51be3). Les vérifications passent : 79/79 unitaires, build de production OK, 7/7 e2e. Le point restant (M-N2) est mineur : le test e2e de la variante Tab ne détecte pas la régression, et son commentaire décrit un mécanisme inexact. Les constats M1 à M8 de revue-1 restent ouverts et acceptés, comme demandé.

## Vérifications exécutées

| Vérification | Résultat | Preuve |
|---|---|---|
| `npx ng test --watch=false --browsers=ChromeHeadlessCI` | 79/79 SUCCESS, code 0 | C:\Users\HP840G~1\AppData\Local\Temp\claude\C--Projects-Timer\a0157a9c-cab5-4555-9735-af9e66110600\scratchpad\ut3.log |
| `MSYS_NO_PATHCONV=1 npx ng build --configuration production --base-href "/daily-timer-simple/"` | OK, code 0 | scratchpad\build3.log |
| `npm run e2e` (après le build ci-dessus) | 7 passed, code 0 | scratchpad\e2e3.log |
| Contrôle des tests sur le code d'avant correction : src\ de `ab51be3` avec les specs et e2e de HEAD | 12 échecs unitaires, 67 réussites ; 3 échecs e2e (création, retour arrière, Maj+Tab) | scratchpad\old-ut.log, scratchpad\old-e2e.log, dossier scratchpad\old |
| Mutation du garde réseau : ajout d'un `XMLHttpRequest.open` et d'un `navigator.sendBeacon` dans `TeamStore.save` | Le test S7 « n'envoie aucune donnée hors de l'appareil » échoue (13 échecs) | scratchpad\mut-ut.log |

Le fichier de l'ancien code a été restauré dans la copie après la mutation. Rien n'a été modifié dans le dépôt.

Limite : les workflows GitHub Actions n'ont pas pu être exécutés. Le YAML de `ci.yml` et `deploy-pages.yml` a été relu à la main (structure valide, `workflow_call` présent, `build` dépend de `test`), sans analyseur YAML disponible.

## Vérification des constats

| Constat | Statut | Preuve |
|---|---|---|
| **B1** Focus perdu au 15e membre | **Corrigé** | `focusAfterAdd()` place le focus sur le dernier bouton « Supprimer » après le rendu (team-editor.ts). Les 2 tests « garde le focus dans la liste après le 15e membre... » (team-editor.spec.ts, describe S3) échouent sur l'ancien code. |
| **B3** Équipe non enregistrée affichée comme enregistrée | **Corrigé** | `TeamStore.save` écrit avant de modifier `team` (team.store.ts). Échouent sur l'ancien code : « n'affiche pas une équipe non écrite... », « garde l'équipe précédente... », et « reste sur l'écran et affiche une erreur... » (team-editor.save.spec.ts). |
| **I1** Focus du dialogue d'arrêt contournable | **Corrigé** | `main` porte `[attr.inert]` pendant la confirmation, et `document:keydown` ramène Tab et Maj+Tab dans le dialogue (daily.ts, daily.html). Échouent sur l'ancien code : « rend le fond inerte... », « ramène le focus dans le dialogue... », et l'e2e Maj+Tab. La variante Tab de l'e2e ne discrimine pas (voir M-N2). |
| **I2** La Daily continue après retour arrière | **Corrigé** | `ngOnDestroy` appelle `timer.stop()` (daily.ts). Échoue sur l'ancien code : « arrête la Daily quand l'écran est quitté... » ; e2e « retour arrière pendant la Daily » échoue aussi. |
| **I3** Focus non déplacé sur le titre après changement d'écran | **Corrigé** | Présentation : `afterNextRender` sur le titre (presentation.ts). Échoue sur l'ancien code : « place le focus sur le titre de l'écran à son arrivée » et l'e2e création (`toBeFocused`). L'éditeur est traité par I-N1. |
| **I4** Test S7 « aucun appel réseau » sans valeur | **Corrigé** | Le test espionne désormais `fetch`, `XMLHttpRequest.prototype.open` et `navigator.sendBeacon`. La mutation ci-dessus le fait échouer. Il ne peut pas échouer sur l'ancien code, qui n'a pas de réseau : c'est un test de garde. |
| **I5** Déploiement sans barrière de tests | **Corrigé (relu, non exécuté)** | deploy-pages.yml : job `test` qui appelle `./.github/workflows/ci.yml` (`workflow_call` présent), et job `build` avec `needs: test`, `deploy` avec `needs: build`. Les permissions héritées du workflow appelant ne sont pas élevées. |
| **I-N1** Focus perdu à l'arrivée sur l'éditeur | **Corrigé** | `afterNextRender` sur le `<h1 #title>` dans le constructeur de `TeamEditor`. Échouent sur l'ancien code : « place le focus sur le titre à l'ouverture (création) » et « ... (modification) ». |
| **M-N1** Échap sans effet quand le focus est sur BODY | **Corrigé** | `onDocumentKeydown` traite Échap (daily.ts). Échoue sur l'ancien code : « Échap ferme la confirmation même quand le focus est sur BODY ». |
| **M-N2** Test e2e « Tab » ne prouve pas le défaut I1 | **Partiellement corrigé** | La variante Maj+Tab discrimine (échoue sur l'ancien build). La variante Tab passe encore sur l'ancien build : le `blur()` ne change pas le point de départ de la tabulation, que Chrome garde au point du clic sur le voile. Le commentaire de parcours.spec.ts ligne 83 est donc inexact (voir N-1). Le piège de Tab est couvert par le test unitaire, comme convenu. |

## Nouveaux constats

### Bloquants

Aucun.

### Importants

Aucun.

### Mineurs

**N-1. Test e2e Tab sans effet discriminant et commentaire inexact (suite de M-N2)**
- Fichier : `e2e\parcours.spec.ts` lignes 83-84.
- Scénario : une régression de I1 sur la seule touche Tab passe la suite e2e. Le test a été exécuté sur le build d'avant correction et a réussi.
- Le commentaire « Le focus est forcé sur BODY : le point de départ de la tabulation est alors hors du dialogue » est faux pour Chrome : le point de départ reste le clic sur le voile.
- Correction : soit retirer la variante `Tab` de la boucle (le piège de Tab est déjà couvert par `daily.spec.ts`, « ramène le focus dans le dialogue... »), soit remplacer le commentaire par une indication exacte et noter la limite. Dans les deux cas, corriger le commentaire.

**N-2. Tests lancés deux fois sur `main` à chaque push**
- Fichiers : `.github\workflows\ci.yml` (déclencheur `push` sur main) et `.github\workflows\deploy-pages.yml` (job `test` qui appelle `ci.yml`).
- Scénario : un push sur main exécute la suite complète dans deux workflows. Ce n'est pas un défaut fonctionnel, mais le temps de CI est doublé.
- Correction facultative : limiter le déclencheur `push` de `ci.yml` aux `pull_request`, ou laisser tel quel et le noter.

## Cahier des charges

| # | Exigence | Statut | Preuve |
|---|---|---|---|
| 1 | Chronomètre jamais à l'écran d'entrée, démarre seulement après « Démarrer une Daily » | Conforme | app.routes.ts (`dailyRunning`, `home`) ; `presentation.ts` (seul `start`) ; e2e « rechargement » et « retour arrière ». |
| 2 | Membres et durée récupérés automatiquement | Conforme | `daily.html` ; e2e « sur 15 min ». |
| 3 | Création complète (nom, durée, membres, liste, suppression, compteur, validation) | Conforme | `team-editor.html`, `team-editor.ts`, tests unitaires (79/79). |
| 4 | Présentation après enregistrement, « Démarrer une Daily », « Modifier » | Conforme | `presentation.html` ; e2e « création ». |
| 5 | Persistance après rechargement | Conforme | e2e « rechargement » ; échec d'écriture traité par B3. |
| 6a | Accessibilité : libellés | Conforme | inchangé depuis revue-2. |
| 6b | Accessibilité : focus | Conforme pour les constats du périmètre | B1, I1, I2, I3, I-N1 corrigés et testés. |
| 6c | Accessibilité : contrastes | Conforme | inchangé depuis revue-1 (calcul WCAG). |
| 6d | Accessibilité : 320 px | Conforme pour l'éditeur | e2e « 320 px ». Écran Daily à 320 px non mesuré, comme dans revue-1. |
| 7 | Aucune donnée sortante | Conforme | grep : aucun fetch, XHR, sendBeacon ni URL externe dans src\ ; e2e « aucune requête vers un autre hôte » (passe, et la garde de test est réelle). |
| 8 | Chaque story a un test qui échouerait si elle était cassée | Conforme pour le périmètre des constats | Les nouveaux tests échouent sur l'ancien code (voir tableau ci-dessus), sauf I4 (test de garde, vérifié par mutation) et M-N2 (partiel, voir N-1). |
| 9 | Vérifications : unitaires et e2e | Conforme | 79/79, build OK, 7/7 e2e. |

## Verdict

APPROUVÉ.

- Bloquant : 0
- Important : 0
- Mineur : 2 (N-1, N-2)

Les constats B1, B3, I1 à I5, I-N1, M-N1 sont corrigés et couverts par des tests qui échouent sur l'ancien code (I5 relu seulement, non exécutable en local). M-N2 est partiellement corrigé : N-1 est à traiter ou à noter. Les constats M1 à M8 de revue-1 restent ouverts et acceptés.
