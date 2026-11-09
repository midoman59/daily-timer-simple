import { Injectable, signal } from '@angular/core';
import { Team } from '../domain/team.model';

export const TEAM_STORAGE_KEY = 'daily-timer-simple.team.v1';

/** Mémoire de l'équipe courante, écrite dans le stockage local du navigateur. */
@Injectable({ providedIn: 'root' })
export class TeamStore {
  /** Équipe courante, ou null si aucune équipe n'est enregistrée. */
  readonly team = signal<Team | null>(null);

  /**
   * Enregistre l'équipe en mémoire puis dans le stockage local.
   * Renvoie false si le stockage n'a pas pu être écrit (l'équipe reste disponible pour la session).
   */
  save(team: Team): boolean {
    this.team.set(team);
    try {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify({ version: 1, ...team }));
      return true;
    } catch {
      return false;
    }
  }
}
