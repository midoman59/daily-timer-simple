export const TEAM_NAME_MAX_LENGTH = 50;
export const MEMBER_NAME_MAX_LENGTH = 30;
export const MIN_MEMBERS = 2;
export const MAX_MEMBERS = 15;

/** Libellé du compteur de membres : « 0 membre », « 1 membre », « 2 membres »… */
export function memberCountLabel(count: number): string {
  return count <= 1 ? `${count} membre` : `${count} membres`;
}

/** Retire les espaces en début et fin, réduit les espaces multiples à un seul. */
export function normalizeSpaces(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/** Renvoie le message d'erreur du nom d'équipe, ou null si le nom est valide. */
export function validateTeamName(value: string): string | null {
  const name = normalizeSpaces(value);
  if (!name) {
    return 'Donnez un nom à votre équipe.';
  }
  if (name.length > TEAM_NAME_MAX_LENGTH) {
    return `Le nom d'équipe ne dépasse pas ${TEAM_NAME_MAX_LENGTH} caractères.`;
  }
  return null;
}

/**
 * Renvoie le message d'erreur d'un prénom saisi, ou null si le prénom est valide.
 * Le doublon est insensible à la casse et sensible aux accents.
 */
export function validateMemberName(value: string, existing: readonly string[]): string | null {
  const name = normalizeSpaces(value);
  if (!name) {
    return 'Saisissez un prénom.';
  }
  if (name.length > MEMBER_NAME_MAX_LENGTH) {
    return `Le prénom ne dépasse pas ${MEMBER_NAME_MAX_LENGTH} caractères.`;
  }
  if (!/^[\p{L}\s'’-]+$/u.test(name) || !/\p{L}/u.test(name)) {
    return "Le prénom ne peut contenir que des lettres, espaces, traits d'union et apostrophes.";
  }
  const lowered = name.toLowerCase();
  if (existing.some((member) => member.toLowerCase() === lowered)) {
    return "Ce prénom existe déjà dans l'équipe.";
  }
  return null;
}
