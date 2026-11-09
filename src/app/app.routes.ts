import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { Daily } from './pages/daily/daily';
import { Presentation } from './pages/presentation/presentation';
import { TeamEditor } from './pages/team-editor/team-editor';
import { DailyTimerService } from './services/daily-timer.service';
import { TeamStore } from './services/team.store';

/** Écran d'accueil : la présentation si une équipe existe, sinon la création. */
const home = (): string => (inject(TeamStore).team() ? '/presentation' : '/equipe');

/** Protège la présentation : sans équipe lisible, retour à l'écran de création. */
const hasTeam = () => {
  const store = inject(TeamStore);
  return store.team() !== null || inject(Router).createUrlTree(['/equipe']);
};

/**
 * Protège l'écran de la Daily : il ne s'ouvre que si une Daily est en cours.
 * Un rechargement de la page renvoie donc à la présentation, sans relancer le chronomètre.
 */
const dailyRunning = () => {
  const timer = inject(DailyTimerService);
  return timer.session() !== null || inject(Router).createUrlTree(['/presentation']);
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: home },
  { path: 'equipe', component: TeamEditor },
  { path: 'presentation', component: Presentation, canActivate: [hasTeam] },
  { path: 'daily', component: Daily, canActivate: [dailyRunning] },
  { path: '**', redirectTo: home },
];
