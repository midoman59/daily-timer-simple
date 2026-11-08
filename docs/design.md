# Design : Daily Timer Simple

- Auteur : Sally, UX Designer (méthode BMAD)
- Date : 2026-11-09
- Source : `docs/brief.md`
- Statut : proposition à valider avec le client. Les points marqués **[à valider]** reprennent les choix du brief.
- Périmètre : tokens, typographie, composants, écrans, mouvement, clavier, icône. Aucun code dans `src/`.

---

## 0. Direction artistique

Le rendu vise une finition calme, proche de l'écosystème Apple : fond gris très clair, surfaces blanches, texte quasi noir, un seul accent bleu, beaucoup d'air. L'interface reste sobre : l'information (le chronomètre, l'équipe) porte le visuel, pas la décoration.

Interdits, à respecter dans toute l'implémentation :
- champs HTML bruts (bordure par défaut du navigateur, police par défaut, champs non stylés) ;
- aspect tableau de bord SaaS : cartes de statistiques, graphiques, pastilles multicolores, barres de navigation latérales ;
- dégradés, halos, ombres fortes ;
- emoji comme icônes. Toutes les icônes sont des SVG monochromes (trait 2 px, coins arrondis).

---

## 1. Tokens

### 1.1 Couleurs (thème clair uniquement)

Tous les rapports sont calculés selon la formule WCAG 2.x (luminance relative). Le seuil AA est 4.5:1 pour le texte normal, 3:1 pour le texte grand (au moins 24 px, ou 18.66 px en gras) et les composants d'interface.

| Token | Valeur | Rôle |
|---|---|---|
| `--color-bg` | `#F5F5F7` | Fond de page |
| `--color-surface` | `#FFFFFF` | Cartes, champs, zone de liste |
| `--color-surface-muted` | `#E8E8ED` | Fond de bouton secondaire au survol, pastilles de compteur |
| `--color-text` | `#1D1D1F` | Texte principal, titres, chronomètre |
| `--color-text-secondary` | `#5C5C62` | Libellés, aides, compteur, durée prévue |
| `--color-text-disabled` | `#6E6E73` | Texte d'un élément désactivé (voir 1.3) |
| `--color-accent` | `#0061C2` | Accent unique : bouton principal, lien, focus |
| `--color-accent-pressed` | `#004A8F` | Bouton principal à l'appui |
| `--color-accent-hover` | `#00509E` | Bouton principal au survol |
| `--color-success` | `#17692D` | Confirmation d'enregistrement |
| `--color-success-bg` | `#E6F4EA` | Fond du bandeau de succès |
| `--color-error` | `#B3261E` | Message d'erreur de champ, bordure d'erreur |
| `--color-error-bg` | `#FBE9E7` | Fond du bandeau d'erreur |
| `--color-overrun` | `#9E1C16` | Chronomètre en dépassement, libellé « Temps dépassé » |
| `--color-border` | `#C7C7CC` | Séparateurs et bordure de carte (décoratif) |
| `--color-border-control` | `#8A8A8F` | Bordure de champ et de bouton secondaire (composant) |
| `--color-focus` | `#0061C2` | Anneau de focus, 2 px, décalage 2 px |

### 1.2 Contrastes vérifiés

| Couple texte / fond | Ratio | Verdict |
|---|---|---|
| `--color-text` sur `--color-bg` | 15.46:1 | AA et AAA |
| `--color-text` sur `--color-surface` | 16.83:1 | AA et AAA |
| `--color-text-secondary` sur `--color-bg` | 6.10:1 | AA |
| `--color-text-secondary` sur `--color-surface` | 6.64:1 | AA |
| `--color-text-secondary` sur `--color-surface-muted` | 5.44:1 | AA |
| Blanc sur `--color-accent` (bouton principal) | 6.02:1 | AA |
| Blanc sur `--color-accent-hover` | 7.95:1 | AA |
| Blanc sur `--color-accent-pressed` | 8.84:1 | AA |
| `--color-accent` sur `--color-surface` (lien, bouton secondaire) | 6.02:1 | AA |
| `--color-accent` sur `--color-bg` | 5.53:1 | AA |
| `--color-error` sur `--color-surface` | 6.54:1 | AA |
| `--color-error` sur `--color-error-bg` | 5.58:1 | AA |
| `--color-error` sur `--color-surface-muted` | 5.35:1 | AA |
| `--color-success` sur `--color-surface` | 6.79:1 | AA |
| `--color-success` sur `--color-success-bg` | 5.98:1 | AA |
| `--color-overrun` sur `--color-bg` | 7.33:1 | AA |
| `--color-overrun` sur `--color-surface` | 7.98:1 | AA |
| `--color-overrun` sur `--color-error-bg` | 6.81:1 | AA |
| `--color-text` sur `--color-error-bg` | 14.35:1 | AA et AAA |
| `--color-text` sur `--color-success-bg` | 14.82:1 | AA et AAA |
| `--color-border-control` sur `--color-surface` (bordure de champ) | 3.44:1 | AA composant (3:1) |
| `--color-border-control` sur `--color-bg` | 3.16:1 | AA composant (3:1) |
| `--color-focus` sur `--color-surface` et `--color-bg` | 6.02:1 et 5.53:1 | AA composant |
| `--color-border` sur `--color-surface` | 1.68:1 | Décoratif uniquement, jamais porteur d'information |
| `--color-text-disabled` sur `--color-surface-muted` | 4.15:1 | Exempté : élément désactivé (WCAG 1.4.3). Le fond et le curseur signalent aussi l'état |

**Ratio minimal relevé pour le texte porteur d'information : 5.35:1** (erreur sur `--color-surface-muted`). Les autres couples de texte porteur d'information sont tous supérieurs : secondaire sur muté 5.44:1, erreur sur bandeau 5.58:1, texte principal partout au-dessus de 11:1. Tous dépassent donc 4.5:1.

Règle : la couleur ne porte jamais seule une information. Erreur = icône + texte. Dépassement = texte « Temps dépassé » + « +mm:ss » + couleur. Succès = texte.

### 1.3 Règle des états désactivés

Un élément désactivé garde son libellé visible, passe sur `--color-surface-muted` avec le texte `--color-text-disabled`, perd sa bordure forte et prend `cursor: not-allowed`. Son motif (le message qui explique pourquoi) reste affiché sous le composant, lié par `aria-describedby`.

---

## 2. Typographie, espacements, rayons, ombres

### 2.1 Police

```
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
             "Segoe UI", system-ui, sans-serif;
```

Le rendu SF Pro est obtenu sur macOS et iOS ; sur Windows la pile retombe sur Segoe UI. Aucune police web n'est chargée : pas de requête réseau supplémentaire, cohérent avec la contrainte de fonctionnement local.

Chiffres du chronomètre : `font-variant-numeric: tabular-nums;` (les chiffres ont la même largeur, le décompte ne « saute » pas).

### 2.2 Échelle typographique

| Token | Taille / interligne | Graisse | Usage |
|---|---|---|---|
| `--type-timer` | `clamp(72px, 16vw, 168px)` / 1 | 300 | Décompte « mm:ss », écran 3 |
| `--type-title-1` | 34 px / 40 px | 600 | Titre d'écran (« Créer l'équipe », nom d'équipe sur écran 2) |
| `--type-title-2` | 22 px / 28 px | 600 | Titres de section, nom d'équipe sur écran 3 |
| `--type-body` | 17 px / 24 px | 400 | Texte courant, nom de membre, champs |
| `--type-body-strong` | 17 px / 24 px | 600 | Bouton principal, libellé de champ |
| `--type-callout` | 15 px / 20 px | 400 | Messages d'erreur, aides, compteur |
| `--type-caption` | 13 px / 18 px | 500 | Étiquettes de section en capitales légères, numéro d'ordre |

Mobile (sous 600 px) : `--type-title-1` passe à 28 px / 34 px, le décompte est plafonné par le `clamp` ci-dessus. Corps de texte : jamais sous 16 px sur les champs, pour éviter le zoom automatique d'iOS.

### 2.3 Espacements (base 4 px)

| Token | Valeur | Usage type |
|---|---|---|
| `--space-1` | 4 px | Écart icône / texte |
| `--space-2` | 8 px | Écart entre une ligne de membre et son bouton |
| `--space-3` | 12 px | Écart entre champ et message |
| `--space-4` | 16 px | Marge latérale mobile, écart entre éléments liés |
| `--space-5` | 24 px | Écart entre blocs d'un écran |
| `--space-6` | 32 px | Marge de carte (mobile) |
| `--space-7` | 48 px | Marge de carte (desktop) |
| `--space-8` | 64 px | Respiration haut / bas de page desktop |

Marge latérale : 16 px sur mobile, sans exception. Largeur de lecture maximale de la colonne : 560 px.

### 2.4 Rayons

| Token | Valeur | Usage |
|---|---|---|
| `--radius-control` | 10 px | Champs, boutons secondaires, bouton icône |
| `--radius-button-primary` | 999 px (capsule) | Boutons principaux |
| `--radius-card` | 16 px | Carte d'équipe, zone de liste |
| `--radius-pill` | 999 px | Compteur de membres |

### 2.5 Ombres (légères, jamais en dégradé)

| Token | Valeur | Usage |
|---|---|---|
| `--shadow-card` | `0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)` | Carte, zone de liste |
| `--shadow-raised` | `0 4px 16px rgba(0,0,0,0.08)` | Dialogue de confirmation, barre d'action mobile |
| `--shadow-focus` | `0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-focus)` | Anneau de focus (remplace l'ombre au focus) |

### 2.6 Mouvement

| Token | Valeur |
|---|---|
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` |
| `--duration-fast` | 150 ms |
| `--duration-base` | 240 ms |
| `--duration-slow` | 320 ms |

---

## 3. Composants

Chaque composant est décrit avec ses états : repos, survol (`:hover`, seulement sur dispositif avec pointeur fin : `@media (hover: hover)`), focus clavier (`:focus-visible`), appui (`:active`), désactivé (`disabled` ou `aria-disabled="true"`).

Règle commune de focus : anneau `--shadow-focus` affiché uniquement au clavier (`:focus-visible`). Aucune suppression de contour sans remplacement.

Zone cliquable minimale : 44 x 44 px pour tout bouton, y compris le bouton icône « Supprimer ».

### 3.1 Bouton principal

- Forme : capsule, hauteur 52 px, padding horizontal 28 px, largeur minimale 160 px, pleine largeur sur mobile.
- Style : fond `--color-accent`, texte blanc `--type-body-strong`.
- Repos : fond `--color-accent`, ombre aucune.
- Survol : fond `--color-accent-hover`.
- Focus clavier : `--shadow-focus`.
- Appui : fond `--color-accent-pressed`, `transform: scale(0.98)` pendant 120 ms.
- Désactivé : fond `--color-surface-muted`, texte `--color-text-disabled`, pas de survol ni d'appui.
- Libellés utilisés : « Enregistrer l'équipe », « Démarrer une Daily ».

### 3.2 Bouton secondaire

- Forme : capsule, hauteur 52 px (même hauteur que le principal pour que la paire tienne).
- Style : fond `--color-surface`, bordure 1 px `--color-border-control`, texte `--color-accent`. Libellés : « Modifier l'équipe », « Arrêter la Daily ».
- Survol : fond `--color-surface-muted`.
- Focus clavier : `--shadow-focus`.
- Appui : fond `#D8D8DE` (variante de `--color-surface-muted`), texte `--color-accent-pressed` `#004A8F` : contraste 6.23:1.
- Désactivé : bordure `--color-border`, texte `--color-text-disabled`.

Variante « Arrêter la Daily » : même style mais texte `--color-error`. Contraste sur `--color-surface` : 6.54:1.

### 3.3 Lien d'action « Annuler »

- Texte seul, `--type-body`, couleur `--color-accent`, soulignement au survol.
- Zone cliquable : 44 px de haut minimum.
- Focus clavier : `--shadow-focus` avec rayon 8 px.

### 3.4 Bouton icône

- Forme : cercle 44 x 44 px, icône SVG 20 px, trait 2 px, couleur `--color-text-secondary`.
- Repos : fond transparent.
- Survol : fond `--color-surface-muted`, icône `--color-text`.
- Focus clavier : `--shadow-focus`.
- Appui : fond `#D8D8DE`, icône `--color-text` (11.86:1).
- Désactivé : icône `--color-text-disabled`, pas d'interaction.
- Un bouton icône a toujours un `aria-label` explicite, par exemple « Supprimer Thomas ». L'info-bulle native `title` est ajoutée au survol pour les souris.

### 3.5 Champ de texte

- Structure : libellé visible au-dessus (`--type-body-strong`, `--color-text`), champ, message d'aide ou d'erreur dessous. Jamais de texte uniquement dans le placeholder.
- Champ : hauteur 52 px, padding 14 px 16 px, fond `--color-surface`, bordure 1 px `--color-border-control`, rayon `--radius-control`, texte `--type-body` 17 px (évite le zoom iOS).
- Repos : bordure `--color-border-control`.
- Survol : bordure `#6E6E73`.
- Focus clavier : bordure `--color-focus` 2 px et `--shadow-focus` ; le contour natif est retiré mais remplacé.
- Erreur : bordure 2 px `--color-error`, icône d'alerte SVG 16 px à droite du champ, `aria-invalid="true"`.
- Désactivé : fond `--color-surface-muted`, texte `--color-text-disabled`, `disabled`.

Message d'erreur sous le champ :
- Élément `<p id="{champ}-erreur" class="field-error">` avec une icône SVG 16 px (`aria-hidden`) et le texte, `--type-callout`, couleur `--color-error`.
- Le champ porte `aria-describedby="{champ}-aide {champ}-erreur"` (l'aide reste lue, puis l'erreur). Si l'erreur n'existe pas, seul `{champ}-aide` est référencé.
- Le message apparaît au moment où l'erreur est constatée (blur ou tentative d'enregistrement), jamais pendant la frappe d'un caractère valide.
- Apparition : fondu et translation de 4 px vers le bas, `--duration-base`.

Champs concernés et messages (repris du brief, section 3.1) : « Nom d'équipe » avec « Donnez un nom à votre équipe. » ; « Prénom » avec « Saisissez un prénom. », « Ce prénom existe déjà dans l'équipe. », « Une équipe ne peut pas dépasser 15 membres. » ; « Durée de la Daily » avec le message de durée.

### 3.6 Champ numérique (durée)

- Même structure que le champ de texte, avec `inputmode="numeric"`, `pattern="[0-9]*"` et `autocomplete="off"`.
- Suffixe « min » affiché dans le champ, à droite, `--color-text-secondary`, non lu par la saisie.
- Largeur : 160 px (le champ ne demande pas toute la largeur).
- Pré-rempli à 15 **[à valider]**.
- Messages : « Indiquez la durée de la Daily. » (vide), « Saisissez un nombre entier de minutes. » (décimal ou texte, par exemple « 7,5 »), « La durée doit être comprise entre 1 et 120 minutes. » (hors bornes), « La durée divisée par le nombre de membres doit être d'au moins 30 secondes. » **[à valider]** (blocage d'enregistrement, voir 4.1).
- Le message de contrainte de durée et le message de temps par membre se placent sous le champ durée.

