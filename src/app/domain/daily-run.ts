/** Ordre de passage choisi pour une Daily : celui de l'équipe, ou un tirage au démarrage. */
export type OrderMode = 'team' | 'random';

/** Temps de parole choisi pour un membre, pour une seule Daily. */
export interface MemberPlan {
  name: string;
  minutes: number;
}

/**
 * Statut d'un membre dans la Daily : à venir, qui parle, fait (a parlé), passé (absent, sans temps).
 * Un membre passé ne revient pas dans la même Daily.
 */
export type SlotStatus = 'waiting' | 'current' | 'done' | 'passed';

export interface Slot {
  name: string;
  allottedSeconds: number;
  status: SlotStatus;
}

/** État pur de la Daily : ordre fixe, membre courant (-1 quand la Daily est terminée), début de son tour. */
export interface DailyRun {
  order: Slot[];
  currentIndex: number;
  turnStartedAt: number;
}

/** Temps de parole par membre : un entier de 1 à 5 minutes. Renvoie le message d'erreur, ou null. */
export function validateMinutes(value: string): string | null {
  const minutes = Number(value);
  return /^[1-5]$/.test(value) && Number.isInteger(minutes)
    ? null
    : 'Choisissez une durée entre 1 et 5 minutes.';
}

/** Mélange de Fisher-Yates ; `random` est injectable pour les tests. */
function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Crée la Daily : l'ordre est fixé ici, et le premier membre commence son tour à `startedAt`. */
export function createDailyRun(
  members: readonly MemberPlan[],
  mode: OrderMode,
  startedAt: number,
  random: () => number = Math.random,
): DailyRun {
  const ordered = mode === 'random' ? shuffle(members, random) : [...members];
  const order: Slot[] = ordered.map((member, index) => ({
    name: member.name,
    allottedSeconds: member.minutes * 60,
    status: index === 0 ? 'current' : 'waiting',
  }));
  return { order, currentIndex: order.length > 0 ? 0 : -1, turnStartedAt: startedAt };
}

/** Membre qui parle, ou null si la Daily est terminée. */
export function currentSlot(run: DailyRun): Slot | null {
  return run.currentIndex >= 0 ? run.order[run.currentIndex] : null;
}

/** Vrai quand plus aucun membre ne doit parler. */
export function isFinished(run: DailyRun): boolean {
  return run.currentIndex < 0;
}

/** Temps restant du membre courant, en millisecondes ; négatif en dépassement, 0 quand terminée. */
export function remainingMs(run: DailyRun, now: number): number {
  const slot = currentSlot(run);
  if (!slot) {
    return 0;
  }
  return slot.allottedSeconds * 1000 - (now - run.turnStartedAt);
}

/** Donne la parole au membre en attente suivant, ou termine la Daily s'il n'y en a plus. */
function advanceFrom(order: Slot[], fromIndex: number, now: number): DailyRun {
  const nextIndex = order.findIndex((slot, index) => index > fromIndex && slot.status === 'waiting');
  if (nextIndex < 0) {
    return { order, currentIndex: -1, turnStartedAt: now };
  }
  const next = order.map((slot, index) => (index === nextIndex ? { ...slot, status: 'current' as const } : slot));
  return { order: next, currentIndex: nextIndex, turnStartedAt: now };
}

/** « Passer au suivant » : le membre qui parle est fait, et le suivant reçoit la parole à `now`. */
export function nextMember(run: DailyRun, now: number): DailyRun {
  const current = currentSlot(run);
  if (!current) {
    return run;
  }
  const order = run.order.map((slot, index) =>
    index === run.currentIndex ? { ...slot, status: 'done' as const } : slot,
  );
  return advanceFrom(order, run.currentIndex, now);
}

/**
 * « Passer ce membre » ou « Passer » sur une ligne : le membre passe, sans temps, et ne revient pas.
 * Si c'est le membre qui parle, la parole passe au suivant à `now`. Un membre déjà fait ou passé est inchangé.
 */
export function passMember(run: DailyRun, index: number, now: number): DailyRun {
  const slot = run.order[index];
  if (!slot || slot.status === 'done' || slot.status === 'passed') {
    return run;
  }
  const order = run.order.map((item, i) => (i === index ? { ...item, status: 'passed' as const } : item));
  if (index !== run.currentIndex) {
    return { ...run, order };
  }
  return advanceFrom(order, index, now);
}
