# Décisions d'implémentation

Ce fichier consigne les choix pris par Amelia sur les règles marquées **[à valider]** dans `brief.md` et `design.md`. Chaque choix applique la valeur proposée dans le brief ou la recommandation du design, sauf mention contraire.

| # | Sujet | Décision | Source |
|---|---|---|---|
| D1 | Durée par défaut | 15 minutes, pré-remplie à la création | brief 3.2 |
| D2 | Durée : bornes et format | Entier de 1 à 120 ; décimale ou texte refusé avec « Saisissez un nombre entier de minutes. » | brief 3.1 |
| D3 | Nom d'équipe | Obligatoire après normalisation, 50 caractères max, message « Le nom d'équipe ne peut pas dépasser 50 caractères. » (message non proposé par le brief) | brief 3.2, design 4.1 |
| D4 | Prénom : longueur | 30 caractères max, message « Le prénom ne peut pas dépasser 30 caractères. » (message ajouté) | brief 3.2 |
| D5 | Prénom : caractères | Lettres (y compris accentuées), espaces, traits d'union et apostrophes (`'` et `’`) ; autre caractère refusé avec « Le prénom ne peut contenir que des lettres, espaces, traits d'union et apostrophes. » (message ajouté) | brief 3.2 |
| D6 | Espaces | Retirés en début et fin, multiples réduits à un seul, avant validation et enregistrement | brief 3.2 |
| D7 | Doublon | Insensible à la casse (`toLowerCase`), sensible aux accents : « Léa » et « Lea » ne sont pas des doublons | brief 3.2 |
| D8 | Temps par membre | Durée en secondes divisée par le nombre de membres doit être au moins 30 s, sinon enregistrement bloqué avec le message du design, affiché sous le champ durée | brief 3.2, design 3.6 / 4.1 |
| D9 | Bouton « Ajouter » | Reste actif quand le prénom est vide ; un clic ou Entrée sur un prénom vide affiche « Saisissez un prénom. » (S2 l'exige) | brief S2 |
| D10 | Enregistrer désactivé | Utilise `aria-disabled` (focusable) pour que le clic explique l'erreur et déplace le focus sur le premier champ fautif (design 4.1) | design 4.1 |
| D11 | Données illisibles | Écran 2 sans donnée lisible redirige vers l'écran 1 avec le bandeau « Les données de l'équipe sont illisibles. Recréez l'équipe. » | brief 2 (écran 2) |
| D12 | Décompte après la durée | Le décompte continue et passe en « +mm:ss » avec « Temps dépassé » en rouge et en texte | design 3.10 |
| D13 | Arrêt de la Daily | Confirmation demandée (« Arrêter la Daily ? », boutons « Arrêter » et « Continuer », focus sur « Continuer ») | design 3.11 |
| D14 | Rechargement pendant une Daily | **Remplacé par D33** (décision client 5) : la Daily reprend en pause. Ancien choix : retour à l'écran 2, chronomètre jamais relancé seul ni repris | design 4.3 / 6 |
| D15 | Remplacement d'une équipe | Pas de flux de création quand une équipe existe : l'écran 1 passe en modification, donc pas de confirmation d'écrasement nécessaire (question 2 du brief close) | brief 6 |
| D16 | Suppression d'un membre | Animation de sortie en hauteur simplifiée : la ligne disparaît sans transition de hauteur ; le fondu d'entrée est conservé | design 3.7 (écart mineur) |
| D17 | Stockage | localStorage, clé versionnée, lecture et écriture protégées par try/catch ; si l'écriture échoue, l'écran de création reste ouvert avec un bandeau d'erreur (pas de passage à la présentation) ; si la lecture échoue, l'application démarre sans équipe | brief S7 |
| D18 | Routage | Mode hash (`#/equipe`, `#/presentation`, `#/daily`) pour GitHub Pages | brief stack |
| D19 | Police | Pile système uniquement, aucune police web | design 2.1 |
| D20 | PWA | `@angular/service-worker` non inclus : la PWA est hors périmètre (brief 5) | brief 5 |
| D21 | Reprise de la Daily | **Remplacé par D33** (décision client 5) : la reprise après rechargement est désormais dans le périmètre. Ancien choix : non implémentée | brief 6 question 3 |
| D22 | Barre d'action mobile | Pas de barre fixe en bas : sous 600 px, les boutons d'action prennent toute la largeur dans le flux (écart mineur avec design 3.13) | design 4.0 |
| D23 | Aide sous 2 membres | Le message « Ajoutez au moins 2 membres pour continuer. » s'affiche tant qu'il y a moins de 2 membres (et non seulement à 0) | brief 2 / design 3.8 |
| D24 | Bouton Démarrer | Désactivé (aria-disabled) sous 2 membres, avec le message « Ajoutez au moins 2 membres pour démarrer. » relié par aria-describedby | brief 2 |
| D25 | Annuler et Échap | En modification : « Annuler » et Échap reviennent à la présentation sans enregistrer ; en création, Échap est sans effet | design 4.5 |
| D26 | Décompte à 00:00 | Le décompte affiche 00:00 quand le dépassement commence, puis « +mm:ss » ; l'arrondi est au-dessus pour le décompte (15:00 au démarrage) | design 3.10 |
| D27 | Dialogue d'arrêt | Ordre des boutons « Continuer » puis « Arrêter » ; sous 600 px les boutons sont empilés (action sûre en haut) | design 3.11 |
| D28 | Sortie de la Daily sans « Arrêter » | Retour arrière ou changement de route pendant une Daily : la Daily s'arrête tout de suite, sans confirmation (un retour arrière ne peut pas être confirmé dans l'écran). Revenir sur l'écran ensuite renvoie à la présentation, sans reprise (comme D14). **Remplacé par D37** (décision client 9) : la sortie pendant la Daily passe par une garde de sortie avec confirmation. Ancien choix du développeur (revue 4, constat I3) : arrêt immédiat | design 3.11 / 4.3 |
| D29 | Chronomètre : départ | Le chronomètre démarre au clic sur « Commencer la Daily ». Jamais à l'ouverture de (d) ou (e) | Décision client 1, brief v3 |
| D30 | Fin de la Daily | Ne se termine que sur « Terminer la Daily ». Au dernier membre, « Suivant » devient « Terminer la Daily », qui ouvre le bilan (f) | Décision client 2, brief v3 |
| D31 | Dépassement | Le décompte devient négatif et continue (rouge, « +mm:ss »). Passage au membre suivant seulement sur « Suivant » | Décision client 3, brief v3 |
| D32 | Temps non utilisé | Perdu : le membre suivant repart de son temps alloué, sans report | Décision client 4, brief v3 |
| D33 | Rechargement ou fermeture | La Daily reprend en pause (même membre, même temps restant, même ordre). Relance par « Reprendre la Daily ». Le temps de fermeture ne compte pas. Remplace D14 et D21 | Décision client 5, brief v3 |
| D34 | Bilan | Nouvel écran (f) : temps parlé, temps alloué, dépassement, passé, par membre ; « Copier le bilan » et « Retour à l'équipe ». Non enregistré (pas d'historique) | Décision client 6, brief v3 |
| D35 | Suppression d'équipe | Depuis « Mes équipes », avec dialogue de confirmation | Décision client 7, brief v3 |
| D36 | Arrêt de la Daily | Confirmation obligatoire. Une Daily arrêtée n'est pas conservée | Décision client 8, brief v3 |
| D37 | Retour arrière pendant la Daily | Garde de sortie : dialogue « Quitter la Daily ? » (« Continuer » par défaut). Confirmer arrête la Daily et perd la progression. Remplace D28 | Décision client 9, brief v3 |
| D38 | Libellé de départ | Le bouton de (d) s'appelle « Commencer la Daily » | Décision client 10, brief v3 |
| D39 | Passer un membre | Possible pour le membre qui parle et pour un membre à venir non passé ; pas pour un membre déjà fait ou passé | Décision client 11, brief v3 |
| D40 | Temps par membre | Défaut 2 minutes, bornes 1 à 5 minutes (entiers) | Décision client 12, brief v3 |
| D41 | Ordre par défaut | Ordre de l'équipe | Décision client 13, brief v3 |
| D42 | Modification d'équipe | Confirmation avant un enregistrement qui retire un membre (dialogue « Enregistrer la modification ? ») | Décision client 14, brief v3 |
| D43 | Tri de Mes équipes | Ordre alphabétique | Décision client 15, brief v3 |
| D44 | Appliquer à tous | Conservé ; sélecteur au-dessus de la liste des membres sur l'écran (d) | Décision client 16, brief v3 |
| D45 | Doublons de prénoms | Refusés à la saisie (à l'ajout). Pas de dédoublonnage au chargement | Décision client 17, brief v3 |
| D46 | Mode sombre | Suit le réglage système (prefers-color-scheme). Pas de bouton de bascule en V1 | Demande client A, brief v3 |
| D47 | Majuscule des prénoms | Première lettre de chaque prénom ajouté mise en majuscule, reste inchangé ; stockage sous cette forme | Demande client B, brief v3 |
| D48 | Espace sous « Nouvelle équipe » | Espace de 16 px sous le bouton, sur ordinateur et mobile | Demande client C, brief v3 |
| D49 | Annuler en création | **Corrigé (revue 6, I2)** : « Annuler » n'est affiché sur (b) en création que s'il existe au moins une équipe, et ramène alors à « Mes équipes » (a). Sans équipe, il n'est pas affiché, et (a) n'affiche ni liste ni message vide (brief v3, section 2 : « Vide : non affiché »). La version précédente, qui affirmait que ce choix était le défaut du brief, était fausse : le brief fait foi | Point à valider 1, brief v3 section 2 (lignes 82 et 95) et section 6 |
| D50 | Lien « Mes équipes » sur (c) | Présent, en haut de l'écran (défaut : oui) | Point à valider 2, brief v3 section 6 |
| D51 | Données illisibles sur (c) | Pas d'écran dédié : le bandeau « Les données de l'équipe sont illisibles. Recréez l'équipe. » reste celui de (a) et (b). Une équipe introuvable renvoie à l'accueil | Point à valider 3, brief v3 section 6 |
| D52 | Caractères d'un prénom | Lettres (Unicode, accents compris), espaces, traits d'union, apostrophes droites et typographiques (défaut) | Point à valider 4, brief v3 section 6 |
| D53 | Espaces superflus | Retirés en début et fin, réduits à un seul entre les mots (défaut) | Point à valider 5, brief v3 section 6 |
| D54 | Ancienne durée | Une équipe de la version précédente perd sa durée au chargement, sans l'afficher (défaut) | Point à valider 6, brief v3 section 6 |
| D55 | Membre passé | Un membre passé ne revient pas dans la même Daily (défaut). « Passer » n'est pas proposé pour lui | Point à valider 7, brief v3 section 6 |
| D56 | Bilan après rechargement | Le bilan (f) n'est pas conservé : il est perdu si la page est rechargée ou fermée. Un rechargement sur (f) renvoie à la présentation de l'équipe | Point à valider 8, brief v3 section 6 |
| D57 | « Passer ce membre » au dernier membre qui parle | **Remplacé par D65** (revue 6, I3). Ancien choix : masqué au dernier membre, selon le design 5.5.1 | Design 5.5.1 et 10.2 |
| D58 | Pause de reprise et membre suivant | Après une réouverture, la Daily est en pause : « Suivant » et « Passer » restent disponibles, le membre suivant commence avec son temps alloué figé jusqu'à « Reprendre la Daily » | S27, brief v3 section 3.7 |
| D59 | Chronomètre pendant un dialogue | Le décompte est figé pendant l'arrêt et la garde de sortie, et reprend sans perte à « Continuer ». Le temps écoulé pendant la fermeture ne compte pas | S17, S28, design 6.3 |
| D60 | Garde de sortie et « Arrêter » | « Arrêter » efface la Daily puis va à l'écran visé par la navigation (ou à « Mes équipes » si rien n'est visé) | Design 6.4 |
| D61 | Temps parlé | Arrondi à la seconde inférieure (`mm:ss` sur le temps écoulé, pause exclue) | Brief v3 section 2 (f) |
| D62 | Fin de la Daily et focus | Après « Terminer la Daily », l'écran (f) s'ouvre et son titre reçoit le focus. Le libellé ne reste pas sur le même bouton (résout le point 10.3 du design) | Design 10.3 |
| D63 | Supprimer la dernière équipe | Après suppression, l'application affiche (b) (brief S21) | Brief v3 S21 |
| D64 | Icône d'application | Une seule icône pour les deux thèmes (design section 9) | Design 9 et 10.8 |
| D65 | « Passer ce membre » au dernier membre qui parle | « Passer ce membre » est proposé au membre qui parle, dernier compris, comme aux autres membres qui parlent. Un absent en dernier est compté « passé » au bilan, sans temps. Une fois la liste épuisée, « Terminer la Daily » devient l'action principale. Remplace D57 : le masquage venait du design 5.5.1, qui contredit la décision client 11 et le brief v3 (section 3.5) | Décision client 11, brief v3 section 3.5 (ligne 257) ; revue 6, I3 |
