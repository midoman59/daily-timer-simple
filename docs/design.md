# Design : Daily Timer Simple

- Auteur : Sally, UX Designer (méthode BMAD)
- Date : 2026-11-09
- Version : 2 (remplace la version 1)
- Sources : `docs/brief.md` (version 2, cinq écrans, dix-huit stories), captures de la version 1, retour client « ne fait pas Apple-like ».
- Statut : proposition à valider avec le client. Les points marqués **[à valider]** reprennent les choix du brief.
- Périmètre : direction, tokens, typographie, composants, écrans, mouvement, clavier, icône. Aucun code dans `src/`, aucun test modifié.

---

## 0. Changelog par rapport à la version 1

| # | Changement | Raison |
|---|---|---|
| 1 | Trois écrans remplacés par **cinq** : Mes équipes (a), Création et modification (b), Présentation (c), Préparation de la Daily (d), Daily (e). | Brief version 2, section 2. |
| 2 | Champ « Durée de la Daily », son message, son composant numérique et la règle des 30 secondes **supprimés**. | Brief version 2 : l'équipe ne contient que son nom et ses membres. |
| 3 | Nouvel écran (d) : temps de parole par membre (1 à 5 min) et choix de l'ordre (équipe ou aléatoire), sans rien enregistrer. | Brief version 2, sections 2 et 3.3 à 3.4. |
| 4 | Le chronomètre démarre au clic sur « Commencer la Daily » (écran d), et non plus sur « Démarrer une Daily » (écran c). | Corrige une incohérence de la version 1 avec le brief (section 2, écran e). |
| 5 | Le bouton « Ajouter » n'est plus un gros bouton bleu plein : c'est un bouton texte avec icône « plus ». Le seul bouton plein de l'écran est l'action principale. | Retour client : trop lourd, ressemble à un formulaire. Une action principale par écran. |
| 6 | Champs : la bordure grise complète disparaît. Le champ est une ligne blanche avec un filet inférieur à 3:1 et un libellé au-dessus. | Retour client (« champs à bordure grise »). Le filet reste nécessaire pour l'identification du champ (WCAG 1.4.11). |
| 7 | Les écrans s'enchaînent en glissement horizontal (avant : à droite, retour : vers la droite) avec fondu. Plus de translation verticale. | Principe de cohérence spatiale : ce qui sort par un côté revient par le même côté. |
| 8 | Le bandeau d'erreur perd sa bordure gauche de 4 px. Il devient un bandeau complet teinté avec icône et texte. | Une bordure latérale colorée est un signe de gabarit ; l'information est portée par l'icône et le texte. |
| 9 | Appui des boutons : `scale(0.98)` devient `scale(0.97)`, en `120 ms`. | Une réponse immédiate et visible ; standard retenu. |
| 10 | Courbe de sortie `cubic-bezier(0.4, 0, 1, 1)` (ease-in) remplacée par une courbe `ease-out`. | Un ease-in retarde le premier mouvement, le moment où l'utilisateur regarde le plus. |
| 11 | Palette : gris secondaire passe de `#5C5C62` à `#6E6E73`, bleu d'accent de `#0061C2` à `#0066CC`. Fond `#F5F5F7` et surfaces blanches conservés. | Gris et bleu de référence de l'écosystème Apple. Tous les couples sont recalculés (section 2.2). |
| 12 | Barre d'actions mobile en matériau translucide (flou léger) et dialogue de confirmation en feuille centrée. | Hiérarchie par la matière ; le dialogue sert une action irréversible. |
| 13 | Typographie : échelle SF Pro (taille et crénage par taille), chronomètre en 200 à 300 de graisse. Pas de police web. | Lisibilité à grande taille et cohérence système. |
| 14 | Dépassement : libellé « Temps dépassé » et « +mm:ss » conservés, couleur `#B3261E` (6.54:1 sur blanc). | Texte d'abord, couleur ensuite. |
| 15 | Passer un membre : action « Passer » par ligne (membres à venir) et « Passer ce membre » pour celui qui parle. Statuts distincts « fait » et « passé ». | Brief sections 3.5 et S14-S15. La version 1 ne couvrait pas ces statuts. |
| 16 | Icône : contour de la tige rattaché à la couronne et à l'anneau, anneau et aiguille élargis, couleur alignée sur l'accent. Voir section 8. | L'ancienne tige flottait à 0,6 px de l'anneau à 32 px. |

---

## 1. Direction

**Une phrase.** Une application d'équipe qui se fait oublier : la page est un fond gris très clair, les informations sont des surfaces blanches, le chronomètre est le seul élément qui pèse lourd à l'écran.

**Ce qu'on évite.**
- Les champs HTML bruts : bordure grise complète, police par défaut, contour natif.
- Le formulaire générique : titre, champs empilés, gros bouton bleu au milieu.
- L'aspect tableau de bord SaaS : cartes de statistiques, barres latérales, pastilles multicolores, graphiques.
- Les dégradés, les halos, les ombres fortes, les bordures latérales colorées.
- Les emoji comme icônes. Toutes les icônes sont des SVG monochromes, trait 2 px, coins arrondis.
- Les animations sur les actions au clavier, et les animations qui ne peuvent pas être interrompues.

**Principe.** Une action principale par écran, placée au même endroit. L'écran du chronomètre n'est jamais l'écran d'entrée.

---

## 2. Tokens (thème clair uniquement)

### 2.1 Couleurs

Tous les rapports sont calculés selon la formule WCAG 2.x (luminance relative). Seuils : 4.5:1 pour le texte normal, 3:1 pour le texte grand (24 px, ou 18,66 px en gras) et les composants d'interface (WCAG 1.4.11).

