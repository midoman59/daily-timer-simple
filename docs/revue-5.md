APPROUVÉ

# Revue 5 : Daily Timer Simple, cahier des charges v2 (dernière revue de la version 2)

- Revue : indépendante. Aucun fichier de `src/` modifié, rien poussé, rien déployé. Aucune modification du dépôt hors de `docs/revue-5.md`.
- Commit revu : `fa7796c` (branche `main`), après les corrections `e09c34a`, `d6a4936`, `d1e62c8`, `4b45177`, `fa7796c`.
- Sources de vérité : `docs/brief.md` (version 2, working tree), `docs/design.md` (version 2, working tree), `docs/decisions.md` (D1 à D8 ignorées, caduques).
- Point d'attention hors code : `docs/brief.md`, `docs/design.md` et `public/icon.svg` restent non commités (constat M7 de la revue 4, toujours ouvert). Le point I3 n'existe donc dans l'historique que sous forme de texte non commité.

## Vérifications exécutées

| Commande | Résultat |
|---|---|
| `npx ng test --watch=false --browsers=ChromeHeadlessCI` | PASS, 103 tests sur 103 (100 à la revue 4) |
| `MSYS_NO_PATHCONV=1 npx ng build --configuration production --base-href "/daily-timer-simple/"` | PASS, aucune erreur |
| `npm run e2e` | PASS, 15 tests sur 15 (8 à la revue 4, 7 ajoutés) |

