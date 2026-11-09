# Daily Timer Simple

Application locale pour créer son équipe une fois, vérifier sa présentation, puis lancer une Daily chronométrée en un clic. Aucun compte, aucun serveur : les données restent dans le navigateur.

Les choix faits sur les règles à valider sont consignés dans [docs/decisions.md](docs/decisions.md).

## Installation

Prérequis : Node.js 22 ou plus récent.

```bash
npm ci
npm start          # http://localhost:4200
```

## Tests

```bash
npm test                                   # tests unitaires (Karma et Jasmine, Chrome headless)
npx ng test --watch=false --browsers=ChromeHeadlessCI
```

Les tests E2E Playwright tournent sur le build de production :

```bash
npx ng build --configuration production --base-href "/daily-timer-simple/"
npx playwright test                        # utilise Chrome installé, ou `npx playwright install chromium`
```

## Build de production

```bash
npx ng build --configuration production --base-href "/daily-timer-simple/"
```

Le résultat est dans `dist/daily-timer-simple/browser/`.

## Docker

```bash
docker compose up dev          # développement : http://localhost:4200
docker compose up prod         # production servie par nginx : http://localhost:8080
docker compose run --rm test   # tests unitaires dans Chrome headless
```

## Déploiement sur GitHub Pages

Le workflow `.github/workflows/deploy-pages.yml` construit l'application avec le nom du dépôt comme base (`/daily-timer-simple/`) et la publie à chaque push sur `main`. Le routage utilise le mode hash (`#/equipe`, `#/presentation`, `#/daily`), donc aucune réécriture serveur n'est nécessaire.

Le workflow `.github/workflows/ci.yml` lance les tests unitaires, le build et les tests E2E sur chaque push et pull request.
