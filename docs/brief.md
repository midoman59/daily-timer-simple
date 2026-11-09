# Brief : Daily Timer Simple

- Version : 3
- Date : 2026-11-09
- Statut : révisé selon les décisions du client ; à valider par le client pour les seuls points marqués **[à valider]** (section 6)
- Source : brief version 2 ; décisions du client du 2026-11-09 (décisions 1 à 17 et trois demandes nouvelles, A à C) ; PRD « Scrum Speaking Timer » (C:\Projects\Timer), réduit à l'essentiel
- Marqueur : **[à valider]** = règle ou choix que le client n'a pas tranché, à confirmer

---

## Changelog

Changements par rapport à la version 2. La colonne « Décision » renvoie aux décisions du client (1 à 17, ou « demande » pour les trois demandes nouvelles A à C) et à leur entrée dans `decisions.md`.

| # | Sujet | Changement en v3 | Décision | decisions.md |
|---|---|---|---|---|
| 1 | Départ du chronomètre | Le chronomètre part au clic sur « Commencer la Daily ». Il ne part jamais à l'ouverture de (e) ni à l'affichage de (d). Question 1 de la v2 close. | 1 | D29 |
| 2 | Fin de la Daily | La Daily ne se termine que sur « Terminer la Daily ». Au dernier membre, « Suivant » devient « Terminer la Daily », qui ouvre le bilan (f). Question 2 close. | 2 | D30 |
| 3 | Dépassement | Le décompte devient négatif et continue, en rouge, « +mm:ss ». Le passage au membre suivant n'a lieu que sur « Suivant ». Question 3 close. | 3 | D31 |
| 4 | Temps non utilisé | Perdu. Le membre suivant repart de son temps alloué. Question 4 close. | 4 | D32 |
| 5 | Rechargement ou fermeture | La Daily reprend en pause là où elle était : même membre, même temps restant, même ordre. L'organisateur relance d'un clic (« Reprendre la Daily »). Le temps de fermeture ne compte pas. Remplace le retour à (c) sans reprise de la v2. Question 5 close. | 5 | D33 (remplace D14 et D21) |
| 6 | Bilan | Nouvel écran (f) : pour chaque membre, temps réellement parlé, temps alloué, dépassement, passé ; boutons « Copier le bilan » et « Retour à l'équipe ». Pas d'historique. Le bilan entre dans le périmètre. Question 6 close. | 6 | D34 |
| 7 | Suppression d'équipe | Depuis « Mes équipes », avec confirmation. Sort de « Non demandé, hors périmètre ». Question 7 close. | 7 | D35 |
| 8 | Arrêt de la Daily | Confirmation obligatoire. Une Daily arrêtée n'est pas conservée. « Historique des Daily » passe en hors périmètre définitif. Question 8 close. | 8 | D36 |
| 9 | Retour arrière pendant la Daily | Garde de sortie : le dialogue « Quitter la Daily ? » demande confirmation. « Continuer » reste sur la Daily ; confirmer arrête la Daily et perd la progression. Remplace l'arrêt immédiat de la v2 (D28) et la question 9 (constat I3). | 9 | D37 (remplace D28) |
| 10 | Libellé | Le bouton de (d) s'appelle « Commencer la Daily ». | 10 | D38 |
| 11 | Passer un membre | Possible pour le membre qui parle et pour un membre à venir. Non proposé pour un membre déjà fait ou passé. | 11 | D39 |
| 12 | Temps par personne | Défaut 2 minutes, bornes 1 à 5 minutes. Les valeurs ne sont plus marquées [à valider]. | 12 | D40 |
| 13 | Ordre par défaut | Ordre de l'équipe. | 13 | D41 |
| 14 | Modification d'équipe | Confirmation avant un enregistrement qui supprime un membre. | 14 | D42 |
| 15 | Mes équipes | Liste triée par ordre alphabétique. | 15 | D43 |
| 16 | Appliquer à tous | Conservé. Le point n'est plus marqué [à valider]. | 16 | D44 |
| 17 | Doublons de prénoms | Refusés à la saisie, au moment de l'ajout. Pas de dédoublonnage au chargement. | 17 | D45 |
| A | Mode sombre | Suit le réglage système (prefers-color-scheme). Aucun bouton de bascule en V1. | demande | D46 |
| B | Majuscule des prénoms | La première lettre de chaque prénom ajouté passe en majuscule, sans toucher au reste. Le stockage garde cette forme. | demande | D47 |
| C | Espace sous « Nouvelle équipe » | Un espace de 16 px sous le bouton, sur ordinateur et mobile. | demande | D48 |

Autres changements :
- **Écrans** : cinq deviennent six. L'écran (f) Bilan est ajouté. Quatre dialogues sont décrits : suppression d'équipe, confirmation de modification, arrêt de la Daily, garde de sortie.
- **Libellé** : « Passer au suivant » devient « Suivant », comme dans les décisions 2 et 3.
- **Parcours** : mis à jour (section 1), avec la reprise à l'ouverture et la suppression.
- **Stories** : S1 à S18 mises à jour ; S19 à S30 ajoutées ; critères devenus caducs retirés (section 4).
- **Questions ouvertes** : les neuf questions de la v2 sont closes. Les points restants sont listés section 6.

---

## 1. Objectif et public

