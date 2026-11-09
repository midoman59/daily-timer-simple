# Design : Daily Timer Simple

- Auteur : Sally, UX Designer (méthode BMAD)
- Date : 2026-11-09
- Version : 3 (remplace la version 2)
- Sources : `docs/brief.md` (version 3 : six écrans, quatre dialogues, trente stories), `docs/decisions.md` (D29 à D48), `docs/design.md` version 2, captures de la version 1 (`docs/captures/`, non modifiées).
- Statut : proposition à valider. Les points marqués **[à valider]** sont listés section 10.
- Périmètre : direction, tokens (clair et sombre), typographie, espacements, composants, écrans, dialogues, clavier et focus, mouvement, réduction des mouvements. Aucun code dans `src/`, aucun test modifié.

---

## 0. Changelog par rapport à la version 2

| # | Changement | Raison | Référence |
|---|---|---|---|
| 1 | **Mode sombre** ajouté : palette complète sous `prefers-color-scheme: dark`, aucun bouton de bascule. Tous les couples texte/fond mesurés en clair et en sombre (section 2.4). | Demande A. | D46, S25 |
| 2 | Token **`--space-cta-to-list`** (16 px) entre le bouton « Nouvelle équipe » et la liste, sur ordinateur et mobile. Sur (a), le bouton sort de la barre d'actions mobile et passe dans le flux, au-dessus de la liste. | Demande C. | D48, S20 |
| 3 | Écran **(f) Bilan** décrit : mise en page desktop et mobile, liste par membre, deux états (sans dépassement, avec dépassements). « Copier le bilan » en bouton texte, « Retour à l'équipe » en action principale. | Décisions 6 et S29-S30. | D34 |
| 4 | **Dialogues** : les quatre dialogues ont un tableau complet (rôle, titre, texte, action principale, action secondaire, focus initial, Échap, retour du focus). | Décisions 7, 8, 9, 14. | D35, D36, D37, D42 |
| 5 | Décompte négatif « +mm:ss » en rouge : couleur sombre dédiée, contraste mesuré sur fond sombre. Bouton « Suivant » devient « Terminer la Daily » au dernier membre : état décrit. | Décisions 2 et 3. | D30, D31 |
| 6 | Règle de **majuscule des prénoms** : aucun `text-transform` sur les prénoms (section 7). Les libellés de groupe ne sont plus en capitales (`text-transform` supprimé), pour ne pas créer de confusion avec les prénoms. | Demande B. | D47, S23 |
| 7 | **Couleur de texte secondaire** clair corrigée : `#6E6E73` devient `#5E5E63`. À `#6E6E73`, le texte sur `--color-surface-sunken` (pastille de compteur, segment inactif) tombait à 4,27:1, sous le seuil de 4,5:1. Le nouveau couple tient à 5,43:1. | Correction d'un défaut de la v2. | section 2.4 |
| 8 | Pastille de compteur : le chiffre passe en `--color-text` (14,16:1 sur sunken). | Même correction que 7 : information portée par du texte. | S4 |
| 9 | Bouton principal : texte blanc en clair, texte `--color-on-fill` (`#1C1C1E`) en sombre, pour conserver 4,5:1 minimum sur un fond d'accent clair. | Contraste en sombre. | section 4.1 |
| 10 | Libellés de groupe (« Équipe », « Membres ») en casse de phrase, graisse 600. | Voir 6. | section 3.2 |
| 11 | Champs : `text-transform: none` explicite sur les champs et les prénoms. | Voir 6. | section 7 |
| 12 | Dialogues : largeur, empilement, focus et Échap alignés sur le brief v3 (Continuer par défaut sur les dialogues d'arrêt et de sortie ; Annuler par défaut sur la suppression ; Revenir par défaut sur la modification). | Décisions 7 à 9, 14. | section 6 |

Ce qui ne change pas : la palette claire de la v2 (sauf 7), la police système, l'échelle typographique, le glissement horizontal des écrans, la règle « une action principale par écran », l'icône d'application (section 9).

---

## 1. Direction

**Une phrase.** Une application d'équipe qui se fait oublier : le fond est gris très clair en clair et gris sombre en sombre, les informations sont sur des surfaces claires (ou plus élevées en sombre), le chronomètre est le seul élément qui pèse lourd à l'écran.

**Ce qu'on évite.**
- Les champs HTML bruts : bordure grise complète, police par défaut, contour natif.
- Le formulaire générique : titre, champs empilés, gros bouton bleu au milieu.
- L'aspect tableau de bord SaaS : cartes de statistiques, barres latérales, pastilles multicolores, graphiques.
- Les dégradés, les halos, les néons, le noir pur (`#000`) en sombre, les ombres fortes sur fond sombre.
- Les bordures latérales colorées.
- Les emoji comme icônes. Toutes les icônes sont des SVG monochromes, trait 2 px, coins arrondis.
- Les animations sur les actions au clavier, et les animations qui ne peuvent pas être interrompues.
- Le texte en capitales forcées sur les prénoms.

**Principe.** Une action principale par écran, placée au même endroit. L'écran du chronomètre n'est jamais l'écran d'entrée.

---

## 2. Couleurs

### 2.1 Tokens clairs (défaut)

Ces valeurs s'appliquent quand le système est en clair, et servent de base à la palette sombre (2.2).

| Token | Valeur | Rôle |
|---|---|---|
| `--color-bg` | `#F5F5F7` | Fond de page |
| `--color-surface` | `#FFFFFF` | Groupes de liste, champs, dialogue |
| `--color-surface-sunken` | `#EBEBF0` | Fond du segment actif de contrôle, pastille de compteur, membre courant, survol de bouton secondaire |
| `--color-surface-pressed` | `#DCDCE1` | Fond d'appui du bouton secondaire et de l'icône |
| `--color-text` | `#1D1D1F` | Texte principal, titres, chronomètre |
| `--color-text-secondary` | `#5E5E63` | Libellés secondaires, aides, métadonnées, « passé », texte désactivé |
| `--color-accent` | `#0066CC` | Accent unique : bouton principal, lien, focus, action « Ouvrir » |
| `--color-accent-hover` | `#0058B3` | Bouton principal au survol |
| `--color-accent-pressed` | `#004C99` | Bouton principal et texte d'accent à l'appui |
| `--color-on-fill` | `#FFFFFF` | Texte sur un fond plein (bouton principal, bouton destructif plein) |
| `--color-success` | `#1E7A3A` | Statut « fait », confirmation |
| `--color-success-bg` | `#E6F4EA` | Fond du bandeau de succès |
| `--color-error` | `#C4271C` | Message d'erreur, icône, texte du bouton « Arrêter » |
| `--color-error-bg` | `#FBE9E7` | Fond du bandeau d'erreur |
| `--color-destructive-fill` | `#C4271C` | Fond du bouton destructif plein (« Supprimer l'équipe ») |
| `--color-overrun` | `#B3261E` | Chronomètre et libellé en dépassement |
| `--color-border-control` | `#808086` | Filet de champ, bordure de bouton secondaire, contour du sélecteur en erreur |
| `--color-separator` | `#D2D2D7` | Séparateurs entre lignes (décoratif) |
| `--color-focus` | `#0066CC` | Anneau de focus |
| `--color-scrim` | `rgba(29, 29, 31, 0.32)` | Voile derrière le dialogue |
| `--color-material` | `rgba(255, 255, 255, 0.72)` | Barre d'actions mobile (matériau translucide) |

### 2.2 Tokens sombres

Principes, dans l'esprit des surfaces système Apple :
- **Trois niveaux de surface, pas d'ombre.** Le fond est le plus sombre, les groupes sont un cran plus clairs, les zones enfoncées (sunken) et appuyées (pressed) remontent ensuite. Le relief vient de la luminosité, pas d'une ombre.
- **Pas de noir pur.** Le fond le plus bas est `#1C1C1E`, gris très foncé teinté.
- **Accents désaturés et éclaircis.** Le bleu passe à `#64B5FF`, plus clair, pour rester lisible sur fond sombre sans vibrer. Pas de couleur néon.
- **Texte principal non blanc pur** (`#F5F5F7`), pour réduire l'éblouissement.

| Token | Valeur sombre | Rôle |
|---|---|---|
| `--color-bg` | `#1C1C1E` | Fond de page |
| `--color-surface` | `#2C2C2E` | Groupes de liste, champs, dialogue |
| `--color-surface-sunken` | `#3A3A3C` | Membre courant, pastille, segment actif, survol du bouton secondaire |
| `--color-surface-pressed` | `#48484A` | Appui du bouton secondaire et de l'icône |
| `--color-text` | `#F5F5F7` | Texte principal, titres, chronomètre |
| `--color-text-secondary` | `#AEAEB2` | Libellés secondaires, aides, « passé », texte désactivé |
| `--color-accent` | `#64B5FF` | Accent : bouton principal, lien, focus, « Ouvrir » |
| `--color-accent-hover` | `#7EC2FF` | Bouton principal au survol |
| `--color-accent-pressed` | `#8ACBFF` | Bouton principal et texte d'accent à l'appui |
| `--color-on-fill` | `#1C1C1E` | Texte sur fond plein clair (bouton principal, destructif plein) |
| `--color-success` | `#7BD88F` | Statut « fait », confirmation |
| `--color-success-bg` | `#1E3323` | Fond du bandeau de succès |
| `--color-error` | `#FF8A80` | Message d'erreur, icône, texte du bouton « Arrêter » |
| `--color-error-bg` | `#3D2421` | Fond du bandeau d'erreur |
| `--color-destructive-fill` | `#FF8A80` | Fond du bouton destructif plein |
| `--color-overrun` | `#FF8A80` | Chronomètre et libellé en dépassement |
| `--color-border-control` | `#8E8E93` | Filet de champ, bordure de bouton secondaire |
| `--color-separator` | `#3A3A3C` | Séparateurs entre lignes (décoratif) |
| `--color-focus` | `#64B5FF` | Anneau de focus |
| `--color-scrim` | `rgba(28, 28, 30, 0.6)` | Voile derrière le dialogue (teinté, pas noir) |
| `--color-material` | `rgba(44, 44, 46, 0.72)` | Barre d'actions mobile |

Note : en sombre, le rouge de dépassement et le rouge d'erreur sont identiques (`#FF8A80`). Ils restent distingués par le texte (« Temps dépassé » contre « Impossible d'enregistrer »), comme en clair, et la règle « la couleur ne porte jamais seule une information » s'applique.

### 2.3 Mise en œuvre

- `<meta name="color-scheme" content="light dark">` dans `index.html`, et `color-scheme: light dark` sur `:root`, pour que les contrôles natifs (`<select>`, barre de défilement) suivent le thème.
- Les tokens sont définis une fois sur `:root` (clair), puis redéfinis sous `@media (prefers-color-scheme: dark)`. Aucun JavaScript, aucun bouton, aucune classe de thème.
- Un changement du réglage système pendant l'usage est pris en compte par le navigateur, sans rechargement (S25).
- Les ombres de la section 3.5 changent de valeur ; en sombre, la plupart disparaissent.

### 2.4 Contrastes vérifiés (WCAG 2.x, luminance relative)

Seuils : 4,5:1 pour le texte normal, 3:1 pour le texte grand (24 px, ou 18,66 px en gras) et les composants d'interface (WCAG 1.4.11).

**Clair**

| Couple texte / fond | Ratio | Verdict |
|---|---|---|
| `--color-text` sur `--color-bg` | 15,46:1 | AAA |
| `--color-text` sur `--color-surface` | 16,83:1 | AAA |
| `--color-text` sur `--color-surface-sunken` | 14,16:1 | AAA |
| `--color-text` sur `--color-surface-pressed` | 12,32:1 | AAA |
| `--color-text` sur `--color-error-bg` | 14,35:1 | AAA |
| `--color-text` sur `--color-success-bg` | 14,82:1 | AAA |
| `--color-text-secondary` sur `--color-bg` | 5,92:1 | AA |
| `--color-text-secondary` sur `--color-surface` | 6,45:1 | AA |
| `--color-text-secondary` sur `--color-surface-sunken` | 5,43:1 | AA |
| `--color-text-secondary` sur `--color-surface-pressed` | 4,72:1 | AA (non utilisé) |
| `--color-on-fill` (blanc) sur `--color-accent` | 5,57:1 | AA |
| `--color-on-fill` (blanc) sur `--color-accent-hover` | 6,89:1 | AA |
| `--color-on-fill` (blanc) sur `--color-accent-pressed` | 8,42:1 | AAA |
| `--color-on-fill` (blanc) sur `--color-destructive-fill` | 5,75:1 | AA |
| `--color-accent` sur `--color-surface` (lien, « Ouvrir ») | 5,57:1 | AA |
| `--color-accent` sur `--color-bg` | 5,11:1 | AA |
| `--color-accent` sur `--color-surface-sunken` (membre courant) | 4,68:1 | AA |
| `--color-accent-pressed` sur `--color-surface-pressed` | 6,16:1 | AA |
| `--color-error` sur `--color-surface` | 5,75:1 | AA |
| `--color-error` sur `--color-bg` | 5,28:1 | AA |
| `--color-error` sur `--color-error-bg` | 4,90:1 | AA |
| `--color-overrun` sur `--color-surface` | 6,54:1 | AA |
| `--color-overrun` sur `--color-error-bg` | 5,58:1 | AA |
| `--color-success` sur `--color-surface` | 5,38:1 | AA |
| `--color-success` sur `--color-success-bg` | 4,74:1 | AA |
| `--color-border-control` sur `--color-surface` (filet de champ) | 3,93:1 | AA composant (3:1) |
| `--color-focus` sur `--color-surface` et `--color-bg` | 5,57:1 et 5,11:1 | AA composant |
| `--color-separator` sur `--color-surface` | 1,51:1 | Décoratif uniquement |

**Sombre**

| Couple texte / fond | Ratio | Verdict |
|---|---|---|
| `--color-text` sur `--color-bg` | 15,63:1 | AAA |
| `--color-text` sur `--color-surface` | 12,80:1 | AAA |
| `--color-text` sur `--color-surface-sunken` | 10,42:1 | AAA |
| `--color-text` sur `--color-surface-pressed` | 8,38:1 | AAA |
| `--color-text` sur `--color-error-bg` | 13,10:1 | AAA |
| `--color-text` sur `--color-success-bg` | 12,42:1 | AAA |
| `--color-text-secondary` sur `--color-bg` | 7,69:1 | AAA |
| `--color-text-secondary` sur `--color-surface` | 6,30:1 | AA |
| `--color-text-secondary` sur `--color-surface-sunken` | 5,13:1 | AA |
| `--color-on-fill` (`#1C1C1E`) sur `--color-accent` | 7,77:1 | AAA |
| `--color-on-fill` sur `--color-accent-hover` | 8,95:1 | AAA |
| `--color-on-fill` sur `--color-accent-pressed` | 9,78:1 | AAA |
| `--color-on-fill` sur `--color-destructive-fill` | 7,45:1 | AAA |
| `--color-accent` sur `--color-surface` | 6,37:1 | AA |
| `--color-accent` sur `--color-bg` | 7,77:1 | AAA |
| `--color-accent` sur `--color-surface-sunken` | 5,19:1 | AA |
| `--color-accent-pressed` sur `--color-surface-pressed` | 5,24:1 | AA |
| `--color-error` sur `--color-bg` | 7,45:1 | AAA |
| `--color-error` sur `--color-surface` | 6,10:1 | AA |
| `--color-error` sur `--color-surface-sunken` | 4,97:1 | AA |
| `--color-error` sur `--color-error-bg` | 6,25:1 | AA |
| `--color-overrun` sur `--color-bg` | 7,45:1 | AAA |
| `--color-overrun` sur `--color-surface` | 6,10:1 | AA |
| `--color-success` sur `--color-surface` | 8,00:1 | AAA |
| `--color-success` sur `--color-success-bg` | 7,77:1 | AAA |
| `--color-border-control` sur `--color-surface` (filet de champ) | 4,27:1 | AA composant (3:1) |
| `--color-border-control` sur `--color-bg` | 5,22:1 | AA composant |
| `--color-focus` sur `--color-surface` et `--color-bg` | 6,37:1 et 7,77:1 | AA composant |
| `--color-separator` sur `--color-surface` | 1,23:1 | Décoratif uniquement |

**Ratio minimal des couples porteurs d'information.**
- **En clair : 4,68:1** (`--color-accent` sur `--color-surface-sunken`, membre courant). Tous les autres couples informatifs sont supérieurs à 4,70:1.
- **En sombre : 4,97:1** (`--color-error` sur `--color-surface-sunken`). Tous les autres couples informatifs sont supérieurs à 5,10:1.

**Règle d'usage.** Le texte secondaire ne se pose jamais sur `--color-surface-pressed` en sombre (4,13:1, seul couple sous 4,5:1 de la palette sombre). Il n'est utilisé que sur bg, surface et sunken.

**Règles d'information.**
- La couleur ne porte jamais seule une information.
- Erreur = icône + texte + filet du champ.
- Dépassement = libellé « Temps dépassé » + « +mm:ss » + couleur.
- Succès = icône + texte.
- Statut d'un membre = libellé (« fait », « passé »), jamais la couleur seule.

### 2.5 États désactivés

Un élément désactivé garde son libellé visible. Son fond passe à `--color-surface-sunken`, son texte à `--color-text-secondary`, il perd son filet fort et prend `cursor: not-allowed`. Le message qui explique pourquoi reste affiché sous le composant, lié par `aria-describedby`. Un bouton désactivé reste focalisable (`aria-disabled="true"`) pour que ce message soit lu.

---

## 3. Typographie, espacements, rayons, ombres, mouvement

### 3.1 Police

```
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
             "Segoe UI", system-ui, sans-serif;
```

Aucune police web chargée : pas de requête réseau, cohérent avec le fonctionnement local.

Chiffres du chronomètre, des compteurs, des temps du bilan : `font-variant-numeric: tabular-nums;`.

### 3.2 Échelle typographique

Principe Apple : l'interlignage et le crénage varient avec la taille.

| Token | Taille / interligne | Graisse | Crénage | Usage |
|---|---|---|---|---|
| `--type-timer` | `clamp(72px, 18vw, 184px)` / 1 | 300 | -0,02 em | Décompte « mm:ss » et « +mm:ss » (écran e) |
| `--type-large-title` | 34 px / 41 px | 600 | -0,015 em | Titre d'écran (« Mes équipes », nom d'équipe, « Bilan de la Daily ») |
| `--type-title-2` | 22 px / 28 px | 600 | -0,01 em | Titres de section, titre de dialogue, prénom courant |
| `--type-body` | 17 px / 24 px | 400 | 0 | Texte courant, champs, prénoms des membres |
| `--type-body-strong` | 17 px / 24 px | 600 | 0 | Libellé de champ, bouton principal, nom d'équipe dans une liste |
| `--type-callout` | 15 px / 20 px | 400 | 0 | Messages d'aide et d'erreur, métadonnées, texte d'état du bilan |
| `--type-footnote` | 13 px / 18 px | 600 | +0,01 em | Libellés de groupe (casse de phrase, pas de capitales), numéro d'ordre, en-têtes de colonnes du bilan |

