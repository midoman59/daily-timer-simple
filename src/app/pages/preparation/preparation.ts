import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderMode, validateMinutes } from '../../domain/daily-run';
import { MIN_MEMBERS } from '../../domain/team-validation';
import { DailyTimerService } from '../../services/daily-timer.service';
import { TeamStore } from '../../services/team.store';

/** Temps de parole proposés pour chaque membre, en minutes. */
export const MINUTE_OPTIONS = ['1', '2', '3', '4', '5'] as const;

/** Temps de parole pré-réglé pour chaque membre (brief, S10). */
const DEFAULT_MINUTES = '2';

/**
 * Écran (d) : préparation de la Daily. Le temps de chaque membre et l'ordre de passage
 * valent pour cette Daily seulement : rien n'est enregistré dans l'équipe.
 */
@Component({
  selector: 'app-preparation',
  imports: [RouterLink],
  templateUrl: './preparation.html',
  styleUrl: './preparation.css',
})
export class Preparation {
  private readonly store = inject(TeamStore);
  private readonly timer = inject(DailyTimerService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  private readonly title = viewChild<ElementRef<HTMLElement>>('title');
  private readonly minuteFields = viewChildren<ElementRef<HTMLSelectElement>>('minuteField');

  /** Identifiant de l'équipe préparée, lu dans l'URL. */
  private readonly teamId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  protected readonly team = computed(() => this.store.find(this.teamId));

  protected readonly options = MINUTE_OPTIONS;

  /** Temps choisi pour chaque membre, dans l'ordre de l'équipe (valeur texte d'un sélecteur). */
  protected readonly minutes = signal<string[]>([]);

  /** Ordre de passage choisi pour cette Daily. */
  protected readonly order = signal<OrderMode>('team');

  constructor() {
    afterNextRender(() => this.title()?.nativeElement.focus(), { injector: this.injector });
    const team = this.team();
    if (team) {
      this.minutes.set(team.members.map(() => DEFAULT_MINUTES));
    }
  }

  /** Message d'erreur du temps d'un membre, ou null. */
  protected timeError(index: number): string | null {
    return validateMinutes(this.minutes()[index] ?? '');
  }

  /** Vrai si la Daily peut commencer : au moins deux membres, et un temps valide pour chacun. */
  protected readonly canStart = computed(() => {
    const team = this.team();
    return (
      team !== undefined &&
      team.members.length >= MIN_MEMBERS &&
      this.minutes().length === team.members.length &&
      this.minutes().every((value) => validateMinutes(value) === null)
    );
  });

  protected setMinutes(index: number, value: string): void {
    this.minutes.update((list) => list.map((item, i) => (i === index ? value : item)));
  }

  /** « Appliquer à tous » : la valeur du premier membre est reprise pour chacun. */
  protected applyToAll(): void {
    const first = this.minutes()[0];
    if (first !== undefined) {
      this.minutes.set(this.minutes().map(() => first));
    }
  }

  protected setOrder(mode: OrderMode): void {
    this.order.set(mode);
  }

  /** Clic sur « Commencer la Daily » : le chronomètre part ici, et seulement ici. */
  protected start(): void {
    const team = this.team();
    if (!team) {
      return;
    }
    if (!this.canStart()) {
      const invalid = this.minutes().findIndex((value) => validateMinutes(value) !== null);
      this.minuteFields()[Math.max(invalid, 0)]?.nativeElement.focus();
      return;
    }
    const plan = team.members.map((name, i) => ({ name, minutes: Number(this.minutes()[i]) }));
    this.timer.start(team, plan, this.order());
    this.router.navigate(['/equipe', team.id, 'daily']);
  }

  protected cancel(): void {
    this.router.navigate(['/equipe', this.teamId]);
  }
}