**Objectif.** Un Scrum Master gère une ou plusieurs équipes. Il crée chaque équipe une fois, la corrige ou la supprime si besoin, vérifie sa présentation, choisit le temps de parole de chacun et l'ordre de passage, puis lance une Daily chronométrée. L'application est locale : aucun compte, aucun serveur, les données restent dans le navigateur.

**Public.**
- Scrum Master (utilisateur principal) : gère les équipes et lance la Daily, souvent depuis un ordinateur partagé à l'écran.
- Membres de l'équipe : lisent le chronomètre sur l'écran partagé. Ils n'ont aucune saisie à faire.

**Principe directeur.** Une action principale par écran. Rien n'est demandé qui ne soit nécessaire. L'écran de chronomètre n'est jamais l'écran d'entrée, sauf pour reprendre une Daily interrompue.

**Parcours.**
- **À l'ouverture :**
  - si une Daily est en cours, l'application ouvre (e) en pause (S27) ;
  - sinon, si au moins une équipe est enregistrée, (a) Mes équipes ; sinon (b) Création d'équipe.
- (a) → « Ouvrir » → (c) ; (a) → « Nouvelle équipe » → (b) ; (a) → « Supprimer » → dialogue de suppression → (a).
- (c) → « Modifier l'équipe » → (b) prérempli ; (c) → « Démarrer une Daily » → (d) ; (c) → « Mes équipes » → (a) **[à valider]**.
- (b) → « Enregistrer l'équipe » → (c). En modification, si l'enregistrement supprime un membre, le dialogue de confirmation s'affiche d'abord. (b) → « Annuler » → (c) en modification.
- (d) → « Commencer la Daily » → (e) ; (d) → « Annuler » → (c).
- (e) → « Terminer la Daily » (au dernier membre) → (f) ; (e) → « Arrêter la Daily » → dialogue → (c) ; (e) → retour arrière → garde de sortie (dialogue 2.8).
- (f) → « Retour à l'équipe » → (c).

---

## 2. Les six écrans et les quatre dialogues

### Écran (a) : Mes équipes

- **But :** voir les équipes enregistrées, en ouvrir une, en créer une, en supprimer une.
- **Éléments :**
  - titre « Mes équipes » ;
  - liste triée par ordre alphabétique (nom, nombre de membres) ;
  - bouton principal « Nouvelle équipe », suivi d'un espace de 16 px avant la liste ;
  - pour chaque équipe, un bouton « Ouvrir » et un bouton secondaire « Supprimer ».
- **Actions :** ouvrir une équipe (→ c), créer une équipe (→ b), supprimer une équipe (→ dialogue 2.5, puis reste sur a).
- **États :**
  - *Vide :* non affiché. Après suppression de la dernière équipe, l'application affiche (b), comme au lancement sans équipe.
  - *Succès :* liste triée.

### Écran (b) : Création et modification d'équipe