Mobile sous 600 px : `--type-large-title` passe à 28 px / 34 px. Les champs restent à 17 px minimum (pas de zoom automatique sur iOS). Les espacements sont en `rem` ou `px` selon la section 3.3 ; le texte peut être agrandi sans casser la mise en page.

### 3.3 Espacements (base 4 px)

| Token | Valeur | Usage type |
|---|---|---|
| `--space-1` | 4 px | Icône et texte |
| `--space-2` | 8 px | Entre une ligne et son bouton |
| `--space-3` | 12 px | Entre un champ et son message |
| `--space-4` | 16 px | Marge latérale mobile, entre éléments liés |
| `--space-cta-to-list` | 16 px (alias de `--space-4`) | **Espace vertical entre le bouton « Nouvelle équipe » et la liste** (écran a), sur ordinateur et mobile |
| `--space-5` | 24 px | Entre deux groupes d'un écran |
| `--space-6` | 32 px | Marge haute des titres d'écran (mobile) |
| `--space-7` | 48 px | Marge interne du groupe (desktop) |
| `--space-8` | 64 px | Respiration haut de page (desktop) |

**Espace sous « Nouvelle équipe » (écran a, décision D48).** Le bouton est dans le flux, placé avant la liste :
- `margin-block-end: var(--space-cta-to-list)` sur le bouton ;
- l'espace est présent même quand la liste est courte, et quand la liste est vide ;
- il est identique sur ordinateur et mobile : 16 px mesurés entre le bas du bouton et le haut du premier groupe, pas entre le bouton et le titre.

