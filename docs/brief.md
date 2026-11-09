# Brief : Daily Timer Simple

- Version : 2
- Date : 2026-11-09
- Statut : brouillon à valider par le client
- Source : brief version 1, révisé selon les retours du client ; PRD « Scrum Speaking Timer » (C:\Projects\Timer), réduit à l'essentiel
- Marqueur : **[à valider]** = règle ou choix que le client n'a pas explicitement donné, à confirmer

---

## Changelog

Changements par rapport à la version 1 :

1. **Création d'équipe sans durée.** L'équipe ne contient que son nom et ses membres. Le champ « Durée de la Daily » et ses règles (durée par défaut, bornes 1 à 120 minutes, contrôle de 30 secondes par membre) sont supprimés. La durée n'est plus une propriété de l'équipe.
2. **Écran « Mes équipes » à part entière.** Il liste les équipes, permet d'en créer une et d'en ouvrir une. Au lancement, l'application ouvre « Mes équipes » si au moins une équipe existe, et la création d'équipe sinon.
3. **Temps de parole par personne au lancement de chaque Daily.** L'utilisateur choisit le temps de chaque membre (1 à 5 minutes) dans un écran de préparation. Ce temps est propre à la Daily et n'est pas enregistré dans l'équipe.
4. **Ordre de passage choisi à chaque Daily.** Ordre de l'équipe (ordre de saisie) ou ordre aléatoire tiré au démarrage. Le mode peut changer d'une Daily à l'autre.
5. **Passer un membre.** Pendant la Daily, l'utilisateur peut passer le tour d'un membre absent, y compris lorsque c'est son tour. Le membre passé ne consomme pas de temps.
6. **Chronomètre dans le même écran.** Le décompte reste dans l'écran de Daily et démarre uniquement au lancement de la Daily. Le temps affiché est celui du membre courant, choisi au lancement.
7. **Exclusion levée.** Le temps de parole par membre sort du hors périmètre. La répartition manuelle du temps reste exclue.
8. **Écrans.** Le plan passe de trois à cinq écrans : (a) Mes équipes, (b) Création et modification d'équipe, (c) Présentation de l'équipe, (d) Préparation de la Daily, (e) Daily.

---

## 1. Objectif et public

**Objectif.** Un Scrum Master gère une ou plusieurs équipes. Il crée chaque équipe une fois, vérifie sa présentation, choisit le temps de parole de chacun et l'ordre de passage, puis lance une Daily chronométrée. L'application est locale : aucun compte, aucun serveur, les données restent dans le navigateur.

**Public.**
- Scrum Master (utilisateur principal) : gère les équipes et lance la Daily, souvent depuis un ordinateur partagé à l'écran.
- Membres de l'équipe : lisent le chronomètre sur l'écran partagé. Ils n'ont aucune saisie à faire.

**Principe directeur.** Une action principale par écran. Rien n'est demandé qui ne soit nécessaire. L'écran de chronomètre n'est jamais l'écran d'entrée.

**Parcours.**
- À l'ouverture : si au moins une équipe est enregistrée, écran (a) Mes équipes ; sinon, écran (b) Création d'équipe.
- (a) → ouvrir une équipe → (c) Présentation ; (a) → « Nouvelle équipe » → (b).
- (c) → « Modifier l'équipe » → (b) prérempli ; (c) → « Démarrer une Daily » → (d) Préparation.
- (d) → « Commencer la Daily » → (e) Daily ; (d) → « Annuler » → (c).
- (e) → « Arrêter la Daily » → (c).

---

## 2. Les cinq écrans

### Écran (a) : Mes équipes

- **But :** voir les équipes enregistrées, en ouvrir une ou en créer une.
- **Éléments :** titre « Mes équipes » ; liste des équipes (nom, nombre de membres) ; bouton principal « Nouvelle équipe » ; pour chaque équipe, un bouton « Ouvrir ».
- **Actions :** ouvrir une équipe (→ écran c), créer une équipe (→ écran b).
- **États :**
  - *Vide :* aucune équipe. Cet état n'est pas affiché : l'application ouvre directement l'écran (b).
  - *Succès :* liste des équipes, triée par ordre alphabétique [à valider].