Sondes complémentaires (scripts dans `C:\Users\HP840G~1\AppData\Local\Temp\claude\7d12b719b5402191\a0157a9c-cab5-4555-9735-af9e66110600\scratchpad\`, hors dépôt, sur le build de production servi par `e2e/serve-dist.mjs`) :

- Largeur à 320 px, mesurée à l'arrivée sur l'écran (pendant le glissement), avec `Marie-Christine / Jean-Baptiste / Hortense-Lou` :

| Écran | Correction actuelle | Sans `overflow-x: clip` | Sans glissement d'entrée (transform supprimé), sans correction |
|---|---|---|---|
| Présentation | 320 | 320 | 320 |
| Préparation | 320 | **340** | 320 |
| Daily | 320 | **344** | 320 |

- Avec les prénoms courts de la revue 4 (`Léa / Tom / Ana`) : Préparation 340 et Daily 340 sans correction, 320 avec correction.

## Corrections vérifiées

| Constat | Statut | Preuve |
|---|---|---|
| **B1** défilement horizontal à 320 px | **Corrigé.** Cause réelle différente du diagnostic de la revue 4 (voir ci-dessous). | `src/app/app.css` l.3-4 : `overflow-x: clip` sur `.app-shell`. Sans cette ligne, la préparation mesure 340 px et la Daily 344 px à l'arrivée ; avec, 320 px. Sans glissement d'entrée, aucun débordement, même sans correction : la cause est le `@starting-style` de `src/styles.css` l.124-131 (`translateX(24px)` sur `.screen`). Le diagnostic de la revue 4 (`flex: none` sur `.row-title` et `.select`, `preparation.css` l.10-12 et l.18-21) ne tient pas : à l'arrêt, les lignes tiennent dans 320 px, même avec des prénoms de 15 caractères. La correction du développeur vise la bonne cause. Test e2e `parcours.spec.ts` l.147 (préparation et Daily) : PASS avec correction, et **échoue sans** (`Received: 6`). Test l.181 (320 px sur chaque écran, à l'arrivée et stabilisé) : **échoue sans** (`création : à l'arrivée`, `Received: 6`). |
| **I1** focus après suppression | **Corrigé.** | `team-editor.html` l.78 : `track member`. Sans cette correction (`track $index`, mutation sur copie hors dépôt), le test unitaire « après la suppression d'un membre du milieu » **échoue** (1 FAILED) et le test e2e « suppression au clavier » **échoue** (`Supprimer Ana` non focalisé). Avec correction : PASS. Le cas du dernier membre a aussi un test unitaire (passe dans les deux cas, il ne reproduisait pas le défaut). Voir constat R5-m4 sur les doublons. |
| **I2** ordre des boutons du dialogue | **Corrigé**, dans la contrainte demandée (ordre du tab inchangé). | `src/styles.css` l.715-733 : `row-reverse` en ligne, `column` sous 340 px. Ordre DOM inchangé (« Continuer » en premier), piège de focus `daily.ts` inchangé. Test e2e l.161 : à 1280 px, « Arrêter » à gauche de « Continuer » ; à 320 px, « Continuer » au-dessus. PASS. Constat R5-m2 sur le décalage visuel et tab. |
| **I3** retour arrière sans confirmation | **Consigné, non corrigé (accepté comme demandé).** | `docs/brief.md` l.318 : question 9 de la section 6, avec les deux options (a) et (b) ; `docs/decisions.md` D28 : « Choix du développeur, en attente de décision client ». Le comportement reste l'arrêt immédiat, couvert par le test e2e l.80 « retour arrière pendant la Daily ». Le document n'est pas commité (voir M7). |
| **I4** tests manquants | **Corrigé, vérifié.** | 7 tests e2e ajoutés et 1 test unitaire (tirage aléatoire). Mutation sur copie : les tests 320 px (préparation et Daily, chaque écran) et la suppression au clavier échouent sans leurs corrections (tableau ci-dessous). Les tests de migration v1, de dépassement, d'Échap et du dialogue à 320 px passent. |

Mutation sur copie hors dépôt (`git archive fa7796c`, `overflow-x: clip` retiré, `track $index` rétabli) :

| Test | Sans correction | Avec correction |
|---|---|---|
| e2e 320 px préparation et Daily (l.147) | échec (`Received: 6`) | PASS |
| e2e 320 px chaque écran (l.181) | échec (`création : à l'arrivée`) | PASS |
| e2e suppression au clavier (l.258) | échec (focus non posé) | PASS |
| unitaire suppression du membre du milieu (I1) | échec | PASS |
| e2e dialogue d'arrêt 320 px (I2, l.161) | non concerné (mutation non appliquée) | PASS |

## Non-régressions du cahier des charges v2

| # | Exigence | Statut | Preuve |
|---|---|---|---|
| 1 | Création sans durée | OK | e2e l.24 (« Durée de la Daily » absent) |
| 2 | Accueil : Mes équipes si une équipe existe, création sinon | OK | e2e l.67 ; `app.routes.ts` l.14 |
| 3 | Présentation : nom, nombre de membres, liste, « Démarrer une Daily », « Modifier l'équipe » | OK | e2e parcours complet ; 320 px l.181 |
| 4 | Préparation : 1 à 5 min, défaut 2 min, par membre | OK | `preparation.ts` l.22 (`DEFAULT_MINUTES = '2'`), `validateMinutes` (`daily-run.ts` l.30-35) ; e2e « Temps prévu : 2:00 » |
| 5 | Ordre de l'équipe ou aléatoire, tiré une fois au démarrage | OK | `createDailyRun` (`daily-run.ts` l.48-61), appelé une fois dans `daily-timer.service.ts` l.92 ; test unitaire de permutation (I4) |
| 6 | Rien n'est enregistré dans l'équipe par la Daily | OK | `.save(` n'est appelé que dans `team-editor.ts` l.168 |
| 7 | « Commencer la Daily » lance le chronomètre, jamais avant | OK | `daily-timer.service.ts` `start()` (l.88-95) ; e2e « timer » visible après le clic |
| 8 | « Passer au suivant » repart du temps alloué au suivant | OK | `nextMember` ; e2e ; test unitaire |
| 9 | Passer un membre, y compris celui qui parle | OK | `passMember` (`daily-run.ts` l.108-118) ; tests unitaires l.86 et l.91 ; e2e « Passer Tom » |
| 10 | Dépassement en rouge, « Temps dépassé », « +mm:ss » | OK | e2e « dépassement » (couleur `rgb(179, 38, 30)`, `+00:0[23]`) |
| 11 | Arrêt avec confirmation | OK, sauf retour arrière | e2e dialogue d'arrêt ; retour arrière = I3 consigné |
| 12 | Un membre passé ne revient pas | OK | `passMember` ne réinitialise jamais `passed` ; `advanceFrom` ne reprend que `waiting` |
| 13 | Équipes retrouvées au rechargement | OK | e2e l.57 et l.67 |
| 14 | Rechargement pendant une Daily : pas de relance du chronomètre | OK | garde `dailyRunning` (`app.routes.ts` l.24-27) ; e2e l.57 |
| 15 | Migration de la version 1 | OK | e2e « migration v1 » (clé v1 retirée, équipe affichée) ; `team.store.ts` `loadLegacy` |
| 16 | Accessibilité : focus | OK | I1 corrigé ; anneau de focus présent |
| 17 | Dialogue d'arrêt piégé | OK | e2e l.93-110 et Échap l.275 |
| 18 | Contrastes | OK | valeurs de `design.md` 2.2 (contrôle de la revue 4 non repris, aucun token modifié depuis) |
| 19 | Réduction des mouvements | OK (lecture du code) | non revérifié dans le navigateur |
| 20 | 320 px sans défilement horizontal | OK | sondes ci-dessus ; e2e l.147 et l.181 |
| 21 | Aucune donnée sortante | OK | e2e « aucune requête vers un autre hôte » |
| 22 | Tests unitaires, build, e2e | OK | voir « Vérifications exécutées » |

## Constats

### Bloquant

Aucun.

### Important

Aucun.

### Mineur

Constats nouveaux de cette revue :

**R5-m1. `overflow-x: clip` non reconnu par les anciens navigateurs.**
- Fichier : `src/app/app.css` l.3-4.
- Scénario d'échec : sur un Safari antérieur à la version 16 (ou un WebView qui ne connaît pas `clip`), la déclaration est ignorée, le défilement horizontal de la Daily et de la préparation revient à 320 px.
- Correction proposée : ajouter `overflow-x: hidden;` juste avant `overflow-x: clip;`. Les navigateurs qui ne connaissent pas `clip` gardent `hidden`.

**R5-m2. Ordre visuel et ordre du tab divergent sur ordinateur (I2).**
- Fichier : `src/styles.css` l.715-733 (`row-reverse`), `src/app/pages/daily/daily.html` l.84-87.
- Scénario d'échec : à partir de 340 px, « Arrêter » est à gauche et « Continuer » à droite, mais le tab atteint « Continuer » en premier. Un utilisateur clavier suit un ordre qui ne correspond pas à la lecture visuelle (WCAG 2.4.3, séquence de focus).
- Correction proposée : aucune obligatoire, la contrainte du brief est respectée. Si le client accepte l'écart, le noter dans `design.md` 4.13. Sinon, placer « Arrêter » en premier dans le DOM et adapter le piège de focus de `daily.ts` l.141-184 (premier et dernier élément). Décision à prendre, sans bloquer.

**R5-m3. `decisions.md` D27 décrit l'ancien comportement.**
- Fichier : `docs/decisions.md` ligne D27.
- Scénario d'échec : D27 dit « sous 600 px les boutons sont empilés (action sûre en haut) ». Le code empile sous 340 px avec « Continuer » en haut. La documentation contredit le code.
- Correction proposée : remplacer « sous 600 px » par « sous 340 px » et préciser « Continuer en haut ».

**R5-m4. Doublons de prénoms possibles dans une équipe stockée, avec `track member`.**
- Fichiers : `src/app/pages/team-editor/team-editor.html` l.78 ; `src/app/services/team.store.ts` (`parseStoredTeams`, aucune vérification de doublon).
- Scénario d'échec : un stockage édité à la main ou une ancienne version contenant deux « Léa » produit des clés `track` dupliquées (avertissement Angular en développement, rendu et focus imprévisibles).
- Correction proposée : dédoublonner (insensible à la casse, comme `validateMemberName`) dans `parseStoredTeams` et `loadLegacy`. Ne pas revenir à `track $index`, qui rétablit le défaut I1.

**R5-m5. Décalage visuel pendant le glissement d'entrée (B1).**
- Fichiers : `src/styles.css` l.124-131 (`@starting-style`, `translateX(±24px)`), durée 280 ms (`--duration-screen`).
- Scénario d'échec : pendant 280 ms, le bord droit de l'écran est coupé. La barre d'action, fixe mais contenue dans `.screen`, se décale aussi : « Commencer la Daily » ou « Passer au suivant » peut être coupé de quelques pixels pendant l'animation (sonde : bord droit à 336 px pour la préparation, pendant le glissement).
- Correction proposée : cosmétique, acceptable en l'état. Pour un rendu propre à 320 px, réduire le décalage à 0 sous 340 px, ou ne garder que le fondu.

Constats de la revue 4 toujours ouverts (mineurs, hors périmètre de cette passe) :

- **M2** : `src/styles.css` l.501-505, `.field-input:focus-visible { box-shadow: none; }` supprime l'ombre de focus (confirmé). Correction : reprendre `var(--shadow-focus)`.
- **M6** : `docs/decisions.md` D1 à D8 non marquées « caduques (brief v2) » (confirmé, ligne 7 inchangée).
- **M7** : `docs/brief.md`, `docs/design.md` et `public/icon.svg` non commités (confirmé par `git status`). Les documents v2 n'existent pas dans l'historique.
- **M1, M3, M4, M5** : non revérifiés dans cette passe. Les corrections demandées n'en dépendent pas.

## Synthèse

- Vérifications : tests unitaires 103/103, build production OK, e2e 15/15.
- Corrections demandées : B1, I1, I2, I4 corrigés et vérifiés ; I3 consigné comme demandé.
- Pour B1, la correction est valide, mais le diagnostic de la revue 4 était faux : la cause est le glissement d'entrée, pas la largeur des lignes de temps.
- Régressions du cahier v2 : aucune constatée.
- Constats : 0 bloquant, 0 important, 5 mineurs nouveaux (R5-m1 à R5-m5), 3 mineurs revue 4 confirmés ouverts (M2, M6, M7) et 4 non revérifiés (M1, M3, M4, M5).
- Verdict : **APPROUVÉ**.