Marge latérale : 16 px sur mobile, sans exception. Largeur maximale de colonne : 560 px. Hauteur de ligne de liste : 52 px minimum.

### 3.4 Rayons

| Token | Valeur | Usage |
|---|---|---|
| `--radius-control` | 12 px | Champs, boutons icône, bandeaux |
| `--radius-group` | 14 px | Groupes de liste, dialogue |
| `--radius-capsule` | 999 px | Boutons principaux et secondaires, compteur, segments, sélecteur de temps |

### 3.5 Ombres et matériaux

| Token | Clair | Sombre | Usage |
|---|---|---|---|
| `--shadow-group` | `0 1px 2px rgba(0,0,0,0.04)` | `none` | Groupe de liste sur le fond (en sombre, le groupe est déjà plus clair que le fond) |
| `--shadow-raised` | `0 12px 32px rgba(0,0,0,0.16)` | `0 0 0 0.5px rgba(255,255,255,0.12), 0 16px 40px rgba(0,0,0,0.5)` | Dialogue |
| `--shadow-focus` | `0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-focus)` | identique | Anneau de focus clavier |
| `--material-blur` | `blur(20px) saturate(180%)` | identique | Barre d'actions mobile |
| `--material-edge` | `rgba(255,255,255,0.4)` | `rgba(255,255,255,0.08)` | Bord supérieur 1 px de la barre (lumière sur le matériau) |

Le matériau translucide ne se superpose jamais à un autre matériau. En `prefers-reduced-transparency: reduce`, la barre devient `--color-surface` opaque et sans flou.

### 3.6 Mouvement