| Token | Valeur | Rôle |
|---|---|---|
| `--color-bg` | `#F5F5F7` | Fond de page |
| `--color-surface` | `#FFFFFF` | Groupes de liste, champs, dialogue |
| `--color-surface-sunken` | `#EBEBF0` | Fond de survol du bouton secondaire, pastille de compteur |
| `--color-surface-pressed` | `#DCDCE1` | Fond d'appui du bouton secondaire et de l'icône |
| `--color-text` | `#1D1D1F` | Texte principal, titres, chronomètre |
| `--color-text-secondary` | `#6E6E73` | Libellés secondaires, aides, métadonnées, « passé » |
| `--color-accent` | `#0066CC` | Accent unique : bouton principal, lien, focus, « Ajouter » |
| `--color-accent-hover` | `#0058B3` | Bouton principal au survol |
| `--color-accent-pressed` | `#004C99` | Bouton principal et texte d'accent à l'appui |
| `--color-success` | `#1E7A3A` | Confirmation, statut « fait » |
| `--color-success-bg` | `#E6F4EA` | Fond du bandeau de succès |
| `--color-error` | `#C4271C` | Message d'erreur, icône, bouton « Arrêter » |
| `--color-error-bg` | `#FBE9E7` | Fond du bandeau d'erreur |
| `--color-overrun` | `#B3261E` | Chronomètre et libellé en dépassement |
| `--color-border-control` | `#808086` | Filet de champ, bordure de bouton secondaire (composant) |
| `--color-separator` | `#D2D2D7` | Séparateurs entre lignes (décoratif) |
| `--color-focus` | `#0066CC` | Anneau de focus |
| `--color-scrim` | `rgba(29, 29, 31, 0.32)` | Voile derrière le dialogue |
| `--color-material` | `rgba(255, 255, 255, 0.72)` | Barre d'actions mobile (matériau translucide) |

### 2.2 Contrastes vérifiés

| Couple texte / fond | Ratio | Verdict |
|---|---|---|
| `--color-text` sur `--color-bg` | 15,46:1 | AA et AAA |
| `--color-text` sur `--color-surface` | 16,83:1 | AA et AAA |
| `--color-text` sur `--color-surface-pressed` | 12,32:1 | AA et AAA |
| `--color-text` sur `--color-error-bg` | 14,35:1 | AA et AAA |
| `--color-text` sur `--color-success-bg` | 14,82:1 | AA et AAA |
| `--color-text-secondary` sur `--color-bg` | 4,66:1 | AA |
| `--color-text-secondary` sur `--color-surface` | 5,07:1 | AA |
| Blanc sur `--color-accent` (bouton principal) | 5,57:1 | AA |
| Blanc sur `--color-accent-hover` | 6,89:1 | AA |
| Blanc sur `--color-accent-pressed` | 8,42:1 | AA |
| `--color-accent` sur `--color-surface` (lien, secondaire, « Ajouter ») | 5,57:1 | AA |
| `--color-accent` sur `--color-bg` | 5,11:1 | AA |
| `--color-accent` sur `--color-surface-sunken` | 4,68:1 | AA |
| `--color-accent-pressed` sur `--color-surface-pressed` | 6,16:1 | AA |
| `--color-error` sur `--color-surface` | 5,75:1 | AA |
| `--color-error` sur `--color-bg` | 5,28:1 | AA |
| `--color-error` sur `--color-error-bg` | 4,90:1 | AA |
| `--color-overrun` sur `--color-surface` | 6,54:1 | AA |
| `--color-overrun` sur `--color-bg` | 6,00:1 | AA |
| `--color-overrun` sur `--color-error-bg` | 5,58:1 | AA |
| `--color-success` sur `--color-surface` | 5,38:1 | AA |
| `--color-success` sur `--color-success-bg` | 4,74:1 | AA |
| `--color-border-control` sur `--color-surface` (filet de champ) | 3,93:1 | AA composant (3:1) |
| `--color-border-control` sur `--color-bg` | 3,61:1 | AA composant (3:1) |
| `--color-focus` sur `--color-surface` et `--color-bg` | 5,57:1 et 5,11:1 | AA composant |
| `--color-separator` sur `--color-surface` | 1,51:1 | Décoratif uniquement |
| Texte désactivé `#6E6E73` sur `--color-surface-sunken` | 4,27:1 | Exempté (élément désactivé, WCAG 1.4.3) |

**Ratio minimal du texte porteur d'information : 4,66:1** (secondaire sur fond). Tous les couples porteurs d'information dépassent 4,5:1.

**Règles.** La couleur ne porte jamais seule une information.
- Erreur = icône + texte + bordure du champ.
- Dépassement = libellé « Temps dépassé » + « +mm:ss » + couleur.
- Succès = icône + texte.
- Statut d'un membre = libellé (« fait », « passé »), jamais la couleur seule.

**Retiré de la version 1 :** `--color-text-disabled` `#6E6E73` sur `#E8E8ED` (4,15:1) devient le texte secondaire ; le texte désactivé reste `--color-text-secondary` sur `--color-surface-sunken`, ce qui conserve 4,27:1.

### 2.3 États désactivés

Un élément désactivé garde son libellé visible. Son fond passe à `--color-surface-sunken`, son texte à `--color-text-secondary`, il perd son filet fort et prend `cursor: not-allowed`. Le message qui explique pourquoi reste affiché sous le composant, lié par `aria-describedby`. Un bouton désactivé reste focalisable (`aria-disabled="true"`) pour que ce message soit lu (voir 4.1).

---

## 3. Typographie, espacements, rayons, ombres, mouvement

### 3.1 Police

```
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
             "Segoe UI", system-ui, sans-serif;
```

Aucune police web chargée : pas de requête réseau, cohérent avec le fonctionnement local. Sur macOS et iOS, SF Pro ; sur Windows, Segoe UI.

Chiffres du chronomètre et des compteurs : `font-variant-numeric: tabular-nums;` (les chiffres gardent la même largeur, le décompte ne se déplace pas).

### 3.2 Échelle typographique

Principe Apple : l'interlignage et le crénage varient avec la taille. Les grands textes sont resserrés, les petits légèrement élargis.

| Token | Taille / interligne | Graisse | Crénage | Usage |
|---|---|---|---|---|
| `--type-timer` | `clamp(72px, 18vw, 184px)` / 1 | 300 | -0,02 em | Décompte « mm:ss » (écran e) |
| `--type-large-title` | 34 px / 41 px | 600 | -0,015 em | Titre d'écran (« Mes équipes », nom d'équipe) |
| `--type-title-2` | 22 px / 28 px | 600 | -0,01 em | Titres de section, titre de dialogue |
| `--type-body` | 17 px / 24 px | 400 | 0 | Texte courant, champs, nom de membre |
| `--type-body-strong` | 17 px / 24 px | 600 | 0 | Libellé de champ, bouton principal |
| `--type-callout` | 15 px / 20 px | 400 | 0 | Messages d'erreur et d'aide, métadonnées |
| `--type-footnote` | 13 px / 18 px | 500 | +0,01 em | Libellés de groupe en capitales légères, numéro d'ordre |

Mobile sous 600 px : `--type-large-title` passe à 28 px / 34 px. Les champs restent à 17 px minimum (pas de zoom automatique sur iOS). Espacements en `rem` ou `px` selon la section 3.3 ; le texte peut être agrandi sans casser la mise en page.

### 3.3 Espacements (base 4 px)