### 3.7 Liste de membres avec ligne de suppression

- Conteneur : carte `--color-surface`, rayon 16 px, ombre `--shadow-card`, `<ol>` pour garder l'ordre de saisie.
- Ligne : hauteur minimale 52 px, séparateur 1 px `--color-border` entre lignes, padding 12 px 8 px 12 px 16 px.
- Contenu de ligne : numéro d'ordre (`--type-caption`, `--color-text-secondary`, `tabular-nums`, largeur fixe 24 px), prénom (`--type-body`, `--color-text`), bouton icône « Supprimer » à droite (corbeille ou croix SVG, pas de texte visible sur mobile ; texte visible sur desktop si la place le permet).
- Repos, survol de la ligne : fond `#F9F9FB` (très léger).
- Focus clavier : sur le bouton icône de la ligne (`--shadow-focus`).
- État vide : pas de liste ; un texte « Aucun membre pour l'instant. » en `--color-text-secondary` remplace la liste.
- Ajout : la nouvelle ligne apparaît en fin de liste, fondu de 180 ms.
- Suppression : la ligne se referme en hauteur (160 ms) puis disparaît. Les numéros suivants se recalculent. Le focus passe sur le bouton « Supprimer » de la ligne suivante, ou, s'il n'y en a pas, sur le champ « Prénom ». Le focus ne se perd jamais dans le vide.
- Membres supprimés avant enregistrement : aucun appel, aucune sauvegarde.
- Lecture par lecteur d'écran : la liste est une `<ol>` ; l'ajout et la suppression sont annoncés par la zone de compteur (3.8), pas par la liste.

