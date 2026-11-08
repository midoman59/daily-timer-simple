# Brief : Daily Timer Simple

- Date : 2026-11-09
- Statut : brouillon à valider par le client
- Source : PRD « Scrum Speaking Timer » (C:\Projects\Timer), réduit à l'essentiel
- Marqueur : **[à valider]** = règle ou choix absent du brief initial, à confirmer

---

## 1. Objectif et public

**Objectif.** Un Scrum Master crée son équipe une seule fois, vérifie la présentation de l'équipe, puis lance une Daily chronométrée en un clic. L'application est locale : aucun compte, aucun serveur, les données restent dans le navigateur.

**Public.**
- Scrum Master (utilisateur principal) : crée l'équipe et lance la Daily, souvent depuis un ordinateur partagé à l'écran.
- Membres de l'équipe : lisent le chronomètre sur l'écran partagé. Ils n'ont aucune saisie à faire.

**Principe directeur.** Une action principale par écran. Rien n'est demandé qui ne soit nécessaire. L'écran de chronomètre n'est jamais l'écran d'entrée.

**Parcours.** Écran 1 (équipe) → Écran 2 (présentation) → Écran 3 (Daily). À l'ouverture, si une équipe est enregistrée, l'écran 2 s'affiche ; sinon, l'écran 1.

---

## 2. Les trois écrans

### Écran 1 : Créer ou modifier l'équipe