| Token | Valeur | Usage type |
|---|---|---|
| `--space-1` | 4 px | Icône et texte |
| `--space-2` | 8 px | Entre une ligne et son bouton |
| `--space-3` | 12 px | Entre un champ et son message |
| `--space-4` | 16 px | Marge latérale mobile, entre éléments liés |
| `--space-5` | 24 px | Entre deux groupes d'un écran |
| `--space-6` | 32 px | Marge haute des titres d'écran (mobile) |
| `--space-7` | 48 px | Marge interne du groupe (desktop) |
| `--space-8` | 64 px | Respiration haut de page (desktop) |

Marge latérale : 16 px sur mobile, sans exception. Largeur maximale de colonne : 560 px. Hauteur de ligne de liste : 52 px minimum.

### 3.4 Rayons

| Token | Valeur | Usage |
|---|---|---|
| `--radius-control` | 12 px | Champs, boutons secondaires, bouton icône |
| `--radius-group` | 14 px | Groupes de liste (style réglages), dialogue |
| `--radius-capsule` | 999 px | Boutons principaux et secondaires, compteur, segments |

### 3.5 Ombres et matériaux

| Token | Valeur | Usage |
|---|---|---|
| `--shadow-group` | `0 1px 2px rgba(0,0,0,0.04)` | Groupe de liste sur le fond gris (presque invisible, pour le relief) |
| `--shadow-raised` | `0 12px 32px rgba(0,0,0,0.16)` | Dialogue de confirmation |
| `--shadow-focus` | `0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-focus)` | Anneau de focus clavier |
| `--material-blur` | `blur(20px) saturate(180%)` | Barre d'actions mobile |

Le matériau translucide ne se superpose jamais à un autre matériau. En `prefers-reduced-transparency: reduce`, la barre devient `--color-surface` opaque et sans flou.

### 3.6 Mouvement

| Token | Valeur |
|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` : entrées, retours immédiats |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` : dialogue, feuille, changement d'écran |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` : changements de couleur et de fond |
| `--duration-press` | 120 ms |
| `--duration-hover` | 150 ms |
| `--duration-fast` | 180 ms |
| `--duration-base` | 240 ms |
| `--duration-screen` | 280 ms (glissement d'écran, sous 300 ms) |

Règles :
- Aucune animation au-delà de 300 ms sur un élément d'interface.
- Les animations sont des `transition` (pas de `@keyframes`) sur des propriétés nommées (`transform`, `opacity`, `background-color`). Jamais `transition: all`.
- Aucun `scale(0)` : les éléments apparaissent de `scale(0.96)` avec `opacity: 0`, ou de `translateX(±24px)` pour un écran.
- Aucune animation pour les actions déclenchées au clavier (Entrée pour ajouter un membre, Échap, Tab).
- Le chronomètre ne s'anime pas : le chiffre change, il ne glisse pas.
- Le mouvement est interruptible : une transition part de la valeur en cours, jamais de la cible.

---

## 4. Composants et états

Chaque composant décrit : repos, survol (`@media (hover: hover) and (pointer: fine)` uniquement), focus clavier (`:focus-visible`), appui (`:active`, instantané), désactivé (`disabled` ou `aria-disabled="true"`).

Règle commune de focus : anneau `--shadow-focus` au clavier uniquement. Aucune suppression de contour sans remplacement.

Zone cliquable minimale : 44 × 44 px, y compris le bouton icône « Supprimer ».

### 4.1 Bouton principal

- Forme : capsule `--radius-capsule`, hauteur 52 px, padding horizontal 28 px, largeur minimale 160 px ; pleine largeur sur mobile.
- Style : fond `--color-accent`, texte blanc `--type-body-strong`.
- Repos : fond `--color-accent`.
- Survol : fond `--color-accent-hover`.
- Focus clavier : `--shadow-focus`.
- Appui : fond `--color-accent-pressed`, `transform: scale(0.97)` en `120 ms` `--ease-out`. Le retour au repos est plus lent que l'appui, pour que l'appui se sente.
- Désactivé : fond `--color-surface-sunken`, texte `--color-text-secondary`, pas de survol ni d'appui.
- Libellés : « Enregistrer l'équipe », « Démarrer une Daily », « Commencer la Daily », « Passer au suivant » / « Terminer la Daily », « Continuer » (dialogue), « Nouvelle équipe ».
- Par écran : **un seul** bouton principal plein, à la même position dans le flux.

### 4.2 Bouton secondaire

- Forme : capsule, hauteur 52 px, padding horizontal 24 px.
- Style : fond `--color-surface`, bordure 1 px `--color-border-control`, texte `--color-accent`, `--type-body-strong`.
- Survol : fond `--color-surface-sunken`.
- Focus clavier : `--shadow-focus`.
- Appui : fond `--color-surface-pressed`, texte `--color-accent-pressed` (6,16:1).
- Désactivé : bordure `--color-separator`, texte `--color-text-secondary`.
- Libellés : « Modifier l'équipe ».
- Variante destructive : texte `--color-error` (« Arrêter la Daily » dans le bouton de la Daily, « Arrêter » du dialogue).

### 4.3 Lien d'action (« Annuler », « Mes équipes »)

- Texte seul, `--type-body`, couleur `--color-accent`. Avec icône chevron pour le retour (`‹ Mes équipes`).
- Zone cliquable 44 px de haut minimum.
- Survol : soulignement. Focus : `--shadow-focus` avec rayon 8 px.

### 4.4 Bouton « Ajouter » (texte avec icône)

- Icône « plus » SVG 20 px et libellé « Ajouter », texte `--color-accent`, `--type-body-strong`, dans une zone de 44 px.
- Pas de fond plein, pas de bordure. Il ne concurrence pas le bouton principal.
- Désactivé (champ vide) : couleur `--color-text-secondary`, pas d'interaction. Le message « Saisissez un prénom. » n'apparaît qu'après une tentative.

### 4.5 Bouton icône

- Forme : cercle 44 × 44 px, icône SVG 20 px, trait 2 px, couleur `--color-text-secondary`.
- Repos : fond transparent.
- Survol : fond `--color-surface-sunken`, icône `--color-text`.
- Appui : fond `--color-surface-pressed`, icône `--color-text` (12,32:1 sur ce fond).
- Focus : `--shadow-focus`.
- Désactivé : icône `--color-text-secondary` à 50 % d'opacité, pas d'interaction.
- `aria-label` explicite (« Supprimer Thomas »), `title` au survol pour les souris.

### 4.6 Champ de texte

- Structure : libellé visible au-dessus (`--type-body-strong`, `--color-text`), champ, aide ou erreur dessous. Le placeholder ne remplace jamais le libellé.
- Champ : hauteur 52 px, padding 12 px 0 (le champ est une ligne dans un groupe blanc), texte `--type-body` 17 px.
- Identification : filet inférieur 1 px `--color-border-control` (3,93:1 sur blanc), pour que le champ soit identifiable sans bordure complète.
- Survol : filet `--color-text-secondary`.
- Focus clavier : filet 2 px `--color-focus` et `--shadow-focus` sur la ligne. Le contour natif est retiré et remplacé.
- Erreur : filet 2 px `--color-error`, icône d'alerte SVG 16 px à droite du champ, `aria-invalid="true"`.
- Désactivé : texte `--color-text-secondary`, filet pointillé `--color-separator`, `disabled`.

Message d'erreur ou d'aide sous le champ :
- `<p id="{champ}-erreur">` avec icône SVG 16 px `aria-hidden` et texte `--type-callout` `--color-error`.
- Le champ porte `aria-describedby="{champ}-aide {champ}-erreur"` (l'aide puis l'erreur). Sans erreur, seul `{champ}-aide` est référencé.
- Le message apparaît au blur ou à la tentative d'enregistrement, jamais pendant la frappe d'un caractère valide.
- Apparition : fondu et translation de 4 px, `--duration-base`, `--ease-out`. Pas d'apparition si l'utilisateur a réduit les mouvements (fondu seul).

Champs concernés : « Nom d'équipe » (« Donnez un nom à votre équipe. ») ; « Prénom » (« Saisissez un prénom. », « Ce prénom existe déjà dans l'équipe. », « Une équipe ne peut pas dépasser 15 membres. », « Le prénom ne dépasse pas 30 caractères. »).