### 3.8 Compteur de membres

- Forme : pastille capsule, fond `--color-surface-muted`, texte `--type-callout` `--color-text-secondary`, 32 px de haut, `tabular-nums`.
- Libellés : « 0 membre », « 1 membre », « 2 membres »… (accord en « membre » / « membres »).
- État de maximum (15) : texte `--color-text`, pastille contour `--color-border-control` ; le message « Une équipe ne peut pas dépasser 15 membres. » apparaît sous le champ « Prénom ».
- État vide (0) : le texte d'aide « Ajoutez au moins 2 membres pour continuer. » s'affiche sous la liste.
- Accessibilité : `role="status"` et `aria-live="polite"`. L'annonce ne se produit qu'au changement de valeur, jamais à l'ouverture de l'écran.

### 3.9 Carte d'équipe (écran 2)

- Conteneur `<section aria-labelledby="titre-equipe">` : fond `--color-surface`, rayon 16 px, ombre `--shadow-card`, padding 32 px (mobile) ou 48 px (desktop).
- Contenu dans l'ordre : nom d'équipe (`--type-title-1`), ligne de métadonnées (durée prévue « 15 min », nombre de membres) en `--type-callout` `--color-text-secondary`, séparateur, liste des membres (3.7 en lecture seule, sans bouton de suppression).
- Pas de bouton dans la carte. Les actions sont sous la carte.
- Liste en lecture seule : même hauteur de ligne, pas d'effet de survol.