- **But :** saisir l'équipe une fois.
- **Éléments :** titre ; champ « Nom d'équipe » ; champ « Durée de la Daily » (minutes) ; champ « Prénom » avec bouton « Ajouter » (Entrée valide aussi) ; liste ordonnée des membres, un bouton « Supprimer » par ligne ; compteur « N membres » ; bouton principal « Enregistrer l'équipe » ; lien « Annuler » (en modification seulement).
- **Actions :** saisir, ajouter un membre, supprimer un membre avant enregistrement, enregistrer.
- **États :**
  - *Vide :* aucun membre, compteur « 0 membre », texte « Ajoutez au moins 2 membres pour continuer. », bouton désactivé.
  - *Erreur :* message lié au champ fautif (lu par les lecteurs d'écran) ; à l'enregistrement, le focus va sur la première erreur ; à 15 membres, le champ « Prénom » est désactivé avec le message « Une équipe ne peut pas dépasser 15 membres. »
  - *Succès :* l'équipe est enregistrée et l'écran 2 s'affiche.

### Écran 2 : Présentation de l'équipe

- **But :** vérifier l'équipe et la lancer.
- **Éléments :** nom d'équipe (titre) ; durée de la Daily ; nombre de membres ; liste des membres dans l'ordre de saisie ; bouton principal « Démarrer une Daily » ; bouton secondaire « Modifier l'équipe ».
- **Actions :** démarrer une Daily, modifier l'équipe.
- **États :**
  - *Vide :* aucune équipe enregistrée → redirection vers l'écran 1 sans message.
  - *Erreur :* moins de 2 membres (équipe incomplète) → bouton « Démarrer une Daily » désactivé avec le texte « Ajoutez au moins 2 membres pour démarrer. » Données illisibles → retour à l'écran 1 avec « Les données de l'équipe sont illisibles. Recréez l'équipe. » **[à valider]**
  - *Succès :* présentation complète ; le clic sur « Démarrer une Daily » ouvre l'écran 3.

### Écran 3 : Daily (chronomètre)

- **But :** suivre le temps de la Daily en cours.
- **Éléments :** nom d'équipe ; grand décompte « mm:ss » ; durée prévue ; liste compacte des membres ; bouton secondaire « Arrêter la Daily ».
- **Actions :** arrêter la Daily, qui ramène à l'écran 2. Pas de pause ni de choix de membre.
- **Comportement :** le chronomètre démarre au clic sur « Démarrer une Daily », avec la durée et les membres configurés. Il ne démarre jamais à l'ouverture.
- **États :**
  - *En cours :* décompte visible, mis à jour au moins une fois par seconde.
  - *Dépassement :* au-delà de la durée, le décompte passe en rouge avec le texte « Temps dépassé » et « +mm:ss ». La couleur ne suffit pas seule. **[à valider]** : comportement exact après la durée (le décompte continue ou s'arrête).
  - *Arrêtée :* retour à l'écran 2. **[à valider]** : confirmation demandée avant l'arrêt (« Arrêter la Daily ? » / « Arrêter » et « Continuer »).

---

## 3. Règles de validation

### 3.1 Règles du brief initial

| Champ | Règle | Message proposé |
|---|---|---|
| Nom d'équipe | Obligatoire (espaces seuls = vide) | « Donnez un nom à votre équipe. » |
| Durée | Entier entre 1 et 120 minutes | « Indiquez la durée de la Daily. » / « Saisissez un nombre entier de minutes. » / « La durée doit être comprise entre 1 et 120 minutes. » |
| Membres | Au moins 2 pour démarrer | « Ajoutez au moins 2 membres pour démarrer. » |
| Prénom | Obligatoire | « Saisissez un prénom. » |
| Prénom | Pas de doublon dans l'équipe | « Ce prénom existe déjà dans l'équipe. » |
| Membres | Maximum 15 | « Une équipe ne peut pas dépasser 15 membres. » |

### 3.2 Règles ajoutées, absentes du brief initial

- Durée par défaut de 15 minutes à la création. **[à valider]**
- Nom d'équipe limité à 50 caractères. **[à valider]**
- Prénom limité à 30 caractères, avec lettres, espaces, traits d'union et apostrophes seulement. **[à valider]**
- Espaces en début et fin retirés avant validation ; espaces multiples réduits à un seul. **[à valider]**
- Doublon insensible à la casse, sensible aux accents (« Léa » et « Lea » ne sont pas des doublons). **[à valider]**
- Durée divisée par le nombre de membres au moins égale à 30 secondes, sinon l'enregistrement est bloqué. **[à valider]**

---

## 4. Stories

**S1. Saisir le nom et la durée de l'équipe.** En tant que Scrum Master, je renseigne le nom et la durée pour créer mon équipe.
- Les champs « Nom d'équipe » et « Durée de la Daily » sont présents à l'écran 1.
- La durée est pré-remplie à 15 **[à valider]**.
- Saisir « 7,5 » affiche le message de durée non entière.

**S2. Ajouter des membres par prénom.** En tant que Scrum Master, j'ajoute mes membres un par un.
- Taper un prénom puis Entrée, ou cliquer « Ajouter », place le membre en fin de liste.
- Le champ se vide et reprend le focus après chaque ajout.
- Un prénom vide est refusé avec « Saisissez un prénom. »

**S3. Suivre le nombre de membres.** En tant que Scrum Master, je vois en temps réel combien de membres sont saisis.
- Le compteur « N membres » se met à jour à chaque ajout et à chaque suppression.
- Au 15e membre, le champ d'ajout est désactivé avec le message de maximum.
- Le compteur est lu par les lecteurs d'écran à chaque changement.

**S4. Retirer un membre avant enregistrement.** En tant que Scrum Master, je corrige ma liste avant de l'enregistrer.
- Chaque membre a un bouton « Supprimer ».
- La suppression retire la ligne et décrémente le compteur, sans enregistrer.
- Après suppression, le membre peut être ajouté de nouveau.

**S5. Valider les champs obligatoires.** En tant que Scrum Master, je suis guidé quand une règle n'est pas respectée.
- « Enregistrer l'équipe » reste désactivé si le nom est vide, si moins de 2 membres sont saisis ou si la durée est invalide.
- Un doublon, par exemple « thomas » après « Thomas », est refusé avec son message.
- Si l'enregistrement est tenté avec une erreur, le focus va sur le premier champ fautif.

**S6. Enregistrer l'équipe et voir sa présentation.** En tant que Scrum Master, je valide mon équipe et vérifie ce qui sera utilisé.
- Enregistrer une équipe valide affiche l'écran 2 avec le nom, la durée, le nombre de membres et la liste.
- La liste respecte l'ordre de saisie.
- Le bouton « Démarrer une Daily » est visible et principal.

**S7. Retrouver l'équipe au rechargement.** En tant que Scrum Master, je n'ai pas à ressaisir mon équipe chaque jour.
- Après rechargement de la page, l'écran 2 affiche la même équipe, sans ressaisie.
- Après fermeture et réouverture du navigateur, l'équipe est toujours là.
- Les données sont lues et écrites uniquement dans le stockage local du navigateur (aucun appel réseau).

**S8. Modifier l'équipe enregistrée.** En tant que Scrum Master, je corrige un prénom ou la durée sans tout ressaisir.
- « Modifier l'équipe » ouvre l'écran 1 prérempli avec l'équipe enregistrée.
- Enregistrer les changements met à jour l'écran 2.
- « Annuler » ferme l'écran 1 sans rien modifier.

**S9. Démarrer une Daily.** En tant que Scrum Master, je lance la Daily en un clic, avec l'équipe configurée.
- Le clic sur « Démarrer une Daily » ouvre l'écran 3, et le chronomètre part à ce moment-là seulement.
- Le décompte initial correspond à la durée configurée (15 minutes donnent « 15:00 ») et la liste des membres est affichée.
- Au dépassement, « Temps dépassé » et « +mm:ss » apparaissent en texte et en rouge.
- « Arrêter la Daily » ramène à l'écran 2.

**S10. Interface premium et responsive.** En tant que Scrum Master, je travaille confortablement sur ordinateur comme sur téléphone.
- Mise en page utilisable de 320 px à 1920 px, sans défilement horizontal à 320 px, avec une marge latérale de 16 px sur mobile.
- Les boutons ont une zone cliquable d'au moins 44 x 44 px, et le focus clavier est visible.
- Fond gris très clair, surfaces blanches, typographie élégante, états survol, focus, appui et désactivé définis ; les animations sont coupées si l'utilisateur réduit les mouvements.

---

## 5. Hors périmètre

**Exclu par le client :**
- Temps de parole par membre (pas de temps alloué individuel, pas de passage de parole par membre).
- Bilan de fin de Daily et copie du bilan.
- Compte utilisateur et authentification.
- Backend, synchronisation entre appareils.

**Retiré du PRD Timer pour alléger le périmètre [à valider] :**
- Répartition manuelle du temps, pause, choix d'un membre pour parler.
- Export et import JSON, réinitialisation de l'application, réglage du son d'alerte.
- Installation PWA et fonctionnement hors ligne spécifique.

---

## 6. Questions ouvertes

1. **Rôle du chronomètre.** Le décompte est-il une durée unique pour toute la Daily, avec la liste des membres purement informative ? C'est l'hypothèse retenue, puisque le temps par membre est exclu.
2. **Une seule équipe par appareil.** Créer une nouvelle équipe remplace-t-elle l'existante, après confirmation ?
3. **Rechargement pendant une Daily.** La Daily reprend-elle là où elle en était (temps écoulé compté pendant la fermeture) ou revient-on à l'écran 2 ?
