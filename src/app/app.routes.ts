import { Routes } from '@angular/router';
import { TeamEditor } from './pages/team-editor/team-editor';

export const routes: Routes = [
  { path: 'equipe', component: TeamEditor },
  { path: '**', redirectTo: 'equipe' },
];