### 3.10 Chronomètre (écran 3)

- Décompte : `--type-timer`, poids 300, `font-variant-numeric: tabular-nums`, couleur `--color-text`, centré.
- Élément : `<p role="timer" aria-label="Temps restant">`. `aria-live` reste « off » : une annonce par seconde serait illisible. Les seules annonces vocales sont : le démarrage, le dépassement (« Temps dépassé ») et l'arrêt, via une zone `role="status"` masquée visuellement.
- Libellé de durée prévue sous le décompte : « sur 15 min » en `--type-body` `--color-text-secondary`.
- En cours : décompte `--color-text`.
- Dépassement : décompte `--color-overrun`, transition de couleur 300 ms ; libellé « Temps dépassé » au-dessus du décompte, `--type-title-2`, `--color-overrun` ; sous le décompte, « +mm:ss » en `--type-title-2`, `--color-overrun`. Le signe « + » et le libellé textuel rendent l'info lisible sans couleur.
- Décompte : mise à jour au moins une fois par seconde, sans saut (utiliser le temps système pour recalculer, pas un simple compteur d'intervalles, pour éviter la dérive).
- Comportement après la durée **[à valider]** : recommandation : le décompte continue et passe en « +mm:ss ». Le chronomètre ne s'arrête pas seul, car il sert de repère pendant la réunion.
- Liste compacte des membres : une ligne par membre, `--type-body`, numéro d'ordre à gauche, pas de bouton. Hauteur de ligne 40 px. Sur desktop, la liste est en colonne latérale (voir 4.3).

### 3.11 Dialogue de confirmation d'arrêt **[à valider]**

- Déclenché par « Arrêter la Daily ». Recommandation : confirmer, pour éviter l'arrêt accidentel.
- Forme : carte `--color-surface`, rayon 16 px, `--shadow-raised`, largeur max 360 px, centrée, fond voilé `rgba(29,29,31,0.32)`.
- Titre `--type-title-2` : « Arrêter la Daily ? ». Texte `--type-body` : « Le chronomètre s'arrêtera. »
- Boutons : « Arrêter » (secondaire, texte `--color-error`) et « Continuer » (principal, action sûre). Ordre : « Continuer » à gauche (desktop) ou au-dessus (mobile, pleine largeur).
- `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` et `aria-describedby`. Le focus arrive sur « Continuer ».
- Escape = « Continuer ». Le focus est piégé dans le dialogue, et revient sur « Arrêter la Daily » à la fermeture.

### 3.12 Bandeau d'erreur

- Forme : bandeau pleine largeur de la colonne, rayon 12 px, fond `--color-error-bg`, bordure gauche 4 px `--color-error`, icône d'alerte SVG 20 px `--color-error`, texte `--type-callout` `--color-text`.
- Contenu : message seul, une phrase ; un lien ou bouton d'action est optionnel (« Recréer l'équipe » sur la donnée illisible).
- Placement : en haut du contenu, sous le titre d'écran.
- Accessibilité : `role="alert"` pour une erreur qui apparaît après une action ; sinon `role="status"`.
- Apparition : fondu et translation de 4 px, `--duration-base`.
- Usage : « Les données de l'équipe sont illisibles. Recréez l'équipe. » **[à valider]**. Le bandeau de succès (`--color-success-bg`, texte `--color-text`, icône check) peut confirmer l'enregistrement.

