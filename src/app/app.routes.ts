import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, Routes } from '@angular/router';
import { Daily } from './pages/daily/daily';
import { MyTeams } from './pages/my-teams/my-teams';
import { Presentation } from './pages/presentation/presentation';
import { Preparation } from './pages/preparation/preparation';
import { TeamEditor } from './pages/team-editor/team-editor';
import { DailyTimerService } from './services/daily-timer.service';
import { TeamStore } from './services/team.store';

/**
 * Écran d'accueil : « Mes équipes » si au moins une équipe existe, sinon la création d'équipe.
 */
const home = () => (inject(TeamStore).teams().length > 0 ? '/equipes' : '/equipe/nouvelle');

/** Protège les écrans d'une équipe : une équipe inconnue renvoie à l'accueil. */
const teamExists = (route: ActivatedRouteSnapshot) =>
  inject(TeamStore).find(route.paramMap.get('id') ?? '') !== undefined || inject(Router).parseUrl('/');

/**
 * Protège l'écran de la Daily : il ne s'ouvre que si une Daily de cette équipe est en cours.
 * Un rechargement de la page renvoie donc à la présentation, sans relancer le chronomètre.
 */
const dailyRunning = (route: ActivatedRouteSnapshot) => {
  const id = route.paramMap.get('id') ?? '';
  return inject(DailyTimerService).session()?.teamId === id || inject(Router).parseUrl(`/equipe/${id}`);
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: home },
  { path: 'equipes', component: MyTeams },
  { path: 'equipe', pathMatch: 'full', redirectTo: 'equipe/nouvelle' },
  { path: 'equipe/nouvelle', component: TeamEditor },
  { path: 'equipe/:id', component: Presentation, canActivate: [teamExists] },
  { path: 'equipe/:id/modifier', component: TeamEditor, canActivate: [teamExists] },
  { path: 'equipe/:id/preparer', component: Preparation, canActivate: [teamExists] },
  { path: 'equipe/:id/daily', component: Daily, canActivate: [dailyRunning] },
  { path: '**', redirectTo: home },
];