### Écran (b) : Création et modification d'équipe

- **But :** saisir l'équipe une fois, ou la corriger.
- **Éléments :** titre (« Nouvelle équipe » ou « Modifier l'équipe ») ; champ « Nom d'équipe » ; champ « Prénom » avec bouton « Ajouter » (Entrée valide aussi) ; liste ordonnée des membres, un bouton « Supprimer » par ligne ; compteur « N membres » ; bouton principal « Enregistrer l'équipe » ; lien « Annuler » (au minimum en modification, [à valider] en création, où il ramène à l'écran a s'il existe une équipe).
- **Absent :** aucun champ de durée.
- **Actions :** saisir le nom, ajouter ou supprimer un membre avant enregistrement, enregistrer, annuler.
- **États :**
  - *Vide :* aucun membre, compteur « 0 membre », texte « Ajoutez au moins 2 membres pour continuer. », bouton désactivé.
  - *Erreur :* message lié au champ fautif (lu par les lecteurs d'écran) ; à l'enregistrement, le focus va sur la première erreur ; à 15 membres, le champ « Prénom » est désactivé avec le message « Une équipe ne peut pas dépasser 15 membres. »
  - *Succès :* l'équipe est enregistrée et l'écran (c) s'affiche.

### Écran (c) : Présentation de l'équipe

- **But :** vérifier l'équipe et lancer une Daily.
- **Éléments :** nom d'équipe (titre) ; nombre de membres ; liste des membres dans l'ordre de saisie ; bouton principal « Démarrer une Daily » ; bouton secondaire « Modifier l'équipe » ; lien « Mes équipes » [à valider].
- **Absent :** aucune durée de Daily, qui se choisit à l'écran (d).
- **Actions :** démarrer une Daily (→ écran d), modifier l'équipe (→ écran b), revenir à Mes équipes.
- **États :**
  - *Erreur :* moins de 2 membres (équipe incomplète) → bouton « Démarrer une Daily » désactivé avec le texte « Ajoutez au moins 2 membres pour démarrer. »
  - *Données illisibles :* retour à l'écran (b) avec « Les données de l'équipe sont illisibles. Recréez l'équipe. » [à valider]
  - *Succès :* présentation complète ; le clic sur « Démarrer une Daily » ouvre l'écran (d).

### Écran (d) : Préparation de la Daily

- **But :** choisir pour cette Daily le temps de parole de chaque membre et l'ordre de passage.
- **Éléments :**
  - Titre « Préparer la Daily » et nom de l'équipe.
  - Pour chaque membre, une liste déroulante « Temps de parole » (1, 2, 3, 4 ou 5 minutes), dans l'ordre de l'équipe. Option « Appliquer à tous » [à valider].
  - Choix de l'ordre de passage : « Ordre de l'équipe » ou « Ordre aléatoire » (choix radio, un seul actif).
  - Bouton principal « Commencer la Daily » ; lien « Annuler » (→ écran c).
- **Actions :** choisir le temps de chaque membre, choisir le mode d'ordre, commencer, annuler.
- **États :**
  - *Pré-rempli :* chaque membre à 2 minutes [à valider] ; ordre de l'équipe sélectionné par défaut [à valider].
  - *Erreur :* une valeur de temps absente ou hors bornes → bouton « Commencer la Daily » désactivé et message lié au membre concerné.
  - *Succès :* clic sur « Commencer la Daily » → écran (e), le chronomètre démarre et le tirage au sort a lieu si l'ordre aléatoire est choisi.
- **Règle :** ces choix ne sont enregistrés nulle part ; ils valent pour cette Daily seulement.

### Écran (e) : Daily (chronomètre)

- **But :** suivre le temps de parole du membre courant, et passer les membres.
- **Éléments :**
  - Nom d'équipe et mode d'ordre utilisé (« Ordre de l'équipe » ou « Ordre aléatoire »).
  - Grand décompte « mm:ss » du membre courant, avec son prénom en grand.
  - Temps alloué au membre courant (« Temps prévu : 2:00 »).
  - Liste compacte de l'ordre de passage : le membre courant est mis en évidence, les membres passés portent la mention « passé ».
  - Bouton principal « Passer au suivant » ; bouton « Passer ce membre » (absent) ; bouton secondaire « Arrêter la Daily ».
- **Actions :** passer au membre suivant, passer un membre absent (y compris le membre courant), arrêter la Daily.
- **Comportement :**
  - Le chronomètre démarre au clic sur « Commencer la Daily » (écran d), jamais à l'ouverture.
  - Le décompte du membre courant part de son temps alloué (choisi à l'écran d).
  - Au passage au membre suivant, le décompte repart du temps alloué au nouveau membre.
  - Le tirage aléatoire, s'il est choisi, a lieu au démarrage et l'ordre tiré reste fixe pendant la Daily.
- **États :**
  - *En cours :* décompte visible, mis à jour au moins une fois par seconde.
  - *Dépassement :* au-delà du temps alloué, le décompte passe en rouge avec le texte « Temps dépassé » et « +mm:ss ». La couleur ne suffit pas seule. **[à valider]** : le décompte continue en dépassement.
  - *Passé :* le membre est sauté, sans temps compté (voir section 3.5).
  - *Arrêtée :* retour à l'écran (c). **[à valider]** : confirmation demandée avant l'arrêt (« Arrêter la Daily ? » / « Arrêter » et « Continuer »).

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
| Prénom | Pas de doublon dans l'équipe : insensible à la casse, sensible aux accents (« Léa » et « lea » ne sont pas des doublons ; « Thomas » et « thomas » le sont) | « Ce prénom existe déjà dans l'équipe. » |

Les règles de longueur (50 et 30 caractères) et de doublon sont confirmées par le client comme inchangées.

### 3.2 Règles de saisie ajoutées

- Espaces en début et fin retirés avant validation ; espaces multiples réduits à un seul. **[à valider]**
- Prénom : lettres, espaces, traits d'union et apostrophes seulement. **[à valider]**
- Une équipe déjà enregistrée avec une ancienne durée : la durée est supprimée et n'est pas affichée. **[à valider]**

### 3.3 Temps de parole par membre (écran d)

| Règle | Valeur | Statut |
|---|---|---|
| Valeurs proposées | 1, 2, 3, 4 ou 5 minutes (entiers) | Exemples du client (1, 2, 3) ; bornes 1 à 5 **[à valider]** |
| Valeur par défaut | 2 minutes pour chaque membre | **[à valider]** |
| Obligatoire | Chaque membre a une valeur ; sinon « Commencer la Daily » est désactivé | **[à valider]** |
| Portée | Propre à la Daily : rien n'est enregistré dans l'équipe | Client |
| Temps non utilisé | Le temps restant d'un membre passé au suivant n'est pas reporté | **[à valider]** |

### 3.4 Ordre de passage (écran d)

| Règle | Comportement | Statut |
|---|---|---|
| Choix | « Ordre de l'équipe » (ordre de saisie) ou « Ordre aléatoire ». Choix fait à chaque Daily | Client |
| Défaut | « Ordre de l'équipe » à chaque nouvelle préparation | **[à valider]** |
| Tirage | Tirage aléatoire de tous les membres au démarrage de la Daily. L'ordre tiré est fixe pendant la Daily | **[à valider]** : tirage au démarrage, client |
| Passage au suivant | Suit l'ordre choisi : ordre de saisie, ou ordre tiré | Client |
| Ordre de l'équipe | Ne change pas : l'ordre tiré ne modifie pas l'ordre enregistré de l'équipe | **[à valider]** |

### 3.5 Passer un membre (écran e)

- Un membre peut être passé à tout moment, y compris lorsque c'est son tour. Client.
- Le membre passé ne compte pas dans le temps : aucun temps ne lui est attribué. Client.
- Si le membre passé est celui qui parle, le passage au membre suivant est immédiat, avec le temps alloué au suivant. **[à valider]**
- Le membre passé reste visible dans la liste de l'écran (e) avec la mention « passé ». Il n'y a pas de bilan dans le périmètre actuel : le membre passé est donc simplement sauté dans le décompte. **[à valider]** : si le client ajoute un bilan de fin de Daily, le membre passé y figure comme « passé ».
- Un membre passé ne peut pas être repris dans la même Daily. **[à valider]**

### 3.6 Fin de la liste de membres

- Au dernier membre (ou après le dernier non passé), « Passer au suivant » n'a plus de cible. **[à valider]** : le bouton devient « Terminer la Daily », qui ramène à l'écran (c).

---

## 4. Stories

### Écran (a) : Mes équipes

**S1. Ouvrir l'application sur mes équipes.** En tant que Scrum Master, je retrouve mes équipes dès l'ouverture.
- Si au moins une équipe est enregistrée, l'application ouvre l'écran (a) Mes équipes.
- Sans équipe enregistrée, l'application ouvre directement l'écran (b).
- Chaque équipe de la liste affiche son nom et son nombre de membres.
- Le bouton « Nouvelle équipe » est visible et principal.

**S2. Ouvrir une équipe depuis la liste.** En tant que Scrum Master, je choisis l'équipe à préparer.
- Le bouton « Ouvrir » de chaque équipe ouvre l'écran (c) de cette équipe.
- L'équipe affichée est celle choisie, sans mélange avec une autre.
- Revenir à Mes équipes depuis l'écran (c) reste possible.

### Écran (b) : Création et modification d'équipe

**S3. Saisir le nom d'équipe et les membres.** En tant que Scrum Master, je crée mon équipe avec son nom et ses membres, sans durée.
- L'écran (b) ne contient ni champ « Durée de la Daily » ni message de durée.
- Taper un prénom puis Entrée, ou cliquer « Ajouter », place le membre en fin de liste.
- Le champ prénom se vide et reprend le focus après chaque ajout.
- Un prénom vide est refusé avec « Saisissez un prénom. ».

**S4. Suivre et corriger la liste des membres.** En tant que Scrum Master, je vois combien de membres sont saisis et je peux en retirer.
- Le compteur « N membres » se met à jour à chaque ajout et à chaque suppression.
- Chaque membre a un bouton « Supprimer » qui retire la ligne sans enregistrer.
- Au 15e membre, le champ d'ajout est désactivé avec le message de maximum.
- Le compteur est annoncé par les lecteurs d'écran à chaque changement.

**S5. Valider avant enregistrement.** En tant que Scrum Master, je suis guidé quand une règle n'est pas respectée.
- « Enregistrer l'équipe » reste désactivé si le nom est vide ou si moins de 2 membres sont saisis.
- Un doublon, par exemple « thomas » après « Thomas », est refusé avec « Ce prénom existe déjà dans l'équipe. ».
- Un nom ou un prénom au-delà de sa limite (50 ou 30 caractères) est refusé avec son message.
- À la tentative d'enregistrement avec une erreur, le focus va sur le premier champ fautif.

**S6. Enregistrer et voir la présentation.** En tant que Scrum Master, je valide mon équipe et je vérifie son affichage.
- Enregistrer une équipe valide affiche l'écran (c) avec le nom et la liste des membres.
- La liste respecte l'ordre de saisie.
- L'équipe enregistrée est ajoutée à Mes équipes.

**S7. Modifier une équipe enregistrée.** En tant que Scrum Master, je corrige un nom ou un membre sans tout ressaisir.
- « Modifier l'équipe » ouvre l'écran (b) prérempli avec le nom et les membres de l'équipe.
- Enregistrer les changements met à jour l'écran (c) et la liste de Mes équipes.
- « Annuler » ferme l'écran (b) sans rien modifier.

### Écran (c) : Présentation de l'équipe

**S8. Vérifier l'équipe avant la Daily.** En tant que Scrum Master, je contrôle l'équipe avant de la lancer.
- L'écran (c) affiche le nom de l'équipe, le nombre de membres et la liste dans l'ordre de saisie.
- Le bouton « Démarrer une Daily » est visible et principal.
- Avec moins de 2 membres, « Démarrer une Daily » est désactivé avec « Ajoutez au moins 2 membres pour démarrer. ».
- Le bouton « Modifier l'équipe » et le lien « Mes équipes » sont présents.

**S9. Retrouver mes équipes au rechargement.** En tant que Scrum Master, je n'ai pas à ressaisir mes équipes chaque jour.
- Après rechargement de la page, Mes équipes affiche les mêmes équipes.
- Après fermeture et réouverture du navigateur, les équipes sont toujours là.
- Les données sont lues et écrites uniquement dans le stockage local du navigateur (aucun appel réseau).

### Écran (d) : Préparation de la Daily

**S10. Choisir le temps de parole de chaque membre.** En tant que Scrum Master, je règle le temps de parole de chacun pour cette Daily.
- Chaque membre a une liste de 1 à 5 minutes, pré-réglée à 2 minutes.
- Le choix ne modifie pas l'équipe : le retour à Mes équipes et la réouverture de l'équipe ne gardent pas ce réglage.
- Une valeur absente désactive « Commencer la Daily » et affiche un message lié au membre concerné.
- Une option « Appliquer à tous » règle la même valeur pour chaque membre. **[à valider]**

**S11. Choisir l'ordre de passage.** En tant que Scrum Master, je décide si la Daily suit l'ordre de l'équipe ou un ordre aléatoire.
- Les choix « Ordre de l'équipe » et « Ordre aléatoire » sont présentés, un seul actif à la fois.
- « Ordre de l'équipe » est sélectionné par défaut. **[à valider]**
- Mon choix pour une Daily ne change pas l'ordre enregistré de l'équipe, et il n'est pas gardé pour la Daily suivante.

**S12. Lancer la Daily depuis la préparation.** En tant que Scrum Master, je confirme mes réglages et lance la Daily.
- « Commencer la Daily » ouvre l'écran (e) avec la liste et le mode d'ordre choisis.
- Le tirage aléatoire, s'il est choisi, a lieu à ce moment-là, et l'ordre tiré est affiché dans l'écran (e).
- « Annuler » revient à l'écran (c) sans rien lancer ni enregistrer.

### Écran (e) : Daily

**S13. Démarrer le chronomètre dans le même écran.** En tant que Scrum Master, je vois le temps du premier membre dès que la Daily commence.
- Le décompte « mm:ss » part du temps alloué au premier membre (2 minutes par défaut) et se met à jour au moins une fois par seconde.
- Le prénom du membre courant et son temps prévu sont affichés en grand.
- Le chronomètre ne démarre jamais à l'ouverture de l'écran (e) ni à l'affichage de l'écran (d).
- Le bouton « Arrêter la Daily » est présent dans le même écran.

**S14. Passer au membre suivant.** En tant que Scrum Master, je passe la parole au membre suivant.
- « Passer au suivant » attribue la parole au membre suivant selon l'ordre choisi (ordre de saisie ou ordre tiré).
- Le décompte repart du temps alloué au nouveau membre.
- Le membre quitté reste visible dans la liste de l'écran (e) avec le statut « fait ». **[à valider]**
- Au dernier membre, « Passer au suivant » devient « Terminer la Daily ». **[à valider]**

**S15. Passer un membre absent.** En tant que Scrum Master, je saute un membre absent sans qu'il consomme du temps.
- « Passer ce membre » est disponible pour chaque membre de la liste, y compris celui dont c'est le tour.
- Le membre passé porte la mention « passé » dans la liste et ne reçoit aucun temps.
- Si le membre passé est celui qui parle, la parole passe immédiatement au membre suivant, avec son temps alloué.
- Un membre passé ne peut pas être repris dans la même Daily. **[à valider]**

**S16. Signaler le dépassement.** En tant que Scrum Master, je vois quand le temps du membre courant est dépassé.
- Au-delà du temps alloué, « Temps dépassé » et « +mm:ss » apparaissent en texte et en rouge.
- La couleur ne suffit pas seule : le texte est présent et lu par les lecteurs d'écran.
- Le décompte continue en dépassement. **[à valider]**
- Passer au suivant remet le décompte à zéro pour le membre suivant.

**S17. Arrêter la Daily.** En tant que Scrum Master, je peux arrêter la Daily à tout moment.
- « Arrêter la Daily » demande une confirmation : « Arrêter la Daily ? », avec « Arrêter » et « Continuer ». **[à valider]**
- Après confirmation, l'écran (c) de la même équipe s'affiche, et aucune Daily n'est enregistrée. **[à valider]**
- Sans confirmation (« Continuer »), la Daily reprend sans perte de temps.

### Transverse

**S18. Interface responsive et accessible.** En tant que Scrum Master, je travaille confortablement sur ordinateur comme sur téléphone.
- Mise en page utilisable de 320 px à 1920 px, sans défilement horizontal à 320 px, avec une marge latérale de 16 px sur mobile.
- Les boutons ont une zone cliquable d'au moins 44 x 44 px, et le focus clavier est visible.
- Fond gris très clair, surfaces blanches, typographie soignée ; états survol, focus, appui et désactivé définis ; les animations sont coupées si l'utilisateur réduit les mouvements.
- Aucune donnée n'est envoyée hors du navigateur.

---

## 5. Hors périmètre

**Exclu par le client :**
- Bilan de fin de Daily et copie du bilan.
- Compte utilisateur et authentification.
- Backend, synchronisation entre appareils.
- Répartition manuelle du temps entre membres (le temps par membre est choisi au lancement de chaque Daily, sans répartition manuelle).

**Retiré du PRD Timer pour alléger le périmètre [à valider] :**
- Pause, choix d'un membre pour parler (hors « passer un membre »).
- Export et import JSON, réinitialisation de l'application, réglage du son d'alerte.
- Installation PWA et fonctionnement hors ligne spécifique.

**Non demandé, hors périmètre [à valider] :**
- Suppression d'une équipe depuis l'application.
- Historique des Daily passées.

---

## 6. Questions ouvertes

1. **Démarrage du chronomètre.** Le clic sur « Démarrer une Daily » ouvre la préparation (écran d), et le chronomètre part au clic sur « Commencer la Daily ». Le client attend-il que le chronomètre parte à ce second clic ? Le libellé du bouton est-il « Commencer la Daily » ?
2. **Fin de la liste.** Que se passe-t-il après le dernier membre : écran de fin, retour à la présentation, ou décompte qui continue ?
3. **Dépassement.** Le décompte continue-t-il en dépassement, ou s'arrête-t-il à zéro ?
4. **Temps non utilisé.** Le temps non utilisé par un membre passé au suivant est-il perdu, ou reporté au membre suivant ?
5. **Rechargement pendant une Daily.** La Daily reprend-elle là où elle en était (temps écoulé compté pendant la fermeture), ou revient-on à l'écran (c) ?
6. **Bilan.** Le client prévoit-il un bilan de fin de Daily dans une version ultérieure, qui afficherait les membres « passés » ?
7. **Suppression d'équipe.** Une équipe peut-elle être supprimée depuis Mes équipes ?
8. **Arrêt de la Daily.** Faut-il confirmer l'arrêt, et une Daily arrêtée est-elle conservée dans l'historique ?
9. **Retour arrière pendant la Daily (revue 4, constat I3).** *Choix du développeur, en attente de décision client.* Le retour arrière du navigateur (ou le geste de retour sur mobile) arrête la Daily tout de suite, sans dialogue de confirmation, car un retour arrière ne peut pas être confirmé dans l'écran. Le chronomètre et la progression sont perdus. Ce choix est appliqué tel quel (décision D28 de `decisions.md`) ; il ne change pas le comportement. Le client doit trancher : (a) garder l'arrêt immédiat, ou (b) demander une confirmation, par exemple en interceptant la sortie de l'écran (garde de sortie) pour afficher le dialogue 4.13, « Continuer » annulant la navigation.
