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
  /** Temps réellement parlé, en millisecondes, une fois le tour terminé. */
  spokenMs: number | null;
}

/**
 * État pur de la Daily. `elapsedMs` est le temps parlé du membre courant avant la dernière pause ;
 * `runningSince` vaut l'heure de reprise quand le décompte tourne, et null quand il est figé.
 */
export interface DailyRun {
  order: Slot[];
  currentIndex: number;
  elapsedMs: number;
  runningSince: number | null;
}

/** Une ligne du bilan (écran f). */
export interface ReportRow {
  name: string;
  passed: boolean;
  spokenSeconds: number | null;
  allottedSeconds: number;
  overrunSeconds: number;
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

/** Crée la Daily : l'ordre est fixé ici, et le premier membre commence à `startedAt`. */
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
    spokenMs: null,
  }));
  return {
    order,
    currentIndex: order.length > 0 ? 0 : -1,
    elapsedMs: 0,
    runningSince: order.length > 0 ? startedAt : null,
  };
}

/** Membre qui parle, ou null si la Daily est terminée. */
export function currentSlot(run: DailyRun): Slot | null {
  return run.currentIndex >= 0 ? run.order[run.currentIndex] : null;
}

/** Vrai quand plus aucun membre ne doit parler. */
export function isFinished(run: DailyRun): boolean {
  return run.currentIndex < 0;
}

/** Vrai quand le décompte est figé (pause, dialogue, ou reprise en attente d'un clic). */
export function isPaused(run: DailyRun): boolean {
  return !isFinished(run) && run.runningSince === null;
}

/** Temps parlé par le membre courant, en millisecondes, pauses exclues. */
export function elapsedMs(run: DailyRun, now: number): number {
  return run.elapsedMs + (run.runningSince !== null ? now - run.runningSince : 0);
}

/** Temps restant du membre courant, en millisecondes ; négatif en dépassement, 0 quand terminée. */
export function remainingMs(run: DailyRun, now: number): number {
  const slot = currentSlot(run);
  if (!slot) {
    return 0;
  }
  return slot.allottedSeconds * 1000 - elapsedMs(run, now);
}

/** Fige le décompte à `now`. Sans effet si la Daily est déjà figée ou terminée. */
export function pause(run: DailyRun, now: number): DailyRun {
  if (isFinished(run) || run.runningSince === null) {
    return run;
  }
  return { ...run, elapsedMs: elapsedMs(run, now), runningSince: null };
}

/** Relance le décompte à `now`. Sans effet si la Daily tourne déjà ou est terminée. */
export function resume(run: DailyRun, now: number): DailyRun {
  if (isFinished(run) || run.runningSince !== null) {
    return run;
  }
  return { ...run, runningSince: now };
}

/**
 * Clôt le tour du membre courant (temps parlé enregistré) et donne la parole au membre en attente
 * suivant, à zéro. Si la Daily est figée, le suivant reste figé. Termine la Daily s'il n'y en a plus.
 */
function advanceFrom(run: DailyRun, status: 'done' | 'passed', now: number): DailyRun {
  const index = run.currentIndex;
  const spokenMs = status === 'done' ? elapsedMs(run, now) : null;
  const order = run.order.map((slot, i) =>
    i === index ? { ...slot, status, spokenMs } : slot,
  );
  const nextIndex = order.findIndex((slot, i) => i > index && slot.status === 'waiting');
  if (nextIndex < 0) {
    return { order, currentIndex: -1, elapsedMs: 0, runningSince: null };
  }
  const running = run.runningSince !== null;
  return {
    order: order.map((slot, i) => (i === nextIndex ? { ...slot, status: 'current' as const } : slot)),
    currentIndex: nextIndex,
    elapsedMs: 0,
    runningSince: running ? now : null,
  };
}

/** « Suivant » : le membre qui parle est fait, et le suivant reçoit la parole. */
export function nextMember(run: DailyRun, now: number): DailyRun {
  if (!currentSlot(run)) {
    return run;
  }
  return advanceFrom(run, 'done', now);
}

/**
 * « Passer ce membre » ou « Passer » sur une ligne : le membre passe, sans temps, et ne revient pas.
 * Si c'est le membre qui parle, la parole passe au suivant. Un membre déjà fait ou passé est inchangé.
 */
export function passMember(run: DailyRun, index: number, now: number): DailyRun {
  const slot = run.order[index];
  if (!slot || slot.status === 'done' || slot.status === 'passed') {
    return run;
  }
  if (index !== run.currentIndex) {
    return {
      ...run,
      order: run.order.map((item, i) => (i === index ? { ...item, status: 'passed' as const } : item)),
    };
  }
  return advanceFrom(run, 'passed', now);
}

/** Lignes du bilan, dans l'ordre de passage effectif. Un membre passé n'a pas de temps. */
export function reportRows(run: DailyRun): ReportRow[] {
  return run.order.map((slot) => {
    const passed = slot.status === 'passed';
    const spokenSeconds = slot.spokenMs === null ? null : Math.floor(slot.spokenMs / 1000);
    const overrunSeconds =
      spokenSeconds === null ? 0 : Math.max(0, spokenSeconds - slot.allottedSeconds);
    return { name: slot.name, passed, spokenSeconds, allottedSeconds: slot.allottedSeconds, overrunSeconds };
  });
}

/** Temps de parole par membre : un entier de 1 à 5 minutes. Renvoie le message d'erreur, ou null. */
export function validateMinutes(value: string): string | null {
  const minutes = Number(value);
  return /^[1-5]$/.test(value) && Number.isInteger(minutes)
    ? null
    : 'Choisissez une durée entre 1 et 5 minutes.';
}
