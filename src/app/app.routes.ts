import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { Presentation } from './pages/presentation/presentation';
import { TeamEditor } from './pages/team-editor/team-editor';
import { TeamStore } from './services/team.store';

/** Écran d'accueil : la présentation si une équipe existe, sinon la création. */
const home = (): string => (inject(TeamStore).team() ? '/presentation' : '/equipe');

/** Protège la présentation : sans équipe lisible, retour à l'écran de création. */
const hasTeam = () => {
  const store = inject(TeamStore);
  return store.team() !== null || inject(Router).createUrlTree(['/equipe']);
};

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: home },
  { path: 'equipe', component: TeamEditor },
  { path: 'presentation', component: Presentation, canActivate: [hasTeam] },
  { path: '**', redirectTo: home },
];
