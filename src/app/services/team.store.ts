import { Injectable, signal } from '@angular/core';
import {
  MAX_DURATION_MINUTES,
  MAX_MEMBERS,
  MIN_DURATION_MINUTES,
  normalizeSpaces,
  validateMemberName,
  validateTeamName,
} from '../domain/team-validation';
import { Team } from '../domain/team.model';

export const TEAM_STORAGE_KEY = 'daily-timer-simple.team.v1';

/** Vérifie la forme d'une équipe relue du stockage. Renvoie null si elle est illisible. */
function parseStoredTeam(raw: unknown): Team | null {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }
  const data = raw as Record<string, unknown>;
  const { name, durationMinutes, members } = data;
  if (data['version'] !== 1 || typeof name !== 'string' || !Array.isArray(members)) {
    return null;
  }
  if (
    typeof durationMinutes !== 'number' ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes < MIN_DURATION_MINUTES ||
    durationMinutes > MAX_DURATION_MINUTES
  ) {
    return null;
  }
  if (validateTeamName(name) !== null) {
    return null;
  }
  if (members.length > MAX_MEMBERS) {
    return null;
  }
  const names: string[] = [];
  for (const member of members) {
    if (typeof member !== 'string' || validateMemberName(member, names) !== null) {
      return null;
    }
    names.push(normalizeSpaces(member));
  }
  return { name: normalizeSpaces(name), durationMinutes, members: names };
}

/** Mémoire de l'équipe courante, écrite dans le stockage local du navigateur. */
@Injectable({ providedIn: 'root' })
export class TeamStore {
  /** Équipe courante, ou null si aucune équipe n'est enregistrée ou lisible. */
  readonly team = signal<Team | null>(null);

  /** Vrai si une équipe est stockée mais illisible : l'écran de création l'indique. */
  readonly readError = signal(false);

  constructor() {
    this.load();
  }

  /**
   * Enregistre l'équipe en mémoire puis dans le stockage local.
   * Renvoie false si le stockage n'a pas pu être écrit (l'équipe reste disponible pour la session).
   */
  save(team: Team): boolean {
    this.team.set(team);
    this.readError.set(false);
    try {
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify({ version: 1, ...team }));
      return true;
    } catch {
      return false;
    }
  }

  private load(): void {
    let raw: string | null;
    try {
      raw = localStorage.getItem(TEAM_STORAGE_KEY);
    } catch {
      // Stockage inaccessible (navigation privée stricte, site bloqué) : on démarre sans équipe.
      return;
    }
    if (raw === null) {
      return;
    }
    let parsed: Team | null = null;
    try {
      parsed = parseStoredTeam(JSON.parse(raw));
    } catch {
      parsed = null;
    }
    if (parsed) {
      this.team.set(parsed);
    } else {
      this.readError.set(true);
    }
  }
}
