import { Injectable, InjectionToken, OnDestroy, computed, inject, signal } from '@angular/core';
import {
  DailyRun,
  MemberPlan,
  OrderMode,
  currentSlot,
  createDailyRun,
  isFinished,
  nextMember,
  passMember,
  remainingMs as remainingOf,
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

/** Intervalle de rafraîchissement : le décompte reste fluide et à jour au moins une fois par seconde. */
const TICK_INTERVAL_MS = 250;

/** Daily en cours : l'équipe concernée et l'état de la Daily. Rien n'est enregistré. */
export interface DailySession {
  teamId: string;
  teamName: string;
  mode: OrderMode;
  run: DailyRun;
}

/**
 * Chronomètre de la Daily. Il ne démarre que sur demande explicite (start) et calcule
 * le temps restant à partir de l'heure du système, pour ne pas dériver.
 */
@Injectable({ providedIn: 'root' })
export class DailyTimerService implements OnDestroy {
  private readonly clock = inject(CLOCK);
  private readonly random = inject(RANDOM);
  private timerId: ReturnType<typeof setInterval> | null = null;

  /** Daily en cours, ou null. */
  readonly session = signal<DailySession | null>(null);

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

  /**
   * Lance la Daily : chaque membre reçoit son temps choisi à l'écran de préparation.
   * L'ordre aléatoire est tiré ici, une seule fois.
   */
  start(team: Team, members: readonly MemberPlan[], mode: OrderMode): void {
    this.clearTimer();
    const startedAt = this.clock();
    this.now.set(startedAt);
    const run = createDailyRun(members, mode, startedAt, this.random);
    this.session.set({ teamId: team.id, teamName: team.name, mode, run });
    this.timerId = setInterval(() => this.tick(), TICK_INTERVAL_MS);
  }

  /** « Passer au suivant ». */
  next(): void {
    this.update((run) => nextMember(run, this.clock()));
  }

  /** « Passer » sur une ligne, ou « Passer ce membre » pour celui qui parle. */
  pass(index: number): void {
    this.update((run) => passMember(run, index, this.clock()));
  }

  /** Relit l'heure du système. Appelé par l'intervalle ; exposé pour les tests. */
  tick(): void {
    this.now.set(this.clock());
  }

  stop(): void {
    this.clearTimer();
    this.session.set(null);
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private update(change: (run: DailyRun) => DailyRun): void {
    const session = this.session();
    if (!session) {
      return;
    }
    this.now.set(this.clock());
    this.session.set({ ...session, run: change(session.run) });
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