- **But :** saisir l'équipe une fois, ou la corriger.
- **Éléments :**
  - titre (« Nouvelle équipe » ou « Modifier l'équipe ») ;
  - champ « Nom d'équipe » ;
  - champ « Prénom » avec bouton « Ajouter » (Entrée valide aussi) ;
  - liste ordonnée des membres, un bouton « Supprimer » par ligne ;
  - compteur « N membres » ;
  - bouton principal « Enregistrer l'équipe » ;
  - lien « Annuler » (en modification : retour à c ; en création **[à valider]**, voir section 6).
- **Absent :** aucun champ de durée.
- **Saisie d'un prénom, à l'ajout :** espaces retirés, première lettre mise en majuscule (S23), puis contrôles (obligatoire, 30 caractères, caractères autorisés, doublon). Un prénom refusé reste dans le champ avec son message.
- **Actions :** saisir le nom, ajouter ou supprimer un membre avant enregistrement, enregistrer, annuler.
- **États :**
  - *Vide :* aucun membre, compteur « 0 membre », texte « Ajoutez au moins 2 membres pour continuer. », bouton désactivé.
  - *Erreur :* message lié au champ fautif, lu par les lecteurs d'écran ; à l'enregistrement, le focus va sur le premier champ fautif ; à 15 membres, le champ « Prénom » est désactivé avec le message « Une équipe ne peut pas dépasser 15 membres. ».
  - *Confirmation :* en modification, si l'enregistrement supprime un membre, le dialogue 2.6 s'ouvre avant l'enregistrement.
  - *Succès :* l'équipe est enregistrée et l'écran (c) s'affiche.
- **Annuler et Échap :** en modification, reviennent à (c) sans rien enregistrer. En création, Échap est sans effet.

### Écran (c) : Présentation de l'équipe

- **But :** vérifier l'équipe et lancer une Daily.
- **Éléments :** nom d'équipe (titre) ; nombre de membres ; liste des membres dans l'ordre de saisie ; bouton principal « Démarrer une Daily » ; bouton secondaire « Modifier l'équipe » ; lien « Mes équipes » **[à valider]**.
- **Absent :** aucune durée de Daily, qui se choisit à l'écran (d).
- **Actions :** démarrer une Daily (→ d), modifier l'équipe (→ b), revenir à Mes équipes.
- **États :**
  - *Équipe incomplète :* moins de 2 membres → « Démarrer une Daily » désactivé, avec « Ajoutez au moins 2 membres pour démarrer. ».
  - *Données illisibles :* retour à (b) avec « Les données de l'équipe sont illisibles. Recréez l'équipe. » **[à valider]**.
  - *Succès :* présentation complète.

### Écran (d) : Préparation de la Daily

- **But :** choisir pour cette Daily le temps de parole de chaque membre et l'ordre de passage.
- **Éléments :**
  - titre « Préparer la Daily » et nom de l'équipe ;
  - sélecteur « Appliquer à tous » au-dessus de la liste : choisir une valeur la règle pour tous les membres ; les valeurs restent modifiables ensuite ;
  - pour chaque membre, une liste « Temps de parole » de 1 à 5 minutes, dans l'ordre de l'équipe ;
  - choix d'ordre (boutons radio) : « Ordre de l'équipe » (sélectionné par défaut) ou « Ordre aléatoire », un seul actif ;
  - bouton principal « Commencer la Daily » ; lien « Annuler » (→ c).
- **Actions :** régler le temps de chaque membre, choisir l'ordre, commencer, annuler.
- **États :**
  - *Pré-rempli :* chaque membre à 2 minutes ; ordre de l'équipe sélectionné.
  - *Pas d'erreur possible :* chaque liste propose toujours une valeur valide.
  - *Succès :* « Commencer la Daily » ouvre (e), le chronomètre démarre, et le tirage a lieu si l'ordre aléatoire est choisi.
- **Règle :** ces choix ne sont enregistrés ni dans l'équipe ni pour la Daily suivante.

### Écran (e) : Daily (chronomètre)

- **But :** suivre le temps de parole du membre courant, passer les membres, terminer la Daily.
- **Éléments :**
  - nom d'équipe et mode d'ordre (« Ordre de l'équipe » ou « Ordre aléatoire ») ; en ordre aléatoire, l'ordre tiré est affiché ;
  - prénom du membre courant et grand décompte « mm:ss » ;
  - « Temps prévu : 2:00 » (temps alloué au membre courant) ;
  - liste compacte de l'ordre de passage : le membre courant est mis en évidence ; un membre passé porte la mention « passé » ; un membre qui a parlé porte la mention « fait » ;
  - bouton principal « Suivant », qui devient « Terminer la Daily » au dernier membre (S26) ;
  - bouton « Passer ce membre » ;
  - bouton secondaire « Arrêter la Daily » ;
  - en pause uniquement : bandeau « Daily en pause » et bouton principal « Reprendre la Daily ».
- **Actions :** Suivant, Passer ce membre, Terminer la Daily, Arrêter la Daily, Reprendre la Daily (en pause).
- **Comportement :**
  - Le chronomètre démarre au clic sur « Commencer la Daily » (d), jamais à l'ouverture de (e) ni à l'affichage de (d).
  - Le décompte du membre courant part de son temps alloué.
  - « Suivant » enregistre le temps parlé du membre courant, passe au membre suivant non passé selon l'ordre choisi, et le décompte repart de son temps alloué.
  - « Passer ce membre » marque le membre comme passé, sans temps. Si c'est le membre qui parle, la parole passe immédiatement au membre suivant non passé.
  - Le temps non utilisé est perdu.
  - L'ordre tiré, s'il est aléatoire, reste fixe pendant toute la Daily.
  - Le décompte est figé pendant qu'un dialogue est ouvert.
- **États :**
  - *En cours :* décompte visible, mis à jour au moins une fois par seconde.
  - *Dépassement :* au-delà du temps alloué, le décompte passe à 00:00 puis devient négatif : « +mm:ss », en rouge, avec le texte « Temps dépassé ». Il continue jusqu'à ce que l'organisateur appuie sur « Suivant » (ou « Passer ce membre » sur le membre qui parle).
  - *En pause :* après rechargement ou réouverture (S27). Le décompte est figé jusqu'à « Reprendre la Daily ».
  - *Fin :* « Terminer la Daily » ouvre (f).

### Écran (f) : Bilan de la Daily

- **But :** voir ce qui s'est passé pendant la Daily, le copier, revenir à l'équipe.
- **Éléments :**
  - titre « Bilan de la Daily » et nom d'équipe ;
  - un bloc par membre, dans l'ordre de passage effectif (ordre tiré s'il est aléatoire), avec : prénom ; statut (« parlé » ou « passé ») ; temps réellement parlé « mm:ss » ; temps alloué « mm:ss » ; dépassement « +mm:ss » ou « — » ;
  - bouton « Copier le bilan » (secondaire) ;
  - bouton principal « Retour à l'équipe ».
- **Définitions :**
  - *Temps réellement parlé :* durée du tour, pause exclue, jusqu'au clic sur « Suivant », « Passer ce membre » ou « Terminer la Daily ».
  - *Membre passé :* statut « passé », temps « — ». Il ne reçoit aucun temps.
- **Texte copié :** titre « Daily : {équipe}, {date} », puis une ligne par membre : « {Prénom} : {parlé} parlé, {alloué} alloué, +{dépassement} de dépassement », ou « {Prénom} : passé ». Les membres sans dépassement n'affichent pas la partie dépassement.
- **États :**
  - *Copié :* message « Bilan copié. ».
  - *Échec de copie :* message « Copie impossible : sélectionnez le texte du bilan. ». Le texte reste sélectionnable.
- **Règle :** le bilan n'est pas enregistré. Quitter (f) l'efface.

### Dialogue 2.5 : Supprimer l'équipe (depuis a)

- **Titre :** « Supprimer l'équipe « {nom} » ? »
- **Texte :** « Les {N} membres de l'équipe seront supprimés. Cette action est définitive. »
- **Boutons :** « Annuler » (focus par défaut) ; « Supprimer l'équipe » (action destructive).
- **Suite :** « Annuler » ferme sans rien supprimer. « Supprimer l'équipe » supprime l'équipe et la liste se met à jour.

### Dialogue 2.6 : Enregistrer la modification (depuis b, en modification)

- **Titre :** « Enregistrer la modification ? »
- **Texte :** « Cette modification retire {prénoms} de l'équipe. » Les prénoms retirés sont listés.
- **Boutons :** « Revenir » (focus par défaut) ; « Enregistrer » (action principale).
- **Suite :** « Enregistrer » enregistre et affiche (c). « Revenir » reste sur (b) sans rien perdre.

### Dialogue 2.7 : Arrêter la Daily (depuis e)

- **Titre :** « Arrêter la Daily ? »
- **Texte :** « La Daily sera arrêtée. Elle n'est pas conservée. »
- **Boutons :** « Continuer » (focus par défaut) puis « Arrêter ».
- **Suite :** « Arrêter » efface la Daily et affiche (c) de la même équipe. « Continuer » ferme le dialogue, la Daily reprend sans perte de temps.

### Dialogue 2.8 : Quitter la Daily (garde de sortie, depuis e)

- **Déclenchement :** retour arrière du navigateur ou geste de retour sur mobile, ou tout changement d'écran qui ne vient pas d'un bouton de (e).
- **Titre :** « Quitter la Daily ? »
- **Texte :** « La Daily sera arrêtée et sa progression perdue. »
- **Boutons :** « Continuer » (focus par défaut) puis « Arrêter ».
- **Suite :** « Continuer » reste sur (e) et annule la navigation. « Arrêter » efface la Daily et poursuit la navigation vers l'écran précédent.
- **Hors garde :** fermer ou recharger l'onglet n'affiche pas ce dialogue. La reprise de S27 s'applique.

---

## 3. Règles

### 3.1 Règles du brief initial, conservées

| Champ | Règle | Message proposé |
|---|---|---|
| Nom d'équipe | Obligatoire (espaces seuls = vide) | « Donnez un nom à votre équipe. » |
| Nom d'équipe | 50 caractères maximum | « Le nom d'équipe ne dépasse pas 50 caractères. » |
| Membres | Au moins 2 pour démarrer une Daily | « Ajoutez au moins 2 membres pour démarrer. » |
| Membres | Maximum 15 | « Une équipe ne peut pas dépasser 15 membres. » |
| Prénom | Obligatoire | « Saisissez un prénom. » |
| Prénom | 30 caractères maximum | « Le prénom ne dépasse pas 30 caractères. » |
| Prénom | Pas de doublon dans l'équipe : insensible à la casse, sensible aux accents (« Léa » et « lea » ne sont pas des doublons ; « Thomas » et « thomas » le sont). Contrôlé à l'ajout (décision 17). | « Ce prénom existe déjà dans l'équipe. » |

Les règles de longueur (50 et 30 caractères) et de doublon sont confirmées par le client comme inchangées.

### 3.2 Règles de saisie

- **Ordre de traitement d'un prénom à l'ajout :**
  1. retrait des espaces en début et fin, réduction des espaces multiples à un seul **[à valider]** ;
  2. mise en majuscule de la première lettre, le reste inchangé (décision B) ;
  3. contrôles : obligatoire, 30 caractères, caractères autorisés, doublon.
- **Caractères autorisés dans un prénom :** lettres, espaces, traits d'union et apostrophes seulement **[à valider]**.
- **Doublons :** contrôlés à chaque ajout (décision 17). Au chargement, rien n'est dédoublonné : une équipe déjà enregistrée avec un doublon est affichée telle quelle.
- **Équipe enregistrée avec une ancienne durée :** la durée est supprimée et n'est pas affichée **[à valider]**.

### 3.3 Temps de parole par membre (écran d)

| Règle | Valeur | Statut |
|---|---|---|
| Valeurs proposées | 1, 2, 3, 4 ou 5 minutes (entiers) | Client (décision 12) |
| Valeur par défaut | 2 minutes pour chaque membre | Client (décision 12) |
| Portée | Propre à la Daily : rien n'est enregistré dans l'équipe | Client |
| Temps non utilisé | Perdu : le membre suivant repart de son temps alloué | Client (décision 4) |
| Dépassement | Décompte négatif qui continue jusqu'à « Suivant » | Client (décision 3) |

### 3.4 Ordre de passage (écran d)

| Règle | Comportement | Statut |
|---|---|---|
| Choix | « Ordre de l'équipe » (ordre de saisie) ou « Ordre aléatoire ». Choix fait à chaque Daily | Client |
| Défaut | « Ordre de l'équipe » à chaque nouvelle préparation | Client (décision 13) |
| Tirage | Tirage aléatoire de tous les membres au clic sur « Commencer la Daily ». L'ordre tiré est fixe pendant la Daily, y compris après reprise | Client |
| Passage | Suit l'ordre choisi : ordre de saisie, ou ordre tiré | Client |
| Ordre de l'équipe | Non modifié : ni le tirage, ni la Daily ne changent l'ordre enregistré | Conséquence de « rien n'est enregistré » |

### 3.5 Passer un membre (écran e)

- Possible pour le membre qui parle et pour chaque membre à venir non encore passé. Impossible pour un membre déjà fait ou déjà passé. Client (décision 11).
- Le membre passé ne compte pas : aucun temps ne lui est attribué. Client.
- Si le membre passé est celui qui parle, la parole passe immédiatement au membre suivant non passé, avec son temps alloué. Conséquence de la décision 11.
- Le membre passé reste dans la liste de (e) avec la mention « passé », et apparaît dans le bilan (f). Client (décision 6).
- Un membre passé ne peut pas être repris dans la même Daily **[à valider]**.

### 3.6 Fin de la Daily

- La Daily ne se termine que sur « Terminer la Daily ». Client (décision 2).
- « Terminer la Daily » remplace « Suivant » dès qu'il n'y a plus aucun membre à venir non passé. Conséquence de la décision 2 : les membres passés en fin de liste ne bloquent pas la fin.
- Un clic sur « Terminer la Daily » enregistre le temps parlé du membre courant, puis ouvre le bilan (f).
- Une Daily terminée n'est pas conservée : rien ne subsiste après (f).

### 3.7 Arrêt, retour arrière et reprise

- **Arrêt :** confirmation obligatoire (dialogue 2.7). Une Daily arrêtée n'est pas conservée. Client (décision 8).
- **Retour arrière :** garde de sortie (dialogue 2.8). La progression n'est perdue que si l'organisateur confirme. Client (décision 9).
- **Reprise :** une Daily en cours est enregistrée au fil de l'eau. À la réouverture, elle reprend en pause : même membre, même temps restant, même ordre, même statut passé ou fait. Rien ne repart seul ; l'organisateur clique « Reprendre la Daily ». Le temps écoulé pendant la fermeture ou le rechargement ne compte pas. Client (décision 5).
- **Précision de reprise :** le temps restant à la réouverture est celui du dernier enregistrement. L'enregistrement doit être assez fréquent pour que la perte soit d'une seconde au plus. Conséquence de la décision 5.

---

## 4. Stories

Les stories sont numérotées S1 à S30. Chaque titre indique son statut : *(inchangée)*, *(modifiée)* ou *(nouvelle)*.

### Écran (a) : Mes équipes

**S1. Ouvrir l'application sur mes équipes.** *(modifiée)* En tant que Scrum Master, je retrouve mes équipes dès l'ouverture.
- Si au moins une équipe est enregistrée et qu'aucune Daily n'est en cours, l'application ouvre (a).
- Sans équipe enregistrée, l'application ouvre (b).
- Si une Daily est en cours, l'application ouvre (e) en pause (S27).
- Chaque équipe de la liste affiche son nom et son nombre de membres.
- Le bouton « Nouvelle équipe » est visible et principal.

**S2. Ouvrir une équipe depuis la liste.** *(inchangée)* En tant que Scrum Master, je choisis l'équipe à préparer.
- Le bouton « Ouvrir » de chaque équipe ouvre l'écran (c) de cette équipe.
- L'équipe affichée est celle choisie, sans mélange avec une autre.
- Revenir à Mes équipes depuis (c) par le lien « Mes équipes » **[à valider]**.

**S19. Trier Mes équipes.** *(nouvelle)* En tant que Scrum Master, je retrouve mes équipes dans un ordre prévisible.
- La liste est triée par ordre alphabétique (décision 15).
- Une équipe créée ou renommée est repositionnée dans la liste.

**S20. Espacer le bouton « Nouvelle équipe ».** *(nouvelle)* En tant que Scrum Master, je distingue le bouton de la liste.
- Un espace de 16 px sépare le bouton « Nouvelle équipe » de la liste, sur ordinateur comme sur téléphone.
- L'espace est présent même quand la liste est courte.

**S21. Supprimer une équipe.** *(nouvelle)* En tant que Scrum Master, je retire une équipe qui n'existe plus.
- Chaque équipe de (a) a un bouton « Supprimer ».
- Le clic ouvre le dialogue 2.5, avec le nom de l'équipe et le nombre de membres. Le texte indique que l'action est définitive.
- « Annuler » (focus par défaut) ne supprime rien ; « Supprimer l'équipe » supprime l'équipe et ses membres, puis la liste se met à jour.
- Supprimer la dernière équipe affiche (b).

### Écran (b) : Création et modification d'équipe

**S3. Saisir le nom d'équipe et les membres.** *(modifiée)* En tant que Scrum Master, je crée mon équipe avec son nom et ses membres, sans durée.
- L'écran (b) ne contient ni champ « Durée de la Daily » ni message de durée.
- Taper un prénom puis Entrée, ou cliquer « Ajouter », place le membre en fin de liste.
- Le prénom est mis en majuscule à l'ajout (S23).
- Le champ prénom se vide et reprend le focus après chaque ajout.
- Un prénom vide est refusé avec « Saisissez un prénom. ».

**S4. Suivre et corriger la liste des membres.** *(inchangée)* En tant que Scrum Master, je vois combien de membres sont saisis et je peux en retirer.
- Le compteur « N membres » se met à jour à chaque ajout et à chaque suppression.
- Chaque membre a un bouton « Supprimer » qui retire la ligne sans enregistrer.
- Au 15e membre, le champ d'ajout est désactivé avec le message de maximum.
- Le compteur est annoncé par les lecteurs d'écran à chaque changement.

**S5. Valider avant enregistrement.** *(modifiée)* En tant que Scrum Master, je suis guidé quand une règle n'est pas respectée.
- « Enregistrer l'équipe » reste désactivé si le nom est vide ou si moins de 2 membres sont saisis.
- Un doublon est refusé dès l'ajout (S24).
- Un nom ou un prénom au-delà de sa limite (50 ou 30 caractères) est refusé avec son message.
- À la tentative d'enregistrement avec une erreur, le focus va sur le premier champ fautif.

**S6. Enregistrer et voir la présentation.** *(inchangée)* En tant que Scrum Master, je valide mon équipe et je vérifie son affichage.
- Enregistrer une équipe valide affiche l'écran (c) avec le nom et la liste des membres.
- La liste respecte l'ordre de saisie.
- L'équipe enregistrée apparaît dans Mes équipes.

**S7. Modifier une équipe enregistrée.** *(modifiée)* En tant que Scrum Master, je corrige un nom ou un membre sans tout ressaisir.
- « Modifier l'équipe » ouvre l'écran (b) prérempli avec le nom et les membres de l'équipe.
- Enregistrer sans retirer de membre met à jour (c) et Mes équipes.
- Enregistrer en retirant un membre ouvre d'abord le dialogue de S22.
- « Annuler » ou Échap ferme (b) sans rien modifier.

**S22. Confirmer le retrait de membres à l'enregistrement.** *(nouvelle)* En tant que Scrum Master, je ne retire pas un membre par erreur.
- Si l'enregistrement retire un ou plusieurs membres de l'équipe enregistrée, le dialogue 2.6 s'affiche avant l'enregistrement, avec les prénoms retirés.
- « Enregistrer » enregistre et affiche (c). « Revenir » reste sur (b), sans rien perdre.
- Un ajout ou un renommage ne déclenche pas ce dialogue.

**S23. Majuscule au prénom.** *(nouvelle)* En tant que Scrum Master, je n'ai pas à corriger la casse de chaque prénom saisi.
- À l'ajout, la première lettre du prénom passe en majuscule ; le reste n'est pas modifié (« jean-pierre » devient « Jean-pierre » ; « élodie » devient « Élodie »).
- La forme mise en majuscule est stockée et affichée partout.
- Les prénoms déjà enregistrés ne sont pas modifiés.
- Le contrôle de doublon (S24) porte sur la forme mise en majuscule.

**S24. Refuser les doublons à la saisie.** *(nouvelle)* En tant que Scrum Master, je suis prévenu tout de suite d'un prénom déjà présent.
- Un prénom qui existe déjà dans l'équipe est refusé dès l'ajout, avec « Ce prénom existe déjà dans l'équipe. ». Insensible à la casse, sensible aux accents : « thomas » après « Thomas » est refusé, « Léa » après « Lea » est accepté.
- Le membre n'est pas ajouté, et la saisie reste dans le champ pour correction.
- Au chargement, rien n'est dédoublonné : une équipe déjà enregistrée avec un doublon est affichée telle quelle.

### Écran (c) : Présentation de l'équipe

**S8. Vérifier l'équipe avant la Daily.** *(modifiée)* En tant que Scrum Master, je contrôle l'équipe avant de la lancer.
- (c) affiche le nom de l'équipe, le nombre de membres et la liste dans l'ordre de saisie.
- Le bouton « Démarrer une Daily » est visible et principal.
- Avec moins de 2 membres, « Démarrer une Daily » est désactivé avec « Ajoutez au moins 2 membres pour démarrer. ».
- Le bouton « Modifier l'équipe » est présent, ainsi que le lien « Mes équipes » **[à valider]**.

**S9. Retrouver mes équipes au rechargement.** *(inchangée)* En tant que Scrum Master, je n'ai pas à ressaisir mes équipes chaque jour.
- Après rechargement de la page, Mes équipes affiche les mêmes équipes.
- Après fermeture et réouverture du navigateur, les équipes sont toujours là.
- Les données sont lues et écrites uniquement dans le stockage local du navigateur (aucun appel réseau).

### Écran (d) : Préparation de la Daily

**S10. Choisir le temps de parole de chaque membre.** *(modifiée)* En tant que Scrum Master, je règle le temps de parole de chacun pour cette Daily.
- Chaque membre a une liste de 1 à 5 minutes, réglée à 2 minutes par défaut.
- Le réglage ne modifie pas l'équipe : il n'est gardé ni dans l'équipe, ni pour la Daily suivante.
- « Appliquer à tous » règle la même valeur pour chaque membre ; les valeurs restent modifiables ensuite.

**S11. Choisir l'ordre de passage.** *(modifiée)* En tant que Scrum Master, je décide si la Daily suit l'ordre de l'équipe ou un ordre aléatoire.
- Les choix « Ordre de l'équipe » et « Ordre aléatoire » sont présentés, un seul actif à la fois.
- « Ordre de l'équipe » est sélectionné par défaut.
- Mon choix ne change pas l'ordre enregistré de l'équipe, et il n'est pas gardé pour la Daily suivante.

**S12. Lancer la Daily depuis la préparation.** *(modifiée)* En tant que Scrum Master, je confirme mes réglages et lance la Daily.
- « Commencer la Daily » ouvre (e) avec la liste et le mode d'ordre choisis, et le chronomètre démarre.
- Le tirage aléatoire, s'il est choisi, a lieu à ce clic, et l'ordre tiré est affiché dans (e).
- « Annuler » revient à (c) sans rien lancer.

### Écran (e) : Daily

**S13. Démarrer le chronomètre au clic.** *(modifiée)* En tant que Scrum Master, je lance le chronomètre quand je le décide.
- Le décompte part du temps alloué au premier membre (2 minutes par défaut) au clic sur « Commencer la Daily ».
- Le chronomètre ne démarre jamais à l'ouverture de (e) ni à l'affichage de (d). Une Daily rouverte est en pause (S27).
- Le prénom du membre courant et son temps prévu sont affichés en grand.
- Le décompte « mm:ss » est mis à jour au moins une fois par seconde.
- Le bouton « Arrêter la Daily » est présent dans le même écran.

**S14. Passer au membre suivant.** *(modifiée)* En tant que Scrum Master, je passe la parole au membre suivant.
- « Suivant » passe la parole au membre suivant non passé, selon l'ordre choisi.
- Le décompte repart du temps alloué au nouveau membre ; le temps non utilisé est perdu.
- Le membre qui a parlé reste dans la liste avec la mention « fait ».
- Quand il ne reste aucun membre à venir non passé, « Suivant » devient « Terminer la Daily » (S26).

**S15. Passer un membre.** *(modifiée)* En tant que Scrum Master, je saute un membre absent sans qu'il consomme du temps.
- « Passer ce membre » est disponible pour le membre qui parle et pour chaque membre à venir non passé. Il n'est pas proposé pour un membre déjà fait ou passé.
- Le membre passé porte la mention « passé » dans la liste et ne reçoit aucun temps.
- Si le membre passé est celui qui parle, la parole passe immédiatement au membre suivant non passé, avec son temps alloué.
- Un membre passé ne peut pas être repris dans la même Daily **[à valider]**.

**S16. Laisser courir et signaler le dépassement.** *(modifiée)* En tant que Scrum Master, je vois quand le temps du membre courant est dépassé, sans que la Daily avance toute seule.
- Au-delà du temps alloué, le décompte passe à 00:00 puis devient négatif : « +mm:ss » en rouge, avec le texte « Temps dépassé » lu par les lecteurs d'écran.
- La couleur ne suffit pas seule : le texte est présent.
- Le décompte continue en dépassement jusqu'à « Suivant » (ou « Passer ce membre » sur le membre qui parle).
- « Suivant » remet le décompte à zéro pour le membre suivant.

**S17. Arrêter la Daily.** *(modifiée)* En tant que Scrum Master, je peux arrêter la Daily à tout moment, en confirmant.
- « Arrêter la Daily » ouvre le dialogue 2.7. Le décompte est figé pendant que le dialogue est ouvert.
- « Arrêter » efface la Daily et affiche (c) de la même équipe. Aucune Daily n'est conservée.
- « Continuer » ferme le dialogue, et la Daily reprend sans perte de temps.

**S26. Terminer la Daily.** *(nouvelle)* En tant que Scrum Master, je clôture la Daily quand toute l'équipe a parlé.
- La Daily ne se termine jamais toute seule : seul « Terminer la Daily » la termine (décision 2).
- « Terminer la Daily » n'apparaît qu'au dernier membre à venir (plus aucun membre à venir non passé).
- Le clic enregistre le temps parlé du membre courant, puis ouvre le bilan (f).
- Rien de la Daily n'est conservé après le bilan.

**S27. Reprendre une Daily après rechargement ou fermeture.** *(nouvelle)* En tant que Scrum Master, je retrouve ma Daily là où elle en était si la page a été rechargée ou fermée.
- Pendant qu'une Daily tourne, son état est enregistré au fil de l'eau dans le navigateur.
- À la réouverture, l'application ouvre (e) avec le même membre, le même temps restant, le même ordre tiré, et les mentions « passé » et « fait » inchangées.
- La Daily est en pause : bandeau « Daily en pause » et bouton « Reprendre la Daily ». Rien ne repart seul.
- Le temps écoulé pendant la fermeture ou le rechargement ne compte pas.
- En pause, « Suivant », « Passer ce membre » et « Terminer la Daily » restent disponibles. Le décompte du membre courant reste figé jusqu'à « Reprendre la Daily ».

**S28. Garde de sortie pendant la Daily.** *(nouvelle)* En tant que Scrum Master, je ne quitte pas une Daily par erreur.
- Le retour arrière (bouton ou geste mobile), ou tout changement d'écran qui ne vient pas d'un bouton de (e), ouvre le dialogue 2.8 au lieu de quitter. Le décompte est figé.
- « Continuer » reste sur (e) et annule la navigation.
- « Arrêter » efface la Daily, progression perdue, et poursuit la navigation vers l'écran précédent.
- Fermer ou recharger l'onglet n'ouvre pas ce dialogue : S27 s'applique.

### Écran (f) : Bilan

**S29. Voir le bilan de la Daily.** *(nouvelle)* En tant que Scrum Master, je vérifie ce qui s'est passé à la fin de la Daily.
- (f) affiche, pour chaque membre et dans l'ordre de passage : le prénom, le statut (« parlé » ou « passé »), le temps réellement parlé, le temps alloué, et le dépassement (« +mm:ss » ou « — »).
- Un membre passé affiche « passé » et « — » pour les temps.
- Le bilan n'est pas enregistré : quitter (f) l'efface **[à valider]** (voir section 6, point 8).

**S30. Copier le bilan et revenir à l'équipe.** *(nouvelle)* En tant que Scrum Master, je partage le bilan et je reviens à l'équipe.
- « Copier le bilan » copie un texte : une ligne de titre « Daily : {équipe}, {date} », puis une ligne par membre.
- Un confirme « Bilan copié. ». En cas d'échec, « Copie impossible : sélectionnez le texte du bilan. », et le texte reste sélectionnable.
- « Retour à l'équipe » ouvre (c) de la même équipe.

### Transverse

**S18. Interface responsive et accessible.** *(modifiée)* En tant que Scrum Master, je travaille confortablement sur ordinateur comme sur téléphone.
- Mise en page utilisable de 320 px à 1920 px, sans défilement horizontal à 320 px, avec une marge latérale de 16 px sur mobile.
- Les boutons ont une zone cliquable d'au moins 44 x 44 px, et le focus clavier est visible.
- Fond gris très clair, surfaces blanches, typographie soignée ; états survol, focus, appui et désactivé définis ; les animations sont coupées si l'utilisateur réduit les mouvements.
- Aucune donnée n'est envoyée hors du navigateur.

**S25. Mode sombre automatique.** *(nouvelle)* En tant que Scrum Master, j'utilise l'application avec le thème de mon système.
- Les couleurs suivent le réglage système (prefers-color-scheme), clair ou sombre. Aucun bouton de bascule en V1.
- Tous les écrans et dialogues ont les deux versions, avec des contrastes au moins équivalents (texte, boutons, mentions « passé », « fait », dépassement).
- Un changement du réglage système pendant l'utilisation adapte l'affichage sans rechargement.

### Critères devenus caducs, retirés en v3

- S5 : « un doublon est refusé au moment de l'enregistrement » (remplacé par S24).
- S10 : « une valeur absente désactive "Commencer la Daily" » (la liste propose toujours une valeur valide) ; le message d'erreur lié au membre (remplacé par la règle sans erreur possible).
- S14 : « le membre quitté a le statut "fait" [à valider] » (libellé désormais retenu, sans marqueur).
- S17 : « aucune Daily enregistrée [à valider] » et « confirmation à valider » (décidées : décisions 8 et 9).
- Libellé « Passer au suivant » (remplacé par « Suivant »).
- Hors périmètre : « Bilan de fin de Daily », « Suppression d'équipe », « Historique des Daily » (voir section 5).

---

## 5. Hors périmètre

**Exclu par le client :**
- Compte utilisateur et authentification.
- Backend, synchronisation entre appareils.
- Répartition manuelle du temps entre membres (le temps par membre est choisi au lancement de chaque Daily, sans répartition manuelle).
- Historique des Daily : pas d'historique en V1 (décisions 6 et 8).

**Entrent dans le périmètre en v3 :**
- Bilan de fin de Daily et copie du bilan (décision 6).
- Suppression d'équipe depuis « Mes équipes », avec confirmation (décision 7).
- Mode sombre automatique, majuscule automatique des prénoms, espace sous « Nouvelle équipe » (demandes A à C).
- Reprise d'une Daily après rechargement ou fermeture, en pause (décision 5).

**Retiré du PRD Timer pour alléger le périmètre [à valider] :**
- Pause manuelle pendant la Daily (la pause automatique après reprise est dans le périmètre, décision 5), choix d'un membre pour parler (hors « Passer ce membre »).
- Export et import JSON, réinitialisation de l'application, réglage du son d'alerte.
- Installation PWA et fonctionnement hors ligne spécifique.

---

## 6. Points [à valider] restants

Les décisions 1 à 17 et les demandes A à C sont tranchées. Il reste les points suivants, non tranchés par le client :

1. **(b) Annuler en création.** Ramène à (a) s'il existe au moins une équipe, sinon le lien n'est pas affiché.
2. **(c) Lien « Mes équipes ».** Présent ou non sur (c).
3. **(c) Données illisibles.** Message « Les données de l'équipe sont illisibles. Recréez l'équipe. » et retour à (b).
4. **(b) Caractères d'un prénom.** Lettres, espaces, traits d'union et apostrophes seulement.
5. **(b) Espaces.** Retrait en début et fin, et réduction des espaces multiples.
6. **Ancienne durée.** Une équipe enregistrée avec une durée perd cette durée, sans l'afficher.
7. **Membre passé.** Ne peut pas être repris dans la même Daily.
8. **Bilan après rechargement.** Proposition : le bilan est perdu si la page est rechargée ou fermée sur (f), puisque rien n'est conservé.
9. **Périmètre retiré.** Pause manuelle, choix d'un membre pour parler, export et import JSON, réinitialisation, réglage du son, PWA et hors ligne (section 5).
