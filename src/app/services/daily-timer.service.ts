import { Injectable, InjectionToken, OnDestroy, computed, inject, signal } from '@angular/core';
import {
  DailyRun,
  MemberPlan,
  OrderMode,
  ReportRow,
  createDailyRun,
  currentSlot,
  elapsedMs,
  isFinished,
  isPaused,
  nextMember,
  passMember,
  pause as pauseRun,
  remainingMs as remainingOf,
  reportRows,
  resume as resumeRun,
} from '../domain/daily-run';
import { formatClock } from '../domain/time-format';
import { Team } from '../domain/team.model';

/** Source de l'heure, injectable pour les tests. Par défaut, l'heure du système. */
export const CLOCK = new InjectionToken<() => number>('CLOCK', {
  providedIn: 'root',
  factory: () => () => Date.now(),
});

/** Tirage aléatoire, injectable pour les tests. Par défaut, Math.random. */
export const RANDOM = new InjectionToken<() => number>('RANDOM', {
  providedIn: 'root',
  factory: () => () => Math.random(),
});

/** Stockage de la Daily en cours, relu à la réouverture (S27). */
export const DAILY_STORAGE_KEY = 'daily-timer-simple.daily.v1';

/** Intervalle de rafraîchissement : le décompte reste à jour au moins une fois par seconde. */
const TICK_INTERVAL_MS = 250;

const STATUSES = ['waiting', 'current', 'done', 'passed'];

/** Daily en cours : l'équipe concernée et l'état de la Daily. */
export interface DailySession {
  teamId: string;
  teamName: string;
  mode: OrderMode;
  run: DailyRun;
}

/** Bilan d'une Daily terminée. Il n'est jamais enregistré : il disparaît au rechargement (D56). */
export interface DailyReport {
  teamId: string;
  teamName: string;
  dateLabel: string;
  rows: ReportRow[];
}

/** Dialogue ouvert pendant la Daily : arrêt depuis le bouton, ou garde de sortie vers une autre route. */
export type DailyConfirm = { kind: 'stop' } | { kind: 'leave'; url: string } | null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Relit une Daily du stockage. Renvoie null si la forme n'est pas celle attendue. */
function parseSession(raw: string): DailySession | null {
  const data: unknown = JSON.parse(raw);
  if (!isRecord(data) || data['version'] !== 1 || typeof data['teamId'] !== 'string') {
    return null;
  }
  const run = data['run'];
  if (typeof data['teamName'] !== 'string' || !isRecord(run) || !Array.isArray(run['order'])) {
    return null;
  }
  const order = run['order'] as unknown[];
  const valid = order.every(
    (slot) =>
      isRecord(slot) &&
      typeof slot['name'] === 'string' &&
      typeof slot['allottedSeconds'] === 'number' &&
      typeof slot['status'] === 'string' &&
      STATUSES.includes(slot['status']) &&
      (slot['spokenMs'] === null || typeof slot['spokenMs'] === 'number'),
  );
  const index = run['currentIndex'];
  const elapsed = run['elapsedMs'];
  if (
    !valid ||
    typeof index !== 'number' ||
    !Number.isInteger(index) ||
    index < -1 ||
    index >= order.length ||
    typeof elapsed !== 'number' ||
    elapsed < 0
  ) {
    return null;
  }
  const mode: OrderMode = data['mode'] === 'random' ? 'random' : 'team';
  return {
    teamId: data['teamId'],
    teamName: data['teamName'],
    mode,
    run: {
      order: order as DailyRun['order'],
      currentIndex: index,
      elapsedMs: elapsed,
      runningSince: null,
    },
  };
}

/**
 * Chronomètre de la Daily. Le décompte ne part qu'au clic « Commencer la Daily » (start) et se calcule
 * à partir de l'heure du système. La Daily est enregistrée au fil de l'eau : à la réouverture, elle
 * reprend figée, et rien ne repart sans clic (resume).
 */
@Injectable({ providedIn: 'root' })
export class DailyTimerService implements OnDestroy {
  private readonly clock = inject(CLOCK);
  private readonly random = inject(RANDOM);
  private timerId: ReturnType<typeof setInterval> | null = null;

  /** Daily en cours, ou null. */
  readonly session = signal<DailySession | null>(null);

  /** Bilan de la dernière Daily terminée, ou null. */
  readonly report = signal<DailyReport | null>(null);

  /** Dialogue ouvert (arrêt ou garde de sortie), ou null. */
  readonly confirm = signal<DailyConfirm>(null);

  /** Vrai si le décompte tournait quand un dialogue s'est ouvert : il reprend à la fermeture. */
  private resumeAfterConfirm = false;

  /** Dernier instant lu, mis à jour à chaque tick. */
  private readonly now = signal(0);

  /** État de la Daily en cours, ou null. */
  readonly run = computed(() => this.session()?.run ?? null);

  /** Membre qui parle, ou null (Daily arrêtée ou terminée). */
  readonly current = computed(() => {
    const run = this.run();
    return run ? currentSlot(run) : null;
  });

  /** Vrai quand la liste est épuisée : plus personne ne parle. */
  readonly finished = computed(() => {
    const run = this.run();
    return run !== null && isFinished(run);
  });

  /** Vrai quand la Daily est figée (reprise à la réouverture, ou dialogue ouvert). */
  readonly paused = computed(() => {
    const run = this.run();
    return run !== null && isPaused(run);
  });

  /** Temps restant du membre courant, en millisecondes ; négatif en dépassement. */
  readonly remainingMs = computed(() => {
    const run = this.run();
    return run ? remainingOf(run, this.now()) : 0;
  });