---

## 4. Les trois écrans

### 4.0 Règles de mise en page communes

- Une action principale par écran, placée à la même position dans le flux.
- Desktop (à partir de 768 px) : colonne centrée de 560 px, fond `--color-bg`, carte blanche de 48 px de marge interne. Écran 3 : chronomètre centré dans la fenêtre, pas de carte.
- Mobile (320 à 767 px) : colonne pleine largeur, marge 16 px. Les actions principales sont pleine largeur, dans une barre fixe en bas (3.13).
- À 320 px : aucun défilement horizontal. Les libellés longs passent à la ligne ; le chronomètre se réduit par le `clamp`.
- Pas de dégradé de fond : fond `--color-bg` uni.
- Titre d'écran : `<h1>` en `--type-title-1`, marge haute 32 px desktop et 24 px mobile.

### 4.1 Écran 1 : Créer ou modifier l'équipe

**Ordre des éléments (haut en bas) :**
1. Titre `<h1>` : « Créer votre équipe » (premier usage) ou « Modifier l'équipe » (modification).
2. Champ « Nom d'équipe » (texte, obligatoire, 50 caractères max **[à valider]**).
3. Champ « Durée de la Daily » (numérique, suffixe « min », pré-rempli à 15 **[à valider]**).
4. Ligne « Membres » : étiquette de section (`--type-caption`), compteur (3.8) à droite.
5. Champ « Prénom » (texte, 30 caractères max **[à valider]**) avec bouton secondaire « Ajouter » à droite sur desktop, en dessous sur mobile. Entrée valide aussi.
6. Message de maximum ou d'aide sous le champ « Prénom ».
7. Liste des membres (3.7), ou texte d'état vide.
8. Zone d'actions : bouton principal « Enregistrer l'équipe » ; lien « Annuler » (en modification seulement, à gauche du principal sur desktop, au-dessus sur mobile).

