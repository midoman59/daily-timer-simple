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
| D14 | Rechargement pendant une Daily | Retour à l'écran 2 ; le chronomètre n'est jamais relancé seul ni repris | design 4.3 / 6 |
| D15 | Remplacement d'une équipe | Pas de flux de création quand une équipe existe : l'écran 1 passe en modification, donc pas de confirmation d'écrasement nécessaire (question 2 du brief close) | brief 6 |
| D16 | Suppression d'un membre | Animation de sortie en hauteur simplifiée : la ligne disparaît sans transition de hauteur ; le fondu d'entrée est conservé | design 3.7 (écart mineur) |
| D17 | Stockage | localStorage, clé versionnée, lecture et écriture protégées par try/catch ; si l'écriture échoue, un message d'erreur est affiché et l'équipe reste en mémoire pour la session | brief S7 |
| D18 | Routage | Mode hash (`#/equipe`, `#/presentation`, `#/daily`) pour GitHub Pages | brief stack |
| D19 | Police | Pile système uniquement, aucune police web | design 2.1 |
| D20 | PWA | `@angular/service-worker` non inclus : la PWA est hors périmètre (brief 5) | brief 5 |
| D21 | Reprise de la Daily | Non implémentée : pas de reprise après rechargement (D14) | brief 6 question 3 |
