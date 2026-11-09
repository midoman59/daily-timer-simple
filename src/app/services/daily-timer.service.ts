import { Injectable, InjectionToken, OnDestroy, computed, inject, signal } from '@angular/core';
import { formatClock } from '../domain/time-format';
import { Team } from '../domain/team.model';

/** Source de l'heure, injectable pour les tests. Par défaut, l'heure du système. */
export const CLOCK = new InjectionToken<() => number>('CLOCK', {
  providedIn: 'root',
  factory: () => () => Date.now(),
});

/** Intervalle de rafraîchissement : le décompte reste fluide et à jour au moins une fois par seconde. */
const TICK_INTERVAL_MS = 250;

export interface RunningDaily {
  team: Team;
  startedAt: number;
}

/**
 * Chronomètre de la Daily. Il ne démarre que sur demande explicite (start) et calcule
 * le temps restant à partir de l'heure du système, pour ne pas dériver.
 */
@Injectable({ providedIn: 'root' })
export class DailyTimerService implements OnDestroy {
  private readonly clock = inject(CLOCK);
  private timerId: ReturnType<typeof setInterval> | null = null;

  /** Daily en cours, ou null. */
  readonly session = signal<RunningDaily | null>(null);

  /** Dernier instant lu, mis à jour à chaque tick. */
  private readonly now = signal(0);

  /** Temps restant en millisecondes ; négatif en dépassement. */
  readonly remainingMs = computed(() => {
    const running = this.session();
    if (!running) {
      return 0;
    }
    return running.team.durationMinutes * 60_000 - (this.now() - running.startedAt);
  });

  readonly isOverrun = computed(() => this.session() !== null && this.remainingMs() < 0);

  /** Décompte « mm:ss », arrêté à 00:00 en dépassement. */
  readonly countdown = computed(() => formatClock(Math.ceil(Math.max(this.remainingMs(), 0) / 1000)));

  /** Dépassement « mm:ss » (sans le signe +). */
  readonly overrunLabel = computed(() => formatClock(Math.floor(Math.max(-this.remainingMs(), 0) / 1000)));

  start(team: Team): void {
    this.clearTimer();
    const startedAt = this.clock();
    this.now.set(startedAt);
    this.session.set({ team, startedAt });
    this.timerId = setInterval(() => this.tick(), TICK_INTERVAL_MS);
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

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
