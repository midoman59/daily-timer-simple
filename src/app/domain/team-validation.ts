export const DEFAULT_DURATION_MINUTES = 15;
export const MIN_DURATION_MINUTES = 1;
export const MAX_DURATION_MINUTES = 120;
export const TEAM_NAME_MAX_LENGTH = 50;

/** Retire les espaces en début et fin, réduit les espaces multiples à un seul. */
export function normalizeSpaces(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/** Renvoie le message d'erreur du nom d'équipe, ou null si le nom est valide. */
export function validateTeamName(value: string): string | null {
  const name = normalizeSpaces(value);
  if (!name) {
    return "Donnez un nom à votre équipe.";
  }
  if (name.length > TEAM_NAME_MAX_LENGTH) {
    return `Le nom d'équipe ne peut pas dépasser ${TEAM_NAME_MAX_LENGTH} caractères.`;
  }
  return null;
}

/** Renvoie le message d'erreur de la durée (entier de 1 à 120 minutes), ou null. */
export function validateDuration(value: string): string | null {
  const text = value.trim();
  if (!text) {
    return 'Indiquez la durée de la Daily.';
  }
  if (!/^\d+$/.test(text)) {
    return 'Saisissez un nombre entier de minutes.';
  }
  const minutes = Number(text);
  if (minutes < MIN_DURATION_MINUTES || minutes > MAX_DURATION_MINUTES) {
    return `La durée doit être comprise entre ${MIN_DURATION_MINUTES} et ${MAX_DURATION_MINUTES} minutes.`;
  }
  return null;
}