**Mise en page desktop :** champs « Nom » et « Durée » sur la même ligne (Durée à 160 px), le bloc « Membres » suit en pleine largeur, zone d'actions alignée à droite.

**Mise en page mobile :** champs empilés pleine largeur, zone d'actions en barre fixe en bas (3.13), liste au-dessus de la barre.

**Bouton « Ajouter » :** bouton secondaire, 52 px de haut. Désactivé si le champ est vide (le message « Saisissez un prénom. » s'affiche seulement après une tentative : ne pas signaler une erreur avant la première action).

**États :**
- *Vide (aucun membre) :* compteur « 0 membre », texte « Ajoutez au moins 2 membres pour continuer. », bouton « Enregistrer l'équipe » désactivé.
- *Erreur de champ :* message sous le champ fautif (3.5), bordure d'erreur. À l'enregistrement, le focus va sur le premier champ en erreur, dans l'ordre de l'écran.
- *Maximum atteint (15) :* champ « Prénom » désactivé avec le message « Une équipe ne peut pas dépasser 15 membres. », bouton « Ajouter » désactivé.
- *Enregistré :* transition vers l'écran 2 (4.2).

**Bouton « Enregistrer l'équipe » désactivé (S5)** : il est désactivé quand le nom est vide, quand il y a moins de 2 membres ou quand la durée est invalide. Un bouton désactivé reste focalisable au clavier (`aria-disabled="true"`) pour que le message explicatif soit lu. Au clic (ou Entrée) sur ce bouton `aria-disabled`, le focus va sur le premier champ fautif et le message s'affiche.

**Blocage « temps par membre » [à valider] :** si la durée divisée par le nombre de membres est inférieure à 30 secondes, le bouton reste désactivé et le message « La durée divisée par le nombre de membres doit être d'au moins 30 secondes. » s'affiche sous le champ durée.

### 4.2 Écran 2 : Présentation de l'équipe

**Ordre des éléments :**
1. Titre `<h1>` : nom d'équipe.
2. Carte d'équipe (3.9) : métadonnées (durée prévue, nombre de membres), liste ordonnée des membres.
3. Message d'état sous la carte (si moins de 2 membres) : « Ajoutez au moins 2 membres pour démarrer. » ; lié au bouton par `aria-describedby`.
4. Zone d'actions : bouton principal « Démarrer une Daily » (désactivé si moins de 2 membres) ; bouton secondaire « Modifier l'équipe ».

**Desktop :** carte de 560 px centrée, zone d'actions en ligne, principal à droite, secondaire à gauche.
**Mobile :** carte pleine largeur, zone d'actions en barre fixe en bas (principal pleine largeur, au-dessus du secondaire ou à côté si la largeur le permet).

**États :**
- *Équipe complète :* présentation complète, bouton principal actif.
- *Équipe incomplète (moins de 2 membres) :* bouton « Démarrer une Daily » désactivé, message « Ajoutez au moins 2 membres pour démarrer. » ; le bouton « Modifier l'équipe » reste actif.
- *Données illisibles :* retour à l'écran 1 avec le bandeau 3.12 « Les données de l'équipe sont illisibles. Recréez l'équipe. » **[à valider]**.
- *Aucune équipe :* redirection vers l'écran 1 sans message (brief).

**Ordre d'ouverture :** si une équipe est enregistrée, l'écran 2 s'affiche au chargement, sans passer par l'écran 1 (S7).

### 4.3 Écran 3 : Daily (chronomètre)

**Ordre des éléments :**
1. Nom d'équipe (`<h1>` discret, `--type-title-2`, `--color-text-secondary`), en haut.
2. Libellé de dépassement « Temps dépassé » (masqué tant que le décompte est positif, espace réservé pour éviter le saut de mise en page).
3. Décompte « mm:ss » (3.10), centré, le plus grand élément de l'écran.
4. Durée prévue : « sur 15 min » ; en dépassement, « +mm:ss » à la place du libellé de durée.
5. Liste compacte des membres (3.10), ordre de saisie.
6. Bouton secondaire « Arrêter la Daily » (variante erreur), en bas.

**Desktop :** décompte centré dans la fenêtre, liste des membres en colonne fine à droite (240 px), bouton « Arrêter » en bas à gauche.
**Mobile :** décompte en haut de l'écran, liste en dessous et défilable, bouton « Arrêter » en barre fixe en bas.

**Pas de bouton pause, pas de choix de membre, pas de saisie** (brief).

**Comportement :**
- Le chronomètre démarre au clic sur « Démarrer une Daily », avec la durée et les membres configurés. Il ne démarre jamais à l'ouverture ni au rechargement de l'écran 3 (le rechargement renvoie à l'écran 2, voir 6).
- L'annonce « Daily démarrée, 15 minutes » est lue par la zone masquée `role="status"`.
- Au dépassement, l'annonce « Temps dépassé » est lue une seule fois.

**États :**
- *En cours :* décompte `--color-text`.
- *Dépassement :* décompte et libellé en `--color-overrun`, « +mm:ss », « Temps dépassé ».
- *Arrêtée :* clic sur « Arrêter la Daily » → dialogue 3.11 **[à valider]** → écran 2 ; le chronomètre s'interrompt, sans effet de bord.

### 4.4 Transitions entre écrans

- Changement d'écran : sortie de l'écran courant (opacité 1 → 0, `--duration-fast`, `--ease-exit`), puis entrée du nouvel écran (opacité 0 → 1 et translation de 8 px vers 0, `--duration-base`, `--ease-standard`). Durée totale : environ 390 ms.
- Entrée au chargement : contenu en fondu et translation de 8 px, `--duration-base`, `--ease-standard`, sans délai.
- Après changement d'écran, le focus va sur le `<h1>` du nouvel écran (`tabindex="-1"`, sans contour visible), pour que le lecteur d'écran annonce le titre.
- Dialogue 3.11 : fondu du voile 160 ms, carte en translation de 8 px et fondu, `--duration-base`.
- Mise à jour de l'équipe enregistrée : pas d'animation de page ; la carte de l'écran 2 se met à jour en fondu de 160 ms.

### 4.5 Comportement au clavier

Ordre de tabulation : celui de l'ordre des éléments (4.1 à 4.3). Aucun `tabindex` positif.

**Écran 1 :**
- Tab : nom → durée → prénom → bouton « Ajouter » → bouton icône « Supprimer » de chaque ligne (dans l'ordre) → « Annuler » (si modification) → « Enregistrer l'équipe ».
- Entrée dans le champ « Prénom » : ajoute le membre (équivalent au clic sur « Ajouter »). Le champ se vide et le focus reste dans le champ.
- Entrée sur le champ « Nom » ou « Durée » : sans effet, sauf à la dernière étape ; ne jamais enregistrer avec Entrée depuis un champ de durée (évite l'enregistrement accidentel) **[à valider]**.
- Escape : en modification, équivalent d'« Annuler » (retour à l'écran 2, sans enregistrer). En création, sans effet.
- Suppression au clavier : Entrée ou Espace sur le bouton « Supprimer » ; le focus passe au bouton suivant ou au champ « Prénom » (3.7).

**Écran 2 :** Tab sur « Démarrer une Daily » puis « Modifier l'équipe ». Le DOM place le bouton principal en premier : sur desktop, le secondaire est à gauche visuellement, donc l'ordre visuel et l'ordre de tabulation diffèrent. Pour respecter WCAG 2.4.3, l'ordre DOM doit suivre l'ordre visuel : le secondaire est à gauche dans le DOM aussi, et le principal reçoit le focus après lui.

**Écran 3 :**
- Au chargement de l'écran 3, le focus va sur le `<h1>` (nom d'équipe) : jamais sur le bouton « Arrêter » pour éviter un arrêt accidentel par Entrée.
- Tab : « Arrêter la Daily ».
- Ni raccourci de pause ni raccourci de démarrage. Le chronomètre n'a pas de raccourci clavier global (pas de Espace global qui interromprait le décompte).

**Dialogue 3.11 :** focus initial sur « Continuer », Tab circule entre « Continuer » et « Arrêter » uniquement, Escape = « Continuer ».

**Raccourci global :** aucun.

### 4.6 Réduction des mouvements

Si `prefers-reduced-motion: reduce`, toutes les translations sont supprimées ; les fondus restent limités à 120 ms ou sont instantanés. Le changement de couleur du décompte en dépassement reste, il ne bouge pas.

---

## 5. Animations : récapitulatif

| Élément | Animation | Durée | Courbe |
|---|---|---|---|
| Entrée d'écran | fondu + translation 8 px | 240 ms | `--ease-standard` |
| Transition entre écrans | sortie fondu, puis entrée fondu + translation 8 px | 150 ms + 240 ms | `--ease-exit` puis `--ease-standard` |
| Membre ajouté | fondu | 180 ms | `--ease-standard` |
| Membre supprimé | fermeture en hauteur puis fondu | 160 ms | `--ease-exit` |
| Erreur de champ | fondu + translation 4 px | 240 ms | `--ease-standard` |
| Bandeau d'erreur | fondu + translation 4 px | 240 ms | `--ease-standard` |
| Bouton principal à l'appui | `scale(0.98)` | 120 ms | `--ease-standard` |
| Survol bouton | changement de fond | 150 ms | `--ease-standard` |
| Passage en dépassement | changement de couleur du décompte | 300 ms | `--ease-standard` |
| Dialogue d'arrêt **[à valider]** | voile en fondu, carte en translation 8 px | 240 ms | `--ease-standard` |

Pas d'animation sur le décompte lui-même (le chiffre change, il ne glisse pas).

---

## 6. Points d'attention pour la validation (rappel)

Les choix suivants sont proposés en attendant la validation du client. Ils ne bloquent pas la maquette.

1. Décompte continu après la durée, en rouge : recommandé (4.3).
2. Confirmation avant arrêt de la Daily : recommandée (3.11).
3. Rechargement pendant une Daily : recommandé, retour à l'écran 2, le chronomètre n'est jamais relancé seul (4.3). La reprise avec temps écoulé pendant la fermeture reste à arbitrer (brief, question 3).
4. Remplacement d'une équipe existante : recommandé, confirmation avant écrasement (écran 1, action « Enregistrer » en modification ; le libellé reste « Enregistrer l'équipe »). Question 2 du brief.
5. Pré-remplissage de la durée à 15 minutes et bornes des champs (noms, prénoms) : valeurs du brief, à valider.

---

## 7. Accessibilité : synthèse

- Contrastes : ratio minimal de texte porteur d'information 5.35:1 (WCAG AA 4.5:1 respecté) ; composants d'interface et focus à 3:1 minimum (3.16:1 pour la bordure de champ sur le fond, 3.44:1 sur surface).
- Cible tactile : 44 x 44 px minimum.
- Focus visible : anneau 2 px, toujours présent au clavier.
- Annonces : messages d'erreur liés par `aria-describedby` ; compteur en `role="status"` ; chronomètre sans `aria-live` continu ; bandeau en `role="alert"`.
- Mouvement réduit : pris en compte (4.6).
- Pas de couleur seule : chaque erreur ou dépassement a un texte.

---

## 8. Icône d'application

Fichier : `C:\Projects\daily-timer-simple\public\icon.svg`.

- Forme : carré arrondi (rayon 112 sur 512), fond `--color-accent` (`#0061C2`), flat, sans dégradé.
- Glyphe : chronomètre blanc (couronne, tige, anneau, aiguille, moyeu). Trait de l'anneau 40 unités, soit environ 2.5 px à 32 px ; aiguille 36 unités, soit environ 2.25 px ; couronne 60 x 36 unités.
- Lisibilité à 32 px : le glyphe reste reconnaissable (anneau, couronne et aiguille sont les trois repères). Le rendu n'a pas été vérifié par rastérisation dans cette session : à contrôler une fois l'icône importée dans le navigateur (`icon.svg` rendu à 32 x 32).

---

## 9. Résumé des tokens (référence)

```css
:root {
  --color-bg: #F5F5F7;
  --color-surface: #FFFFFF;
  --color-surface-muted: #E8E8ED;
  --color-text: #1D1D1F;
  --color-text-secondary: #5C5C62;
  --color-text-disabled: #6E6E73;
  --color-accent: #0061C2;
  --color-accent-hover: #00509E;
  --color-accent-pressed: #004A8F;
  --color-success: #17692D;
  --color-success-bg: #E6F4EA;
  --color-error: #B3261E;
  --color-error-bg: #FBE9E7;
  --color-overrun: #9E1C16;
  --color-border: #C7C7CC;
  --color-border-control: #8A8A8F;
  --color-focus: #0061C2;
}
```

Pour l'appui des boutons secondaires et icônes, `#D8D8DE` est une teinte intermédiaire (non tokenisée dans la liste ci-dessus) ; le texte y est `--color-accent-pressed` (6.23:1) ou `--color-text` (11.86:1).