  readonly isOverrun = computed(() => this.current() !== null && this.remainingMs() < 0);

  /** Décompte « mm:ss », arrêté à 00:00 en dépassement. */
  readonly countdown = computed(() => formatClock(Math.ceil(Math.max(this.remainingMs(), 0) / 1000)));

  /** Dépassement « mm:ss » (sans le signe +). */
  readonly overrunLabel = computed(() => formatClock(Math.floor(Math.max(-this.remainingMs(), 0) / 1000)));

  constructor() {
    this.restore();
    if (this.session()) {
      this.startTimer();
    }
  }

  /**
   * Lance la Daily : chaque membre reçoit son temps choisi à l'écran de préparation.
   * L'ordre aléatoire est tiré ici, une seule fois.
   */
  start(team: Team, members: readonly MemberPlan[], mode: OrderMode): void {
    const startedAt = this.clock();
    this.now.set(startedAt);
    const run = createDailyRun(members, mode, startedAt, this.random);
    this.session.set({ teamId: team.id, teamName: team.name, mode, run });
    this.persist();
    this.startTimer();
  }

  /** « Suivant ». */
  next(): void {
    this.update((run, now) => nextMember(run, now));
  }

  /** « Passer » sur une ligne, ou « Passer ce membre » pour celui qui parle. */
  pass(index: number): void {
    this.update((run, now) => passMember(run, index, now));
  }

  /** Fige le décompte. */
  pause(): void {
    this.update((run, now) => pauseRun(run, now));
  }

  /** Relance le décompte, sur demande explicite de l'organisateur. */
  resume(): void {
    this.update((run, now) => resumeRun(run, now));
  }

  /**
   * « Terminer la Daily » : le temps du membre courant est enregistré, le bilan est préparé,
   * et la Daily n'existe plus (rien n'est conservé).
   */
  finish(): void {
    const session = this.session();
    if (!session) {
      return;
    }
    const now = this.clock();
    const run = nextMember(session.run, now);
    this.report.set({
      teamId: session.teamId,
      teamName: session.teamName,
      dateLabel: new Date(now).toLocaleDateString('fr-FR'),
      rows: reportRows(run),
    });
    this.stop();
  }

  /** Arrête la Daily sans bilan. */
  stop(): void {
    this.clearTimer();
    this.session.set(null);
    this.confirm.set(null);
    this.resumeAfterConfirm = false;
    this.forget();
  }

  /** Ouvre le dialogue d'arrêt depuis « Arrêter la Daily ». */
  askStop(): void {
    this.openConfirm({ kind: 'stop' });
  }

  /** Ouvre la garde de sortie : la navigation vers `url` attend la confirmation. */
  askLeave(url: string): void {
    this.openConfirm({ kind: 'leave', url });
  }

  /** « Continuer » : ferme le dialogue, et le décompte reprend s'il tournait avant. */
  cancelConfirm(): void {
    this.confirm.set(null);
    if (this.resumeAfterConfirm) {
      this.resumeAfterConfirm = false;
      this.resume();
    }
  }

  /** Relit l'heure du système. Appelé par l'intervalle ; exposé pour les tests. */
  tick(): void {
    this.now.set(this.clock());
    if (this.run() && !this.paused()) {
      this.persist();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private openConfirm(confirm: NonNullable<DailyConfirm>): void {
    if (this.confirm() === null) {
      this.resumeAfterConfirm = this.run() !== null && !this.paused() && !this.finished();
    }
    this.pause();
    this.confirm.set(confirm);
  }

  private update(change: (run: DailyRun, now: number) => DailyRun): void {
    const session = this.session();
    if (!session) {
      return;
    }
    const now = this.clock();
    this.now.set(now);
    this.session.set({ ...session, run: change(session.run, now) });
    this.persist();
  }

  private startTimer(): void {
    this.clearTimer();
    this.now.set(this.clock());
    this.timerId = setInterval(() => this.tick(), TICK_INTERVAL_MS);
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Enregistre la Daily figée à l'instant présent : à la réouverture, le temps écoulé pendant la
   * fermeture ne compte pas. Une écriture refusée par le navigateur n'interrompt pas la Daily.
   */
  private persist(): void {
    const session = this.session();
    if (!session) {
      return;
    }
    const snapshot = {
      version: 1,
      teamId: session.teamId,
      teamName: session.teamName,
      mode: session.mode,
      run: {
        order: session.run.order,
        currentIndex: session.run.currentIndex,
        elapsedMs: isFinished(session.run) ? 0 : elapsedMs(session.run, this.clock()),
        runningSince: null,
      },
    };
    try {
      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Stockage indisponible : la Daily continue, elle ne sera simplement pas reprise.
    }
  }

  private forget(): void {
    try {
      localStorage.removeItem(DAILY_STORAGE_KEY);
    } catch {
      // Rien à retirer si le stockage est indisponible.
    }
  }

  /** Relit la Daily enregistrée. Une donnée illisible est retirée, sans erreur visible. */
  private restore(): void {
    this.now.set(this.clock());
    let raw: string | null;
    try {
      raw = localStorage.getItem(DAILY_STORAGE_KEY);
    } catch {
      return;
    }
    if (raw === null) {
      return;
    }
    let session: DailySession | null = null;
    try {
      session = parseSession(raw);
    } catch {
      session = null;
    }
    if (session) {
      this.session.set(session);
    } else {
      this.forget();
    }
  }
}