| Token | Valeur |
|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` : entrées, retours immédiats |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` : dialogue, changement d'écran |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` : changements de couleur et de fond |
| `--duration-press` | 120 ms |
| `--duration-hover` | 150 ms |
| `--duration-fast` | 180 ms |
| `--duration-base` | 240 ms |
| `--duration-screen` | 280 ms (glissement d'écran, sous 300 ms) |

Règles :
- Aucune animation au-delà de 300 ms sur un élément d'interface.
- Transitions sur propriétés nommées (`transform`, `opacity`, `background-color`, `color`). Jamais `transition: all`. Pas de `@keyframes` sur les éléments interactifs, pour rester interruptibles.
- Aucun `scale(0)` : les éléments apparaissent de `scale(0.96)` avec `opacity: 0`, ou de `translateX(±24px)` pour un écran.
- Aucune animation pour les actions déclenchées au clavier (Entrée, Échap, Tab, flèches).
- Le chronomètre ne s'anime pas : le chiffre change, il ne glisse pas.
- Le décompte passe du blanc au rouge en 240 ms `--ease-standard` au dépassement : c'est un changement de couleur, pas un mouvement.
- Le mouvement est interruptible : une transition part de la valeur en cours, jamais de la cible.

---

## 4. Composants et états

Chaque composant décrit : repos, survol (`@media (hover: hover) and (pointer: fine)` uniquement), focus clavier (`:focus-visible`), appui (`:active`, instantané), désactivé (`disabled` ou `aria-disabled="true"`).

Règle commune de focus : anneau `--shadow-focus` au clavier uniquement. Aucune suppression de contour sans remplacement.

Zone cliquable minimale : 44 × 44 px, y compris le bouton icône « Supprimer ».

### 4.1 Bouton principal

- Forme : capsule `--radius-capsule`, hauteur 52 px, padding horizontal 28 px, largeur minimale 160 px ; pleine largeur sur mobile.
- Style : fond `--color-accent`, texte `--color-on-fill`, `--type-body-strong`.
- Survol : fond `--color-accent-hover`.
- Focus clavier : `--shadow-focus`.
- Appui : fond `--color-accent-pressed`, `transform: scale(0.97)` en `--duration-press` `--ease-out`. Le retour au repos (160 ms) est plus lent que l'appui, pour que l'appui se sente.
- Désactivé : fond `--color-surface-sunken`, texte `--color-text-secondary`, pas de survol ni d'appui.
- Libellés : « Enregistrer l'équipe », « Démarrer une Daily », « Commencer la Daily », « Suivant », « Terminer la Daily », « Nouvelle équipe », « Reprendre la Daily », « Retour à l'équipe », « Continuer » (dialogue), « Enregistrer » (dialogue).
- Par écran : **un seul** bouton principal plein, à la même position dans le flux.

### 4.2 Bouton secondaire

- Forme : capsule, hauteur 52 px, padding horizontal 24 px.
- Style : fond `--color-surface`, bordure 1 px `--color-border-control`, texte `--color-accent`, `--type-body-strong`.
- Survol : fond `--color-surface-sunken`.
- Focus clavier : `--shadow-focus`.
- Appui : fond `--color-surface-pressed`, texte `--color-accent-pressed`.
- Désactivé : bordure `--color-separator`, texte `--color-text-secondary`.
- Libellés : « Modifier l'équipe », « Ouvrir », « Ajouter » (variante texte, voir 4.4), « Passer ce membre ».
- Variante destructive : texte `--color-error` (« Arrêter la Daily » sur (e)).

### 4.3 Bouton texte (lien d'action)

- Texte seul, `--type-body`, couleur `--color-accent`, zone 44 px de haut minimum. Chevron pour le retour (`‹ Mes équipes`).
- Survol : soulignement. Focus : `--shadow-focus` avec rayon 8 px.
- Variante destructive : texte `--color-error` (« Supprimer » sur une ligne d'équipe).
- Libellés : « Annuler », « Mes équipes », « Copier le bilan » (écran f), « Passer » (ligne de membre).

### 4.4 Bouton « Ajouter » (texte avec icône)

- Icône « plus » SVG 20 px et libellé « Ajouter », texte `--color-accent`, `--type-body-strong`, dans une zone de 44 px.
- Pas de fond plein, pas de bordure.
- Désactivé (champ vide) : couleur `--color-text-secondary`, pas d'interaction. Le message « Saisissez un prénom. » n'apparaît qu'après une tentative.

### 4.5 Bouton icône

- Forme : cercle 44 × 44 px, icône SVG 20 px, trait 2 px, couleur `--color-text-secondary`.
- Survol : fond `--color-surface-sunken`, icône `--color-text`.
- Appui : fond `--color-surface-pressed`, icône `--color-text` (12,32:1 clair, 8,38:1 sombre).
- Focus : `--shadow-focus`.
- Désactivé : icône `--color-text-secondary` à 50 % d'opacité, pas d'interaction.
- `aria-label` explicite (« Supprimer Thomas »), `title` au survol pour les souris.

### 4.6 Champ de texte

- Structure : libellé visible au-dessus (`--type-body-strong`, `--color-text`), champ, aide ou erreur dessous. Le placeholder ne remplace jamais le libellé.
- Champ : hauteur 52 px, padding 12 px 0, texte `--type-body` 17 px, `text-transform: none`.
- Identification : filet inférieur 1 px `--color-border-control` (3,93:1 clair, 4,27:1 sombre), pour que le champ soit identifiable sans bordure complète.
- Survol : filet `--color-text-secondary`.
- Focus clavier : filet 2 px `--color-focus` et `--shadow-focus` sur la ligne. Le contour natif est retiré et remplacé.
- Erreur : filet 2 px `--color-error`, icône d'alerte SVG 16 px, `aria-invalid="true"`.
- Désactivé : texte `--color-text-secondary`, filet pointillé `--color-separator`, `disabled`.

Message d'erreur ou d'aide sous le champ :
- `<p id="{champ}-erreur">` avec icône SVG 16 px `aria-hidden` et texte `--type-callout` `--color-error`.
- Le champ porte `aria-describedby="{champ}-aide {champ}-erreur"`.
- Le message apparaît au blur ou à la tentative d'enregistrement, jamais pendant la frappe d'un caractère valide.
- Apparition : fondu et translation de 4 px, `--duration-base`, `--ease-out`. Fondu seul si l'utilisateur a réduit les mouvements.

### 4.7 Sélecteur de temps (1 à 5 min par membre)

- Élément : `<select>` natif stylé en capsule : texte « 2 min » et chevron SVG, hauteur 44 px, fond `--color-surface-sunken`, pas de bordure, `--type-body`, texte `--color-text` (14,16:1 clair, 10,42:1 sombre).
- Pourquoi un `<select>` natif : clavier, lecteurs d'écran et roulette native sur téléphone.
- Options : « 1 min » à « 5 min ».
- Survol : fond `--color-surface-pressed`. Focus : `--shadow-focus`.
- Appui natif. Aucun état d'erreur possible : chaque liste propose toujours une valeur entre 1 et 5 (D40).

### 4.8 Choix de l'ordre de passage

- Contrôle segmenté : deux segments « Ordre de l'équipe » et « Ordre aléatoire » dans une capsule `--color-surface-sunken`, hauteur 36 px (zone de 44 px par segment via `padding`).
- Segment actif : fond `--color-surface`, texte `--color-text`, `--type-body-strong`, ombre `--shadow-group`. Segment inactif : texte `--color-text-secondary` sur sunken (5,43:1 clair, 5,13:1 sombre).
- Sémantique : `role="radiogroup"` avec deux `<input type="radio">` masqués visuellement et étiquetés par leur segment. Flèches gauche et droite changent de choix.
- Transition du fond du segment actif : `transform` 240 ms `--ease-drawer`. Au clavier, le changement est instantané.
- Défaut : « Ordre de l'équipe » (D41).

### 4.9 Ligne de membre

- Ligne : hauteur minimale 52 px, padding 12 px 8 px 12 px 16 px, séparateur 1 px `--color-separator` (retrait de 16 px à gauche).
- Contenu : numéro d'ordre (`--type-footnote`, `--color-text-secondary`, `tabular-nums`, largeur fixe 24 px), prénom (`--type-body`, `--color-text`, `text-transform: none`), à droite l'action ou le statut.
- Action « Passer » (écran e, membres à venir non passés) : bouton texte `--color-accent`, `--type-callout`, zone 44 px, `aria-label="Passer Thomas"`.
- Statut « fait » : icône coche SVG 16 px `--color-success` et libellé « fait » en `--color-text-secondary`. Pas d'action.
- Statut « passé » : icône barre oblique SVG 16 px `--color-text-secondary` et libellé « passé ». Pas d'action. Le prénom reste en `--color-text-secondary`.
- Membre courant : fond `--color-surface-sunken`, prénom en `--type-title-2`, indicateur « En cours » en `--type-footnote` `--color-accent`. Pas de bouton « Passer » sur la ligne (l'action est dans la zone principale).
- Lecture par lecteur d'écran : liste `<ol>`, chaque statut est dans le texte de la ligne (« Thomas, fait »).

### 4.10 Compteur de membres

- Pastille capsule, fond `--color-surface-sunken`, texte `--type-callout` **`--color-text`** (corrigé en v3, voir changelog 8), hauteur 28 px, `tabular-nums`.
- Libellés : « 0 membre », « 1 membre », « 2 membres »…
- Maximum 15 : pastille contour `--color-border-control`.
- `role="status"` et `aria-live="polite"`. L'annonce n'a lieu qu'au changement de valeur.

### 4.11 Présentation de l'équipe (écran c)

Groupe blanc (style réglages), pas de carte dans une carte. Contenu dans l'ordre : nom d'équipe (`<h1>`), ligne de métadonnées (« 4 membres » en `--type-callout` `--color-text-secondary`), séparateur, liste des membres en lecture seule (4.9 sans action, numéros d'ordre visibles).

### 4.12 Chronomètre grand format (écran e)

- Décompte : `--type-timer`, poids 300, `tabular-nums`, centré.
- En cours : `--color-text`.
- Élément : `<p role="timer" aria-label="Temps restant pour Thomas">`. `aria-live` reste `off`. Les seules annonces sont : démarrage, dépassement (« Temps dépassé », une seule fois) et arrêt, dans une zone `role="status"` masquée visuellement.
- Prénom du membre courant au-dessus du décompte, `--type-title-2`, `--color-text`.
- Temps prévu sous le décompte : « Temps prévu : 2:00 », `--type-body`, `--color-text-secondary`.
- Mise à jour au moins une fois par seconde, calculée sur `Date.now()`, jamais sur un simple compteur d'intervalles.

**Dépassement (clair et sombre).**
- Libellé « Temps dépassé » au-dessus du décompte, `--type-title-2`, `--color-overrun`, toujours présent (il réserve sa place en temps normal, invisible).
- Décompte : `--color-overrun`, affiché « +mm:ss » (par exemple « +01:12 ») en `--type-timer`.
- Ratio du chiffre rouge : 7,45:1 sur `--color-bg` sombre (`#FF8A80` sur `#1C1C1E`), 6,54:1 sur fond clair (`#B3261E` sur `#FFFFFF`). Le texte est donc lisible à l'échelle du chronomètre dans les deux thèmes.
- Passage du décompte à 00:00, puis « +mm:ss » : le signe `+` et les deux points restent visibles dans les deux thèmes.

### 4.13 Bandeau

- Forme : bloc pleine largeur de la colonne, `--radius-control`, fond `--color-error-bg` ou `--color-success-bg`, padding 12 px 16 px, icône SVG 20 px, texte `--type-callout` `--color-text`.
- Pas de bordure latérale colorée.
- Accessibilité : `role="alert"` pour une erreur qui suit une action ; `role="status"` pour un succès ou un état.
- Apparition : fondu et translation de 4 px, `--duration-base`, `--ease-out`.

### 4.14 Barre d'actions (mobile, écrans b, c, d, f)

- Barre fixe en bas, `--color-material`, `--material-blur`, bord supérieur 1 px `--material-edge`, `padding-bottom: env(safe-area-inset-bottom)`.
- Contient le bouton principal pleine largeur, et le bouton secondaire ou le bouton texte au-dessus.
- Apparaît avec le contenu qu'elle sert : pas d'animation d'entrée au chargement.
- Le contenu défilant passe sous la barre ; une marge basse de 96 px évite de masquer le dernier élément.
- Écran (a) : pas de barre. Le bouton « Nouvelle équipe » est dans le flux (section 5.1).

---

## 5. Les six écrans

### 5.0 Règles communes

- Une action principale par écran, placée au même endroit (en bas sur mobile, en bas du contenu sur desktop). Exception : (a) (5.1).
- Desktop (768 px et plus) : colonne centrée de 560 px sur `--color-bg`. Groupes sur `--color-surface`. Pas de carte autour de la colonne.
- Mobile (320 à 767 px) : colonne pleine largeur, marge 16 px, barre d'actions fixe en bas (4.14).
- À 320 px : aucun défilement horizontal ; les libellés longs passent à la ligne ; le chronomètre se réduit par le `clamp`.
- Titre d'écran : `<h1>` en `--type-large-title`. Marge haute 32 px (desktop), 24 px (mobile). Le `<h1>` reçoit le focus après un changement d'écran (`tabindex="-1"`, sans contour visible).
- Bouton retour : lien avec chevron en haut à gauche (`‹ Mes équipes`).
- Pas de dégradé de fond, pas de barre latérale, pas de navigation par onglets.

### 5.1 Écran (a) : Mes équipes

**But :** voir les équipes, en ouvrir une, en créer une, en supprimer une.

**Ordre des éléments (desktop et mobile identiques) :**
1. `<h1>` « Mes équipes ».
2. Bouton principal « Nouvelle équipe ». Sur desktop, largeur minimale 160 px, aligné à gauche. Sur mobile, pleine largeur.
3. Espace vertical `--space-cta-to-list` (16 px).
4. Groupe de liste : une ligne par équipe, triée par ordre alphabétique (D43).

**Ligne d'équipe :**
- Nom d'équipe (`--type-body-strong`, `text-transform: none`), « N membres » en `--type-callout` `--color-text-secondary` dessous.
- Actions à droite : « Ouvrir » (bouton secondaire compact, 44 px de haut) puis « Supprimer » (bouton texte destructif, 44 px).
- Sous 420 px, les deux actions passent sous le nom, alignées à droite, pour que le nom garde toute la largeur.

**Desktop :** groupe de 560 px ; lignes de 60 px minimum.
**Mobile :** groupe pleine largeur ; pas de barre d'actions. Le bouton « Nouvelle équipe » est dans le flux.

**Liste vide :** non affichée. Après suppression de la dernière équipe, l'application affiche (b).

**Transitions :** « Ouvrir » → (c) par glissement vers la gauche. « Nouvelle équipe » → (b) par glissement vers la gauche. « Supprimer » → dialogue 6.1 (centré, fondu), pas de glissement.

**Clavier :** Tab parcourt « Nouvelle équipe », puis pour chaque équipe « Ouvrir » puis « Supprimer ». Une ligne n'est pas cliquable en entier.

### 5.2 Écran (b) : Création et modification d'équipe

**But :** saisir l'équipe une fois, ou la corriger.

**Ordre des éléments :**
1. Lien « ‹ Mes équipes » (en modification seulement).
2. `<h1>` : « Nouvelle équipe » ou « Modifier l'équipe ».
3. Groupe « Équipe » (libellé de groupe en casse de phrase) : champ « Nom d'équipe » (50 caractères max).
4. Libellé de groupe « Membres » avec compteur (4.10) à droite.
5. Groupe « Ajouter un membre » : champ « Prénom » (30 caractères max) et bouton texte « Ajouter » à droite. Sur mobile, « Ajouter » passe sous le champ, pleine largeur, reste un bouton texte. Entrée dans le champ ajoute le membre.
6. Message d'aide ou de maximum sous le groupe.
7. Groupe de la liste des membres (4.9 sans action « Passer », bouton icône « Supprimer » à droite). Texte d'état vide : « Aucun membre pour l'instant. ».
8. Zone d'actions : bouton principal « Enregistrer l'équipe » ; lien « Annuler » à gauche du principal sur desktop, au-dessus sur mobile (4.14).

**États :**
- *Vide :* compteur « 0 membre », aide « Ajoutez au moins 2 membres pour continuer. », « Enregistrer l'équipe » désactivé (`aria-disabled`).
- *Ajout :* la ligne est ajoutée en fin de liste ; sans animation si l'ajout vient du clavier (Entrée), fondu de 180 ms si l'ajout vient d'un clic. Le champ Prénom se vide et reprend le focus.
- *Erreur de champ :* message sous le champ (4.6), filet d'erreur. À l'enregistrement, le focus va sur le premier champ en erreur, dans l'ordre de l'écran.
- *Maximum (15) :* champ Prénom désactivé avec « Une équipe ne peut pas dépasser 15 membres. ».
- *Confirmation de retrait :* en modification, si l'enregistrement retire un membre, le dialogue 6.4 s'ouvre avant l'enregistrement.
- *Enregistré :* transition vers (c).

**Suppression de membre :** la ligne disparaît par fondu de 160 ms. Le focus passe au bouton « Supprimer » de la ligne suivante, sinon au champ Prénom. Le focus ne se perd jamais dans le vide.

**Desktop :** groupes « Équipe » et « Ajouter » en colonne ; « Ajouter » à droite du champ Prénom.
**Mobile :** champs empilés pleine largeur ; liste au-dessus de la barre d'actions.

**Clavier :** nom → prénom → « Ajouter » → « Supprimer » de chaque ligne → « Annuler » → « Enregistrer l'équipe ». Entrée dans le champ Prénom ajoute le membre. Entrée sur les autres champs : sans effet. Échap : « Annuler » en modification, sans effet en création.

### 5.3 Écran (c) : Présentation de l'équipe

**But :** vérifier l'équipe et lancer une Daily.

**Ordre des éléments :**
1. Lien « ‹ Mes équipes ».
2. `<h1>` : nom de l'équipe.
3. Groupe de présentation (4.11).
4. Message d'état sous le groupe si moins de 2 membres : « Ajoutez au moins 2 membres pour démarrer. », lié au bouton par `aria-describedby`.
5. Zone d'actions : bouton principal « Démarrer une Daily » (désactivé sous 2 membres) ; bouton secondaire « Modifier l'équipe ».

**Desktop :** zone d'actions à droite, secondaire à gauche du principal (même ordre DOM que visuel).
**Mobile :** barre d'actions : principal pleine largeur, secondaire au-dessus.

**États :** équipe complète (principal actif) ; équipe incomplète (principal désactivé, message affiché, « Modifier l'équipe » actif) ; données illisibles (retour à (b) avec le bandeau « Les données de l'équipe sont illisibles. Recréez l'équipe. » [à valider]).

### 5.4 Écran (d) : Préparation de la Daily

**But :** choisir pour cette Daily le temps de parole de chaque membre et l'ordre de passage. Rien n'est enregistré.

**Ordre des éléments :**
1. Lien « ‹ Présentation » (ou « Annuler »).
2. `<h1>` « Préparer la Daily » ; sous le titre, nom d'équipe en `--type-callout` `--color-text-secondary`.
3. Sélecteur « Appliquer à tous » au-dessus de la liste (D44) : choisir une valeur la règle pour tous les membres, les valeurs restent modifiables.
4. Libellé de groupe « Temps de parole ». Groupe : une ligne par membre (4.9) avec le sélecteur 4.7 à droite.
5. Libellé de groupe « Ordre de passage ». Contrôle segmenté 4.8. Aide : « Pour cette Daily seulement. L'ordre de l'équipe ne change pas. ».
6. Zone d'actions : principal « Commencer la Daily » ; lien « Annuler » (retour à (c), rien n'est lancé).

**États :** pré-rempli (chaque membre à 2 minutes, ordre de l'équipe sélectionné) ; pas d'erreur possible.
**Succès :** « Commencer la Daily » ouvre (e), le chronomètre démarre, et le tirage a lieu si l'ordre aléatoire est choisi.

### 5.5 Écran (e) : Daily (chronomètre)

**But :** suivre le temps du membre courant, passer les membres, terminer la Daily.

**Ordre des éléments (mobile) :**
1. En-tête discret : nom d'équipe et mode d'ordre (« Ordre de l'équipe » ou « Ordre aléatoire »). En ordre aléatoire, l'ordre tiré est affiché.
2. Prénom du membre courant (`--type-title-2`).
3. Libellé « Temps dépassé » (réserve son espace, invisible tant que le décompte est positif).
4. Décompte `mm:ss` (4.12), le plus grand élément de l'écran.
5. « Temps prévu : 2:00 » en temps normal ; en dépassement, la ligne « Temps prévu » est remplacée par le libellé qui reste en 3.
6. Bouton « Passer ce membre » (membre courant), sous le décompte.
7. Liste de passage (4.9), dans l'ordre, défilable. Membre courant en évidence, « fait » et « passé » en texte.
8. Barre d'actions fixe : principal « Suivant » (ou « Terminer la Daily » au dernier membre, voir 5.5.1) ; bouton texte destructif « Arrêter la Daily » au-dessus du principal.
9. En pause uniquement : bandeau « Daily en pause » sous le titre, et le principal devient « Reprendre la Daily ».

**Desktop :** décompte centré dans la fenêtre. Liste de passage en colonne droite de 260 px, défilable. « Arrêter la Daily » en bas à gauche, secondaire.

**Comportement :** voir section 3.7 et les stories S13 à S17, S26 à S28 du brief v3. Points de design :
- Le chronomètre démarre au clic sur « Commencer la Daily » (d), jamais à l'ouverture de (e).
- Le focus arrive sur le prénom du membre courant (`tabindex="-1"`) au chargement, jamais sur « Arrêter la Daily ».
- Aucun raccourci clavier global (pas d'Espace qui interromprait le décompte).

#### 5.5.1 Décompte négatif et fin de Daily

**Décompte en dépassement :**
- Le décompte atteint 00:00, puis affiche « +00:01 », « +00:02 »… en `--color-overrun`, avec « Temps dépassé » au-dessus.
- La transition de couleur (blanc vers rouge) dure 240 ms `--ease-standard`. Le chiffre ne glisse pas.
- Le décompte continue jusqu'à « Suivant » (ou « Passer ce membre » sur le membre qui parle).
- L'annonce « Temps dépassé » est lue une seule fois.

**Bouton « Suivant » qui devient « Terminer la Daily » :**

| Élément | Membre courant avec membres à venir | Dernier membre (aucun membre à venir non passé) |
|---|---|---|
| Libellé du principal | « Suivant » | « Terminer la Daily » |
| Action | Enregistre le temps parlé, passe au suivant | Enregistre le temps parlé, ouvre le bilan (f) |
| Style | Principal plein, même position | Principal plein, même position |
| « Passer ce membre » | Visible | Masqué si le membre qui parle est le dernier (aucun membre à passer à sa place) [à valider] |

- Le changement de libellé est instantané. Pour le pointeur, seul l'opacité du libellé change, 120 ms `--ease-out` ; aucun déplacement.
- La condition est recalculée à chaque changement : un membre passé en fin de liste ne bloque pas la fin (décision 2).
- Le focus reste sur le même bouton après « Suivant » ; le nouveau libellé est annoncé par le nom accessible du bouton.

**Ordre de tabulation :** « Passer » des lignes à venir, puis « Passer ce membre », « Suivant » (ou « Terminer la Daily »), « Arrêter la Daily ».

**États :**
- *En cours :* décompte `--color-text`.
- *Dépassement :* 5.5.1.
- *En pause :* voir section 3.7 et S27 du brief. Décompte figé, bandeau « Daily en pause », principal « Reprendre la Daily ». « Suivant » et « Passer ce membre » restent disponibles (le décompte reste figé jusqu'à reprise).

**Desktop :** le bouton « Terminer la Daily » reste à la même place que « Suivant » (dans la barre d'actions de la colonne).

### 5.6 Écran (f) : Bilan de la Daily

**But :** voir ce qui s'est passé pendant la Daily, le copier, revenir à l'équipe. Rien n'est enregistré : quitter (f) efface le bilan.

**Ordre des éléments (desktop et mobile) :**
1. `<h1>` « Bilan de la Daily ».
2. Nom d'équipe en `--type-callout` `--color-text-secondary`.
3. Ligne de synthèse en `--type-callout` (voir états ci-dessous).
4. Groupe de liste : un bloc par membre, dans l'ordre de passage effectif (ordre tiré s'il est aléatoire).
5. Message de copie (« Bilan copié. » en `role="status"`, ou « Copie impossible : sélectionnez le texte du bilan. » en `role="alert"`).
6. Zone d'actions : « Copier le bilan » (bouton texte) et « Retour à l'équipe » (principal).

**Bloc par membre (desktop, ligne de 56 px minimum) :**
- À gauche : numéro d'ordre, prénom (`--type-body-strong`, `text-transform: none`), statut avec icône (« parlé » en `--color-text-secondary`, ou « passé »).
- À droite, trois colonnes à largeur fixe, en-têtes en `--type-footnote` : « Parlé » (temps réellement parlé, `mm:ss`), « Alloué » (`mm:ss`), « Dépassement » (« +mm:ss » en `--color-overrun`, ou « — »).
- Membre passé : statut « passé », colonnes « Parlé » et « Alloué » en « — », dépassement « — ».

**Bloc par membre (mobile, sous 600 px) :** la ligne devient une liste de définitions (`<dl>`) : prénom et statut en haut ; sous eux, trois paires « Parlé 1:45 », « Alloué 2:00 », « Dépassement +0:30 » ou « — ». Une seule colonne, pas de défilement horizontal à 320 px.

**Définitions :**
- *Temps réellement parlé :* durée du tour, pause exclue, jusqu'au clic sur « Suivant », « Passer ce membre » ou « Terminer la Daily ».
- *Dépassement :* temps parlé moins temps alloué, uniquement si positif. Affiché « +mm:ss » ; sinon « — ».

**États :**

*État A : Daily sans dépassement.* Synthèse : « Aucun dépassement. Chaque membre est resté dans son temps. » en `--color-text-secondary`. Toutes les cellules de dépassement affichent « — ». Pas d'icône d'alerte.

*État B : Daily avec dépassements.* Synthèse : « 2 membres ont dépassé leur temps. » en `--color-text`. Chaque dépassement est affiché « +mm:ss » en `--color-overrun`, précédé d'une icône flèche vers le haut 16 px (le texte et l'icône portent l'information, la couleur seule non). Les membres sans dépassement gardent « — ». Les membres passés restent « passé » sans dépassement.

*Mixte (passés et dépassements) :* la synthèse compte uniquement les membres qui ont parlé.

**Zone d'actions :**
- *Desktop :* « Copier le bilan » à gauche (bouton texte), « Retour à l'équipe » à droite (principal). Même ordre DOM que visuel.
- *Mobile :* barre d'actions (4.14) : « Retour à l'équipe » pleine largeur, « Copier le bilan » au-dessus, centré, en bouton texte.

**Copie :** le bloc du bilan reste sélectionnable (`user-select: text`), y compris après échec de copie. Le texte copié : titre « Daily : {équipe}, {date} », puis une ligne par membre : « {Prénom} : {parlé} parlé, {alloué} alloué, +{dépassement} de dépassement » ou « {Prénom} : passé ».

**Clavier :** Tab : « Copier le bilan », puis « Retour à l'équipe ». Entrée sur « Retour à l'équipe » ouvre (c) de la même équipe et efface le bilan. Pas de dialogue sur cette sortie, car le bilan est terminé et rien n'est sauvegardé.

**Transitions :** arrivée depuis (e) : glissement vers la gauche, 280 ms `--ease-drawer`. Retour vers (c) : glissement vers la droite.

---

## 6. Dialogues

### 6.0 Règles communes

- Rôle `alertdialog`, `aria-modal="true"`, `aria-labelledby` (titre), `aria-describedby` (texte).
- Largeur : 320 px, 360 px maximum. Centré dans la fenêtre, voile `--color-scrim`. Il n'est pas ancré à son bouton, donc pas de `transform-origin` sur le bouton déclencheur (les modales restent centrées).
- Titre : `--type-title-2`, `--color-text`. Texte : `--type-body`, `--color-text`. Pas de titre en capitales.
- Boutons côte à côte, pleine largeur chacun. En dessous de 340 px : empilés, l'action sûre en premier.
- Focus initial sur le bouton indiqué ci-dessous. Tab et Maj+Tab circulent entre les boutons du dialogue (piège de focus). L'arrière-plan est `inert`.
- Échap ferme le dialogue sur l'action sûre (sauf indication contraire).
- Au retour, le focus revient sur l'élément qui a ouvert le dialogue.
- Apparition : voile en fondu 160 ms ; carte en `scale(0.96)` vers 1 et fondu, 240 ms `--ease-drawer`. Disparition plus rapide, 160 ms. Fondu seul si mouvement réduit.
- Dans le sombre : carte `--color-surface`, bord `--shadow-raised` (liseré 0,5 px), pas d'ombre portée visible sur le fond.

### 6.1 Supprimer l'équipe (depuis (a))

| Élément | Valeur |
|---|---|
| Titre | « Supprimer l'équipe « {nom} » ? » |
| Texte | « Les {N} membres de l'équipe seront supprimés. Cette action est définitive. » |
| Action principale | « Supprimer l'équipe » : bouton destructif plein (`--color-destructive-fill`, texte `--color-on-fill`). Clair : 5,75:1. Sombre : 7,45:1. |
| Action secondaire | « Annuler » : bouton secondaire |
| Focus initial | « Annuler » (action sûre) |
| Échap | Ferme : équivalent d'« Annuler » |
| Retour du focus | Bouton « Supprimer » de la ligne de l'équipe, ou, si la ligne a disparu, le bouton « Nouvelle équipe » |
| Suite | « Supprimer l'équipe » supprime l'équipe et ses membres. Si c'était la dernière, affiche (b). |

### 6.2 Enregistrer la modification (depuis (b), en modification)

| Élément | Valeur |
|---|---|
| Titre | « Enregistrer la modification ? » |
| Texte | « Cette modification retire {prénoms} de l'équipe. » Les prénoms retirés sont listés, séparés par des virgules, sans mise en forme. |
| Action principale | « Enregistrer » : bouton principal plein |
| Action secondaire | « Revenir » : bouton secondaire |
| Focus initial | « Revenir » (action sûre) |
| Échap | Ferme : équivalent de « Revenir » ; rien n'est perdu |
| Retour du focus | « Enregistrer l'équipe » |
| Suite | « Enregistrer » enregistre et affiche (c). « Revenir » reste sur (b). |

### 6.3 Arrêter la Daily (depuis (e))

| Élément | Valeur |
|---|---|
| Titre | « Arrêter la Daily ? » |
| Texte | « La Daily sera arrêtée. Elle n'est pas conservée. » |
| Action principale | « Continuer » : bouton principal plein |
| Action secondaire | « Arrêter » : bouton secondaire destructif (texte `--color-error`) |
| Focus initial | « Continuer » |
| Échap | Ferme : équivalent de « Continuer » (la Daily reprend, le décompte repart sans perte) |
| Retour du focus | « Arrêter la Daily » sur (e) |
| Suite | « Arrêter » efface la Daily et affiche (c) de la même équipe. « Continuer » ferme et reprend. |

Le décompte est figé pendant que le dialogue est ouvert. Il reprend seulement à la fermeture par « Continuer ».

### 6.4 Quitter la Daily ? (garde de sortie, depuis (e))

| Élément | Valeur |
|---|---|
| Déclenchement | Retour arrière du navigateur, geste de retour sur mobile, ou tout changement d'écran qui ne vient pas d'un bouton de (e) |
| Titre | « Quitter la Daily ? » |
| Texte | « La Daily sera arrêtée et sa progression perdue. » |
| Action principale | « Continuer » : bouton principal plein |
| Action secondaire | « Arrêter » : bouton secondaire destructif (texte `--color-error`) |
| Focus initial | « Continuer » |
| Échap | Ferme : équivalent de « Continuer », la navigation est annulée |
| Retour du focus | Élément focalisé avant l'ouverture (le plus souvent le bouton « Suivant ») |
| Suite | « Continuer » reste sur (e) et annule la navigation. « Arrêter » efface la Daily et poursuit la navigation. |

**Implémentation (pour Amelia).** Le retour arrière n'est pas annulé par le navigateur : l'application réinsère l'entrée d'historique de (e) à « Continuer ». Le dialogue s'ouvre sur `popstate` pendant la Daily. Fermer ou recharger l'onglet n'ouvre pas ce dialogue : la reprise de S27 s'applique.

### 6.5 Confirmation sur l'arrêt : rappel de la distinction

- 6.3 vient du bouton « Arrêter la Daily ».
- 6.4 vient de la navigation.
- Les deux dialogues ont la même structure et le même texte d'arrêt. Le titre et le texte diffèrent (6.4 annonce la perte de progression).

---

## 7. Majuscule des prénoms

**Règle de rendu.** Aucun impact visuel à définir : la première lettre est déjà en majuscule dans la donnée stockée (S23, D47). Le rendu ne déclenche jamais de capitales forcées.

- `text-transform` est interdit sur tout élément qui affiche un prénom : aucune valeur `uppercase`, `capitalize` ni `full-width`. Le style explicite `text-transform: none` est posé sur les champs, les lignes de membres, les titres de dialogue, les blocs du bilan et le texte copié.
- `font-variant-caps` n'est pas utilisé sur les prénoms.
- Le prénom est affiché tel qu'il est stocké. Exemples : « Jean-pierre » (pas « JEAN-PIERRE »), « Élodie ».
- Les libellés de groupe ne sont pas en capitales, pour qu'aucun libellé ne ressemble à un prénom en majuscules.

---

## 8. Réduction des mouvements, transparence et contraste

```css
:root {
  color-scheme: light dark;

  --color-bg: #F5F5F7;
  --color-surface: #FFFFFF;
  --color-surface-sunken: #EBEBF0;
  --color-surface-pressed: #DCDCE1;
  --color-text: #1D1D1F;
  --color-text-secondary: #5E5E63;
  --color-accent: #0066CC;
  --color-accent-hover: #0058B3;
  --color-accent-pressed: #004C99;
  --color-on-fill: #FFFFFF;
  --color-success: #1E7A3A;
  --color-success-bg: #E6F4EA;
  --color-error: #C4271C;
  --color-error-bg: #FBE9E7;
  --color-destructive-fill: #C4271C;
  --color-overrun: #B3261E;
  --color-border-control: #808086;
  --color-separator: #D2D2D7;
  --color-focus: #0066CC;
  --color-scrim: rgba(29, 29, 31, 0.32);
  --color-material: rgba(255, 255, 255, 0.72);

  --shadow-group: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-raised: 0 12px 32px rgba(0, 0, 0, 0.16);
  --material-edge: rgba(255, 255, 255, 0.4);

  --space-cta-to-list: 16px;

  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --duration-press: 120ms;
  --duration-hover: 150ms;
  --duration-fast: 180ms;
  --duration-base: 240ms;
  --duration-screen: 280ms;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-bg: #1C1C1E;
    --color-surface: #2C2C2E;
    --color-surface-sunken: #3A3A3C;
    --color-surface-pressed: #48484A;
    --color-text: #F5F5F7;
    --color-text-secondary: #AEAEB2;
    --color-accent: #64B5FF;
    --color-accent-hover: #7EC2FF;
    --color-accent-pressed: #8ACBFF;
    --color-on-fill: #1C1C1E;
    --color-success: #7BD88F;
    --color-success-bg: #1E3323;
    --color-error: #FF8A80;
    --color-error-bg: #3D2421;
    --color-destructive-fill: #FF8A80;
    --color-overrun: #FF8A80;
    --color-border-control: #8E8E93;
    --color-separator: #3A3A3C;
    --color-focus: #64B5FF;
    --color-scrim: rgba(28, 28, 30, 0.6);
    --color-material: rgba(44, 44, 46, 0.72);

    --shadow-group: none;
    --shadow-raised: 0 0 0 0.5px rgba(255, 255, 255, 0.12), 0 16px 40px rgba(0, 0, 0, 0.5);
    --material-edge: rgba(255, 255, 255, 0.08);
  }
}

body {
  background: var(--color-bg);
  color: var(--color-text);
}

@media (prefers-reduced-motion: reduce) {
  :root { --duration-screen: 120ms; }
  .screen-enter, .screen-exit { transform: none !important; }
  .dialog { transform: none !important; }
}

@media (prefers-reduced-transparency: reduce) {
  .action-bar { background: var(--color-surface); backdrop-filter: none; }
}

@media (prefers-contrast: more) {
  :root { --color-border-control: var(--color-text-secondary); }
}
```

Notes d'implémentation :
- Le sélecteur `:root:not([data-theme="light"])` laisse la porte ouverte à un réglage futur sans toucher aux tokens. En V1, aucun attribut `data-theme` n'est posé (S25 : pas de bascule).
- `--color-separator` ne dépasse jamais 1,23:1 : il ne porte aucune information (les lignes sont aussi identifiées par leur texte et leur ordre).
- `prefers-contrast: more` : le filet de champ passe au texte secondaire ; le séparateur ne change pas.
- Les dialogues gardent le même comportement en `prefers-reduced-motion`.

---

## 9. Icône d'application

Fichier : `C:\Projects\daily-timer-simple\public\icon.svg` (version 2, inchangée en v3).

Fond plat `#0066CC`, glyphe blanc. Une variante sombre de l'icône n'est pas définie en V1 : l'icône d'application reste la même dans les deux thèmes (les icônes d'application ne suivent pas le thème système). [à valider]

---

## 10. Points à valider

1. **Espace sous « Nouvelle équipe »** : 16 px, défini par `--space-cta-to-list`. Sur (a), le bouton sort de la barre d'actions mobile et passe dans le flux, au-dessus de la liste (desktop et mobile). Confirmer ce déplacement.
2. **Dernier membre qui parle** : « Passer ce membre » est masqué quand aucun membre ne reste à venir. Le membre qui parle se termine par « Terminer la Daily ».
3. **Focus après « Terminer la Daily »** : le focus reste sur le même bouton, dont le libellé change. Un second Entrée peut donc terminer la Daily. Préférer une confirmation, ou déplacer le focus vers le bilan ?
4. **Dialogue de suppression d'équipe** : bouton « Supprimer l'équipe » plein et destructif, focus par défaut sur « Annuler ».
5. **Bilan** : bouton « Copier le bilan » en texte (demande du client). Sur mobile, il est au-dessus de « Retour à l'équipe », dans la barre.
6. **Couleur de dépassement en sombre** : `#FF8A80`, identique à l'erreur. Le texte distingue les deux.
7. **Texte secondaire clair** : passage de `#6E6E73` à `#5E5E63`. Changement de palette par rapport à la v2 (changelog 7).
8. **Icône d'application** : pas de variante sombre en V1.
9. Reprises des points [à valider] du brief v3, section 6, sans changement de design.

---

## 11. Skills appliquées

**impeccable (direction et qualité).**
- Interdits de la section 1 appliqués : pas de champs HTML bruts, pas de tableau de bord, pas de dégradé, pas d'emoji, pas de bordure latérale colorée (4.13).
- Un seul accent, une seule action pleine par écran (4.1, 5.0).
- Couleurs sombres sobres : fond gris teinté (`#1C1C1E`), pas de noir pur, accent désaturé, pas de néon (section 2.2).
- Texte d'aide et d'erreur sous chaque champ, lié par `aria-describedby` (4.6).
- Chiffres tabulaires pour le décompte et le bilan (3.1).
- Contrastes mesurés pour chaque couple, en clair et en sombre (2.4).

**emil-design-eng (détails et mouvement).**
- Aucune animation sur les actions au clavier (3.6, 5.5.1, 5.6).
- `transition` sur propriétés nommées, jamais `transition: all`, jamais de `scale(0)`, durées sous 300 ms (3.6).
- Courbes `ease-out` personnalisées ; le changement de libellé « Terminer la Daily » n'a pas de mouvement de position (5.5.1).
- Survol derrière `@media (hover: hover) and (pointer: fine)` (4).
- Dialogues centrés, sans `transform-origin` sur le bouton déclencheur (6.0).
- Bouton `scale(0.97)` à l'appui, retour plus lent que l'appui (4.1).
- Décompte mis à jour sur `Date.now()`, pas sur un compteur d'intervalles (4.12).

**apple-design (référence Apple).**
- Réponse instantanée à l'appui, sans attendre le relâchement (4.1, 4.5).
- Transitions interruptibles qui partent de la position courante, et chemins symétriques à l'aller et au retour (5.0, 5.6).
- Relief par la luminosité et non par l'ombre en sombre : trois niveaux de surface (2.2, 3.5).
- Matière translucide pour la barre d'actions, avec repli opaque (3.5, 4.14, 8).
- Taille, crénage et interlignage variables selon la taille de texte (3.2).
- Réduction des mouvements, transparence et contraste (8).
- Groupes en lignes séparées, pas en cartes empilées (4.11, 5.6).

---

## 12. Vérification avant livraison

- Les tokens clairs de la section 2.1 sont identiques à ceux de la section 8 (CSS).
- Tous les couples de la section 2.4 sont calculés par la formule WCAG 2.x. Les deux seuils minimaux sont : 4,68:1 en clair, 4,97:1 en sombre.
- Les captures de `docs/captures/` ne sont pas modifiées. Ce document décrit la version 3 ; les captures restent celles de la version 1.
