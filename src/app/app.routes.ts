import { Routes } from '@angular/router';
import { Presentation } from './pages/presentation/presentation';
import { TeamEditor } from './pages/team-editor/team-editor';

export const routes: Routes = [
  { path: 'equipe', component: TeamEditor },
  { path: 'presentation', component: Presentation },
  { path: '**', redirectTo: 'equipe' },
];