### 4.7 Sélecteur de temps (1 à 5 min par membre)

- Élément : `<select>` natif stylé en capsule : texte « 2 min » et chevron SVG, hauteur 44 px, fond `--color-surface-sunken`, pas de bordure, `--type-body`.
- Pourquoi un `<select>` natif : le brief le prévoit ; il garantit le clavier, les lecteurs d'écran et le sélecteur natif du téléphone (roulette iOS). Le choix d'un stepper « − 2 min + » a été écarté : il rend la valeur hors bornes impossible, ce qui retire le message d'erreur exigé par le brief.
- Options : « 1 min », « 2 min », « 3 min », « 4 min », « 5 min ».
- Repos : fond `--color-surface-sunken`. Survol : fond `--color-surface-pressed`.
- Focus clavier : `--shadow-focus`.
- Valeur absente ou hors bornes : capsule à contour `--color-error`, message sous la ligne du membre (« Choisissez une durée entre 1 et 5 minutes. »), lié par `aria-describedby`, bouton « Commencer la Daily » désactivé.
- Option « Appliquer à tous » [à valider] : bouton secondaire compact au-dessus du groupe, il applique la valeur du premier membre à tous.

### 4.8 Choix de l'ordre de passage

- Contrôle segmenté iOS : deux segments « Ordre de l'équipe » et « Ordre aléatoire » dans une capsule `--color-surface-sunken`, hauteur 36 px (zone de 44 px par segment via `padding`).
- Segment actif : fond `--color-surface`, ombre `--shadow-group`, texte `--color-text`, `--type-body-strong`. Segment inactif : texte `--color-text-secondary`.
- Sémantique : `role="radiogroup"` avec deux `<input type="radio">` masqués visuellement et étiquetés par leur segment. Flèches gauche et droite changent de choix.
- Transition du segment actif : `transform` 240 ms `--ease-drawer` (le fond glisse vers le segment choisi). Au clavier, le changement est instantané (règle emil : pas d'animation sur les actions clavier).
- Défaut « Ordre de l'équipe » [à valider].

### 4.9 Ligne de membre avec action « Passer »

- Ligne : hauteur minimale 52 px, padding 12 px 8 px 12 px 16 px, séparateur 1 px `--color-separator` (retrait de 16 px à gauche, comme les réglages).
- Contenu : numéro d'ordre (`--type-footnote`, `--color-text-secondary`, `tabular-nums`, largeur fixe 24 px), prénom (`--type-body`, `--color-text`), à droite l'action.
- Action « Passer » (écran e, membres à venir) : bouton texte `--color-accent`, `--type-callout`, zone 44 px de haut, libellé complet « Passer » avec `aria-label="Passer Thomas"`.
- Statut « fait » (membre quitté) : icône coche SVG 16 px `--color-success` et libellé « fait » en `--color-text-secondary`. Pas d'action.
- Statut « passé » : icône barre oblique SVG 16 px `--color-text-secondary` et libellé « passé ». Pas d'action. Le nom reste en `--color-text-secondary`.
- Membre courant : fond `--color-surface-sunken`, prénom en `--type-body-strong`, indicateur « En cours » en `--type-footnote` `--color-accent`. Pas de bouton « Passer » sur la ligne (l'action est dans la zone principale).
- Repos, survol de ligne (`#F9F9FB`, au pointeur fin uniquement).
- Lecture par lecteur d'écran : liste `<ol>`, chaque statut est dans le texte de la ligne (« Thomas, fait »).

### 4.10 Compteur de membres

- Pastille capsule, fond `--color-surface-sunken`, texte `--type-callout` `--color-text-secondary`, hauteur 28 px, `tabular-nums`.
- Libellés : « 0 membre », « 1 membre », « 2 membres »…
- Maximum 15 : texte `--color-text`, pastille contour `--color-border-control`.
- `role="status"` et `aria-live="polite"`. L'annonce n'a lieu qu'au changement de valeur.

### 4.11 Carte d'équipe (écran c)

Il n'y a pas de carte à proprement parler : la présentation est un groupe blanc (style réglages), comme le reste des listes. Contenu dans l'ordre : nom d'équipe (`<h1>`), ligne de métadonnées (« 4 membres » en `--type-callout` `--color-text-secondary`), séparateur, liste des membres en lecture seule (4.9 sans action, numéros d'ordre visibles).

### 4.12 Chronomètre grand format (écran e)

- Décompte : `--type-timer`, poids 300, `tabular-nums`, couleur `--color-text`, centré.
- Élément : `<p role="timer" aria-label="Temps restant pour Thomas">`. `aria-live` reste `off`. Les seules annonces sont : démarrage, dépassement (« Temps dépassé », une seule fois) et arrêt, dans une zone `role="status"` masquée visuellement.
- Prénom du membre courant au-dessus du décompte, `--type-title-2`, `--color-text`.
- Temps prévu sous le décompte : « Temps prévu : 2:00 », `--type-body`, `--color-text-secondary`.
- En dépassement : décompte `--color-overrun`, libellé « Temps dépassé » au-dessus (`--type-title-2`, `--color-overrun`), « +mm:ss » sous le décompte (`--type-title-2`). La transition de couleur dure 240 ms.
- Mise à jour : au moins une fois par seconde, calculée sur l'horloge système (`Date.now()`), jamais sur un simple compteur d'intervalles, pour éviter la dérive.
- Après la durée [à valider] : le décompte continue et passe en « +mm:ss ».

### 4.13 Dialogue de confirmation d'arrêt [à valider]

- Déclenché par « Arrêter la Daily ». Recommandé : confirmation, car l'arrêt interrompt la réunion.
- Forme : carte `--color-surface`, `--radius-group`, `--shadow-raised`, largeur 320 px (maximum 360), centrée, voile `--color-scrim`.
- Titre `--type-title-2` : « Arrêter la Daily ? ». Texte `--type-body` : « Le chronomètre s'arrêtera. Aucune Daily ne sera enregistrée. »
- Boutons côte à côte, pleine largeur chacun : « Continuer » (bouton principal, à droite) et « Arrêter » (secondaire, texte `--color-error`, à gauche). En dessous de 340 px : empilés, « Continuer » en premier.
- `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`. Focus initial sur « Continuer ». Tab circule entre les deux boutons. Échap = « Continuer ». À la fermeture, le focus revient sur « Arrêter la Daily ».
- Apparition : voile en fondu 160 ms ; carte en `scale(0.96)` vers 1 et fondu, 240 ms `--ease-drawer`. Disparition plus rapide (160 ms).
- Ce dialogue est centré : il n'est pas ancré à son bouton, donc pas de `transform-origin` sur le bouton (règle emil : les modales restent centrées).

### 4.14 Bandeau

- Forme : bloc pleine largeur de la colonne, `--radius-control`, fond `--color-error-bg` (ou `--color-success-bg`), padding 12 px 16 px, icône SVG 20 px, texte `--type-callout` `--color-text`.
- Pas de bordure latérale colorée.
- Contenu : une phrase. Un lien d'action est optionnel (« Recréer l'équipe »).
- Placement : sous le titre d'écran.
- Accessibilité : `role="alert"` pour une erreur qui suit une action ; `role="status"` pour un succès ou un état.
- Apparition : fondu et translation de 4 px, 240 ms `--ease-out`.
- Usages : « Les données de l'équipe sont illisibles. Recréez l'équipe. » [à valider] ; succès « Équipe enregistrée. » (en pied de l'écran c, 3 s).

### 4.15 Barre d'actions (mobile)

- Barre fixe en bas, `--color-material`, `--material-blur`, bord supérieur 1 px `rgba(255,255,255,0.4)` (la lumière qui frappe le matériau), `padding-bottom: env(safe-area-inset-bottom)`.
- Contient le bouton principal pleine largeur, et le bouton secondaire ou le lien au-dessus ou à côté selon la largeur.
- Apparaît avec le contenu qu'elle sert : pas d'animation d'entrée au chargement.
- Le contenu défilant passe sous la barre ; une marge basse de 96 px évite de masquer le dernier élément.

---

## 5. Les cinq écrans

### 5.0 Règles communes

- Une action principale par écran, placée au même endroit (en bas sur mobile, en bas du contenu sur desktop).
- Desktop (768 px et plus) : colonne centrée de 560 px sur fond `--color-bg`. Groupes blancs. Pas de carte autour de la colonne.
- Mobile (320 à 767 px) : colonne pleine largeur, marge 16 px, barre d'actions fixe en bas (4.15).
- À 320 px : aucun défilement horizontal ; les libellés longs passent à la ligne ; le chronomètre se réduit par le `clamp`.
- Titre d'écran : `<h1>` en `--type-large-title`. Marge haute 32 px (desktop), 24 px (mobile).
- Bouton « retour » : lien avec chevron en haut à gauche (`‹ Mes équipes`), pas d'icône de menu.
- Pas de dégradé de fond, pas de barre latérale, pas de navigation par onglets.

### 5.1 Écran (a) : Mes équipes

**But :** voir les équipes, en ouvrir une ou en créer une.

**Ordre des éléments :**
1. `<h1>` « Mes équipes ». Sur desktop, le bouton « Nouvelle équipe » est à droite du titre, en bouton principal.
2. Groupe de liste : une ligne par équipe, triée par ordre alphabétique [à valider]. Chaque ligne : nom d'équipe (`--type-body-strong`), « N membres » (`--type-callout` `--color-text-secondary`), bouton secondaire compact « Ouvrir » à droite (44 px).
3. Mobile : barre d'actions avec « Nouvelle équipe » (principal pleine largeur).

**Desktop :** groupe de 560 px ; lignes de 60 px.
**Mobile :** groupe pleine largeur ; barre d'actions en bas.

**Transitions :** « Ouvrir » → écran (c) par glissement vers la gauche. « Nouvelle équipe » → écran (b) par glissement vers la gauche.

**Clavier :** Tab parcourt les boutons « Ouvrir » dans l'ordre de la liste, puis « Nouvelle équipe ». Une ligne n'est pas cliquable en entier : seul « Ouvrir » l'est (lisibilité et clavier).

### 5.2 Écran (b) : Création et modification d'équipe

**But :** saisir l'équipe une fois, ou la corriger.

**Ordre des éléments :**
1. Bouton retour « ‹ Mes équipes » (en modification seulement ; en création, le lien « Annuler » n'apparaît que si une équipe existe [à valider]).
2. `<h1>` : « Nouvelle équipe » ou « Modifier l'équipe ».
3. Groupe « Équipe » : champ « Nom d'équipe » (4.6, 50 caractères max).
4. Libellé de groupe « Membres » (`--type-footnote`, capitales légères) avec compteur (4.10) à droite.
5. Groupe « Ajouter un membre » : champ « Prénom » (4.6, 30 caractères max) et bouton « Ajouter » (4.4) à droite. Sur mobile, le bouton passe sous le champ, pleine largeur, mais reste un bouton texte. Entrée dans le champ ajoute le membre.
6. Message d'aide ou de maximum sous le groupe.
7. Groupe de la liste des membres (4.9 sans action « Passer » ; bouton icône « Supprimer » à droite de chaque ligne) ou texte d'état vide « Aucun membre pour l'instant. ».
8. Zone d'actions : bouton principal « Enregistrer l'équipe » ; lien « Annuler » à gauche du principal sur desktop, au-dessus sur mobile (en barre d'actions).

**Desktop :** groupe « Équipe » et groupe « Ajouter » en colonne ; le bouton « Ajouter » est à droite du champ Prénom.
**Mobile :** champs empilés pleine largeur ; liste au-dessus de la barre d'actions.

**États :**
- *Vide (aucun membre) :* compteur « 0 membre », texte d'aide « Ajoutez au moins 2 membres pour continuer. », « Enregistrer l'équipe » désactivé.
- *Ajout d'un membre :* la ligne est ajoutée en fin de liste sans animation si l'ajout vient du clavier (Entrée). Si l'ajout vient d'un clic, la ligne apparaît en fondu de 180 ms. Le champ Prénom se vide et reprend le focus.
- *Erreur de champ :* message sous le champ (4.6), filet d'erreur. À l'enregistrement, le focus va sur le premier champ en erreur, dans l'ordre de l'écran.
- *Maximum atteint (15) :* champ Prénom désactivé avec « Une équipe ne peut pas dépasser 15 membres. », bouton « Ajouter » désactivé.
- *Enregistré :* transition vers l'écran (c) avec le nom et les membres.

**Bouton « Enregistrer l'équipe » désactivé (S5) :** désactivé si le nom est vide ou s'il y a moins de 2 membres. Il reste focalisable (`aria-disabled`). Au clic ou à Entrée sur ce bouton, le focus va sur le premier champ fautif et le message s'affiche.

**Suppression de membre :** la ligne se referme en hauteur (160 ms `--ease-out`), puis disparaît. Les numéros suivants se recalculent. Le focus passe au bouton « Supprimer » de la ligne suivante, sinon au champ Prénom. Le focus ne se perd jamais dans le vide.

**Modification :** lien « Annuler » sans enregistrer ; Échap équivaut à « Annuler » en modification seulement. Enregistrer un changement met à jour l'écran (c) et la liste (a) ; la mise à jour se fait par un fondu de 160 ms, sans glissement.

**Écran de modification : remplacement [à valider].** Confirmation avant écrasement si le nom ou les membres changent de manière importante ; à voir avec le client (brief, question 2).

### 5.3 Écran (c) : Présentation de l'équipe

**But :** vérifier l'équipe et lancer une Daily.

**Ordre des éléments :**
1. Bouton retour « ‹ Mes équipes ».
2. `<h1>` : nom de l'équipe.
3. Groupe présentation (4.11) : nombre de membres, liste ordonnée des membres dans l'ordre de saisie.
4. Message d'état sous le groupe si moins de 2 membres : « Ajoutez au moins 2 membres pour démarrer. », lié au bouton par `aria-describedby`.
5. Zone d'actions : bouton principal « Démarrer une Daily » (désactivé si moins de 2 membres) ; bouton secondaire « Modifier l'équipe ».

**Desktop :** groupe de 560 px ; zone d'actions alignée à droite, secondaire à gauche, principal à droite (même ordre DOM que visuel, voir 5.6).
**Mobile :** barre d'actions : principal pleine largeur, secondaire au-dessus.

**États :**
- *Équipe complète :* bouton principal actif.
- *Équipe incomplète :* bouton principal désactivé, message d'état affiché ; « Modifier l'équipe » reste actif.
- *Données illisibles :* retour à l'écran (b) avec le bandeau 4.14 « Les données de l'équipe sont illisibles. Recréez l'équipe. » [à valider].

**Transitions :** « Démarrer une Daily » → écran (d) par glissement vers la gauche. « Modifier » → écran (b) par glissement vers la gauche. Retour à Mes équipes : glissement vers la droite.

### 5.4 Écran (d) : Préparation de la Daily

**But :** choisir pour cette Daily le temps de parole de chaque membre et l'ordre de passage. Rien n'est enregistré.

**Ordre des éléments :**
1. Bouton retour « ‹ Présentation » (ou lien « Annuler »).
2. `<h1>` « Préparer la Daily » ; sous le titre, nom d'équipe en `--type-callout` `--color-text-secondary`.
3. Libellé de groupe « Temps de parole » (footnote). Groupe : une ligne par membre (4.9 sans action) avec le sélecteur 4.7 à droite. Option « Appliquer à tous » [à valider] au-dessus du groupe.
4. Libellé de groupe « Ordre de passage ». Contrôle segmenté 4.8 : « Ordre de l'équipe » | « Ordre aléatoire ». Texte d'aide sous le contrôle : « Pour cette Daily seulement. L'ordre de l'équipe ne change pas. ».
5. Zone d'actions : bouton principal « Commencer la Daily » ; lien « Annuler » (retour à l'écran c, sans rien lancer).

**Desktop :** groupe de 560 px ; zone d'actions alignée à droite.
**Mobile :** barre d'actions : « Commencer la Daily » pleine largeur, « Annuler » au-dessus.

**États :**
- *Pré-rempli :* chaque membre à 2 minutes [à valider] ; « Ordre de l'équipe » sélectionné [à valider].
- *Erreur :* une valeur absente ou hors bornes : sélecteur à contour d'erreur, message sous la ligne du membre (4.7), « Commencer la Daily » désactivé, focus sur le premier membre fautif à la tentative.
- *Succès :* « Commencer la Daily » → écran (e). Le tirage aléatoire, s'il est choisi, a lieu à ce moment-là.

### 5.5 Écran (e) : Daily (chronomètre)

**But :** suivre le temps du membre courant, passer les membres.

**Ordre des éléments (mobile) :**
1. En-tête discret : nom d'équipe (`--type-callout` `--color-text-secondary`) et mode d'ordre (« Ordre de l'équipe » ou « Ordre aléatoire »).
2. Prénom du membre courant (`--type-title-2`).
3. Libellé « Temps dépassé » (réserve son espace, invisible tant que le décompte est positif).
4. Décompte `mm:ss` (4.12), le plus grand élément de l'écran.
5. Temps prévu « Temps prévu : 2:00 », ou « +mm:ss » en dépassement.
6. Bouton secondaire « Passer ce membre » (membre courant) — hors barre.
7. Groupe de la liste de passage (4.9), ordre de passage, défilable.
8. Barre d'actions fixe : principal « Passer au suivant » (ou « Terminer la Daily » au dernier membre [à valider]) ; lien destructif « Arrêter la Daily » sous le principal.

**Desktop :** décompte centré dans la fenêtre. Liste de passage en colonne droite de 260 px, défilable. « Arrêter la Daily » en bas à gauche, secondaire.

**Comportement :**
- Le chronomètre démarre au clic sur « Commencer la Daily » (écran d). Il ne démarre jamais à l'ouverture de l'écran (e) ni au rechargement.
- « Passer au suivant » : la parole passe au membre suivant selon l'ordre choisi ; le décompte repart du temps alloué à ce membre ; le membre quitté passe en « fait ».
- « Passer ce membre » (membre courant) : passage immédiat au suivant avec son temps ; le membre passe en « passé ».
- « Passer » sur une ligne (membre à venir) [à valider] : le membre passe en « passé », sans temps, et ne revient pas dans la Daily.
- Le temps non utilisé n'est pas reporté [à valider].
- Au dernier membre, « Passer au suivant » devient « Terminer la Daily », qui ramène à l'écran (c) [à valider].
- Le focus arrive sur le titre (prénom) au chargement. Jamais sur « Arrêter la Daily », pour éviter un arrêt accidentel par Entrée.

**États :**
- *En cours :* décompte `--color-text`.
- *Dépassement :* décompte et libellé en `--color-overrun`, « Temps dépassé », « +mm:ss ». Le décompte continue [à valider].
- *Arrêtée :* clic sur « Arrêter la Daily » → dialogue 4.13 [à valider] → écran (c) de la même équipe. Aucune Daily n'est enregistrée [à valider].
- Aucune pause, aucun choix de membre, aucun raccourci clavier global (pas d'Espace qui interromprait le décompte).

**Transitions :** arrivée depuis (d) : glissement vers la gauche, 280 ms. Sortie vers (c) : glissement vers la droite. Le changement de membre courant ne fait pas de transition sur le décompte ; seule la mise en évidence de la ligne change (fond en 240 ms `--ease-standard`).

### 5.6 Transitions entre écrans et clavier

**Transitions :**
- Avance (une étape dans le parcours) : l'écran sortant glisse de 24 px vers la gauche et s'estompe ; l'écran entrant arrive de 24 px depuis la droite, fondu. Durée 280 ms `--ease-drawer`.
- Retour : le mouvement est inversé (le sortant part vers la droite, l'entrant arrive de la gauche). Le chemin de retour est le même que le chemin d'aller, comme le recommande la cohérence spatiale.
- Chargement initial : contenu en fondu seul, 240 ms `--ease-out`, sans translation.
- Interruption : un clic arrière pendant une transition inverse la transition en cours depuis sa position actuelle (les transitions CSS le permettent).
- Après changement d'écran, le focus va sur le `<h1>` du nouvel écran (`tabindex="-1"`, sans contour visible) pour que l'annonce soit lue.

**Clavier :**
- Ordre de tabulation = ordre visuel. Aucun `tabindex` positif.
- Écran (b) : nom → prénom → « Ajouter » → « Supprimer » de chaque ligne (dans l'ordre) → « Annuler » → « Enregistrer l'équipe ».
- Entrée dans le champ Prénom : ajoute le membre (sans animation). Entrée sur les autres champs : sans effet (jamais d'enregistrement par Entrée depuis un champ de texte [à valider]).
- Échap : en modification, équivalent d'« Annuler ». En création, sans effet.
- Écran (c) : Tab sur « Modifier l'équipe » puis « Démarrer une Daily » ; l'ordre DOM suit l'ordre visuel (secondaire à gauche sur desktop, donc en premier dans le DOM).
- Écran (e) : Tab sur les boutons « Passer » des lignes, puis « Passer ce membre », « Passer au suivant », « Arrêter la Daily ».
- Dialogue 4.13 : focus initial sur « Continuer » ; Tab circule entre « Continuer » et « Arrêter » ; Échap = « Continuer ».

---

## 6. Ce qui rend cela Apple-like

Huit décisions concrètes, vérifiables sur l'écran.

1. **Hiérarchie typographique à trois niveaux.** Titre en `--type-large-title` (34 px, 600, crénage serré), corps à 17 px, métadonnées à 15 px en gris. On vérifie : un seul titre par écran, et le chronomètre est le seul élément au-dessus de 72 px.
2. **Groupes en lignes séparées, pas en cartes empilées.** Les listes sont des groupes blancs sur fond gris, avec séparateurs retirés de 16 px à gauche, comme les réglages iOS. On vérifie : aucune carte n'est posée dans une autre carte.
3. **Une seule action pleine par écran.** Le bouton plein `--color-accent` est unique, à la même position. Les autres actions sont texte ou contour. On vérifie : un bouton plein par écran (le dialogue est une exception : son principal est plein).
4. **Champs identifiés par un filet, pas par une boîte.** Le champ est une ligne de groupe ; le filet passe à 2 px en focus. On vérifie : en focus clavier, le filet et l'anneau sont visibles sans changement de forme.
5. **Retour à l'appui instantané et continu.** `scale(0.97)` dès `:active`, sans attendre le relâchement ; le retour est plus lent que l'appui. On vérifie : l'appui se voit à 120 ms, le relâchement dure 160 ms.
6. **Transitions interruptibles, cohérentes dans l'espace.** Glissement horizontal, mêmes chemins à l'aller et au retour, transitions CSS qui repartent de la position courante. On vérifie : un retour rapide pendant une transition ne saute pas.
7. **Matière pour la barre d'actions.** Barre translucide avec flou et bord lumineux de 1 px : la liste défile dessous. On vérifie : le contenu est visible sous la barre, et la version « transparence réduite » est opaque.
8. **Chiffres qui ne bougent pas.** Décompte en chiffres tabulaires, sans animation, mis à jour par l'horloge système. On vérifie : aucune largeur de chiffre ne change pendant le décompte.

Autres règles de finition, moins visibles mais citées : aucune animation sur les actions clavier ; une marge de 16 px ; une courbe `ease-out` partout ; aucun `transition: all`.

---

## 7. Ce que j'ai retiré de la version 1, et pourquoi

| Retiré | Pourquoi |
|---|---|
| Champ « Durée de la Daily » et ses messages (durée, 30 secondes par membre, bornes 1 à 120) | Brief version 2 : la durée n'est plus une propriété de l'équipe. |
| Composant « Champ numérique (durée) » et suffixe « min » | Plus de champ de durée dans l'équipe. Le temps par membre utilise le sélecteur 4.7. |
| Carte d'équipe avec « durée prévue 15 min » | Plus de durée d'équipe. |
| Écran 3 « Chronomètre » démarrant au clic « Démarrer une Daily » | Le démarrage est au clic « Commencer la Daily » (brief, écran e). |
| Bordure grise complète de champ | Retour client. Remplacée par le filet inférieur (4.6). |
| Bouton « Ajouter » plein bleu | Retour client. Remplacé par un bouton texte avec icône (4.4). |
| Bordure latérale de 4 px du bandeau d'erreur | Gabarit visuel ; l'icône et le texte suffisent (4.14). |
| Translation verticale de 8 px à chaque écran | Remplacée par un glissement horizontal, plus cohérent avec la navigation. |
| Courbe `ease-in` de sortie | Retarde le premier mouvement (principe ease-out). |
| `scale(0.98)` à l'appui | Remplacé par `scale(0.97)`. |
| Couleur `--color-text-disabled` `#6E6E73` sur `#E8E8ED` | Contraste trop faible (4,15:1) pour un texte. Le désactivé utilise le texte secondaire sur `--color-surface-sunken`. |
| Icône tige flottante, couleur `#0061C2` | Voir section 8. |

---

## 8. Icône d'application

Fichier : `C:\Projects\daily-timer-simple\public\icon.svg` (corrigé dans cette version).

**Ce qui a changé.**
- Couleur de fond : `#0061C2` devient `#0066CC`, l'accent de la nouvelle palette.
- Rayon du carré : 112 devient 114, soit environ 22 % de la taille, proche de l'arrondi des icônes d'application Apple.
- Tige : elle était séparée de l'anneau par un écart de 10 unités, soit moins d'un pixel à 32 px, ce qui la rendait floue. Elle est maintenant rattachée à la couronne et à l'anneau.
- Couronne élargie (68 × 40 au lieu de 60 × 36) et anneau de 42 unités au lieu de 40, pour rester lisible à 32 px.
- Centre de l'horloge remonté de 2 unités : le glyphe est centré verticalement (de y = 50 à y = 463, centre 256).

**Vérification.** Rendu à 256 px et à 32 px avec ImageMagick (`magick`) : les trois repères (couronne, anneau, aiguille) restent distincts à 32 px. Un rendu final dans le navigateur reste à faire une fois l'application installée.

Fond plat, pas de dégradé. Glyphe blanc.

---

## 9. Skills appliquées

**impeccable (critique et direction).**
- Interdits de la section 1 appliqués : pas de champs HTML bruts, pas de tableau de bord, pas de dégradé, pas d'emoji, pas de bordure latérale colorée (4.14).
- Un seul accent, une seule action pleine par écran (4.1, 6.3).
- Texte d'aide et d'erreur sous chaque champ, lié par `aria-describedby` (4.6).
- Icônes SVG monochromes cohérentes (trait 2 px).

**emil-design-eng (détails et mouvement).**
- Aucune animation sur les actions au clavier (5.2, 5.6).
- `transition` par propriété, jamais `transition: all`, jamais de `scale(0)`, durées sous 300 ms (3.6).
- Courbes `ease-out` personnalisées ; retrait du `ease-in` de sortie (changelog 10).
- Survol gardé derrière `@media (hover: hover) and (pointer: fine)` (4).
- Dialogue centré, sans `transform-origin` sur le bouton déclencheur (4.13).
- Bouton `scale(0.97)` à l'appui, retour plus lent que l'appui (4.1).

**apple-design (référence Apple).**
- Réponse instantanée à l'appui, sans attendre le relâchement (4.1, 6.5).
- Transitions interruptibles qui partent de la position courante, et chemins symétriques (5.6, 6.6).
- Matière translucide pour la barre d'actions, avec repli opaque (3.5, 4.15, 6.7).
- Taille, crénage et interlignage variables selon la taille de texte (3.2).
- Réduction des mouvements : voir 10.

---

## 10. Réduction des mouvements et transparence

- `prefers-reduced-motion: reduce` : aucun glissement ni translation. Les écrans changent par fondu de 120 ms. Le dialogue apparaît par fondu. Le changement de couleur du dépassement reste (il n'est pas un mouvement).
- `prefers-reduced-transparency: reduce` : la barre d'actions devient `--color-surface` opaque, sans flou.
- `prefers-contrast: more` : les filets de champ passent à `--color-text`, le séparateur à `--color-border-control`.

```css
:root {
  --color-bg: #F5F5F7;
  --color-surface: #FFFFFF;
  --color-surface-sunken: #EBEBF0;
  --color-surface-pressed: #DCDCE1;
  --color-text: #1D1D1F;
  --color-text-secondary: #6E6E73;
  --color-accent: #0066CC;
  --color-accent-hover: #0058B3;
  --color-accent-pressed: #004C99;
  --color-success: #1E7A3A;
  --color-success-bg: #E6F4EA;
  --color-error: #C4271C;
  --color-error-bg: #FBE9E7;
  --color-overrun: #B3261E;
  --color-border-control: #808086;
  --color-separator: #D2D2D7;
  --color-focus: #0066CC;
  --color-scrim: rgba(29, 29, 31, 0.32);
  --color-material: rgba(255, 255, 255, 0.72);

  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --duration-press: 120ms;
  --duration-hover: 150ms;
  --duration-fast: 180ms;
  --duration-base: 240ms;
  --duration-screen: 280ms;
}

@media (prefers-reduced-motion: reduce) {
  :root { --duration-screen: 120ms; }
  .screen-enter, .screen-exit { transform: none !important; }
}
```

---

## 11. Points à valider par le client

1. **Démarrage du chronomètre** au clic « Commencer la Daily » (écran d), et non à « Démarrer une Daily ». Libellé « Commencer la Daily » confirmé ?
2. **Sélecteur de temps** : liste déroulante native (brief) plutôt que stepper. Valeurs 1 à 5 min, défaut 2 min.
3. **« Appliquer à tous »** pour le temps de parole.
4. **Passer un membre à venir** (action « Passer » sur chaque ligne) en plus de « Passer ce membre » pour celui qui parle.
5. **Décompte après la durée** : il continue en « +mm:ss ».
6. **Fin de liste** : « Terminer la Daily » ramène à l'écran (c).
7. **Dialogue d'arrêt** : confirmation avant arrêt, aucune Daily enregistrée.
8. **Rechargement pendant une Daily** : retour à l'écran (c), le chronomètre n'est jamais relancé seul (question 5 du brief).
9. **Remplacement d'une équipe** lors d'une modification : confirmation à prévoir (question 2 du brief).
10. **Ordre de passage** : « Ordre de l'équipe » par défaut, tirage au démarrage, ordre fixe pendant la Daily.
11. **Tri alphabétique** de Mes équipes.
12. **Bouton « Annuler » en création** : présent seulement si une équipe existe.
13. **Pas de suppression d'équipe** dans cette version (hors périmètre, question 7 du brief).
