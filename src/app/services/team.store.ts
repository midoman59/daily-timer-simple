import { Injectable, computed, signal } from '@angular/core';
import {
  MAX_MEMBERS,
  normalizeSpaces,
  validateMemberName,
  validateTeamName,
} from '../domain/team-validation';
import { Team } from '../domain/team.model';

/** Stockage actuel : la liste de toutes les équipes de l'appareil. */
export const TEAMS_STORAGE_KEY = 'daily-timer-simple.teams.v2';

/** Ancien stockage (version 1) : une seule équipe, avec une durée qui n'existe plus. */
export const LEGACY_TEAM_STORAGE_KEY = 'daily-timer-simple.team.v1';

/** Données saisies pour une équipe : sans identifiant pour une création. */
export type TeamInput = Omit<Team, 'id'> & { id?: string };

/** Valide le nom et les membres d'une équipe lue du stockage. Renvoie null si elle est illisible. */
function parseTeamFields(name: unknown, members: unknown): Pick<Team, 'name' | 'members'> | null {
  if (typeof name !== 'string' || !Array.isArray(members) || validateTeamName(name) !== null) {
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
  return { name: normalizeSpaces(name), members: names };
}

/** Identifiant stable d'une équipe, créé à sa première enregistrement. */
function newTeamId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Lit la liste des équipes du stockage. Une équipe mal formée est ignorée et signalée (invalid),
 * sans faire perdre les autres. Lève une erreur si la forme générale est inattendue.
 */
function parseStoredTeams(raw: string): { teams: Team[]; invalid: boolean } {
  const data = JSON.parse(raw) as Record<string, unknown> | null;
  if (typeof data !== 'object' || data === null || data['version'] !== 2 || !Array.isArray(data['teams'])) {
    throw new Error('forme inattendue');
  }
  const teams: Team[] = [];
  let invalid = false;
  for (const entry of data['teams'] as unknown[]) {
    const item = (typeof entry === 'object' && entry !== null ? entry : {}) as Record<string, unknown>;
    const id = item['id'];
    const fields = typeof id === 'string' && id !== '' ? parseTeamFields(item['name'], item['members']) : null;
    if (fields && typeof id === 'string') {
      teams.push({ id, ...fields });
    } else {
      invalid = true;
    }
  }
  return { teams, invalid };
}

/** Lit l'équipe unique de l'ancienne version. Sa durée est ignorée. Renvoie null si elle est illisible. */
function parseLegacyTeam(raw: string): Team | null {
  const data = JSON.parse(raw) as Record<string, unknown> | null;
  if (typeof data !== 'object' || data === null || data['version'] !== 1) {
    return null;
  }
  const fields = parseTeamFields(data['name'], data['members']);
  return fields ? { id: newTeamId(), ...fields } : null;
}

/** Mémoire des équipes, écrite dans le stockage local du navigateur. */
@Injectable({ providedIn: 'root' })
export class TeamStore {
  /** Toutes les équipes, dans l'ordre d'enregistrement. */
  readonly teams = signal<Team[]>([]);

  /** Équipes par ordre alphabétique, pour « Mes équipes ». */
  readonly sortedTeams = computed(() =>
    [...this.teams()].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
  );

  /** Vrai si une donnée stockée n'a pas pu être relue : les écrans l'indiquent. */
  readonly readError = signal(false);

  constructor() {
    this.load();
  }

  /** Équipe d'identifiant donné, ou undefined. */
  find(id: string): Team | undefined {
    return this.teams().find((team) => team.id === id);
  }

  /**
   * Enregistre une équipe : création sans identifiant, mise à jour sinon.
   * Le stockage est écrit avant la mémoire : si l'écriture échoue, rien ne change et la valeur est null.
   */
  save(input: TeamInput): Team | null {
    const team: Team = {
      id: input.id ?? newTeamId(),
      name: normalizeSpaces(input.name),
      members: [...input.members],
    };
    const exists = this.teams().some((existing) => existing.id === team.id);
    const next = exists
      ? this.teams().map((existing) => (existing.id === team.id ? team : existing))
      : [...this.teams(), team];
    if (!this.write(next)) {
      return null;
    }
    this.teams.set(next);
    this.readError.set(false);
    return team;
  }

  private write(teams: Team[]): boolean {
    try {
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify({ version: 2, teams }));
      return true;
    } catch {
      return false;
    }
  }

  private load(): void {
    let raw: string | null;
    try {
      raw = localStorage.getItem(TEAMS_STORAGE_KEY);
    } catch {
      // Stockage inaccessible (navigation privée stricte, site bloqué) : on démarre sans équipe.
      return;
    }
    if (raw === null) {
      this.loadLegacy();
      return;
    }
    try {
      const { teams, invalid } = parseStoredTeams(raw);
      this.teams.set(teams);
      this.readError.set(invalid);
    } catch {
      this.readError.set(true);
    }
  }

  /** Migre l'équipe de la version 1 vers le nouveau stockage, puis retire l'ancienne clé. */
  private loadLegacy(): void {
    let raw: string | null;
    try {
      raw = localStorage.getItem(LEGACY_TEAM_STORAGE_KEY);
    } catch {
      return;
    }
    if (raw === null) {
      return;
    }
    let team: Team | null;
    try {
      team = parseLegacyTeam(raw);
    } catch {
      team = null;
    }
    if (!team) {
      this.readError.set(true);
      return;
    }
    this.teams.set([team]);
    if (this.write([team])) {
      try {
        localStorage.removeItem(LEGACY_TEAM_STORAGE_KEY);
      } catch {
        // Ancienne clé non retirée : sans effet, la migration a déjà été écrite.
      }
    }
  }
}
