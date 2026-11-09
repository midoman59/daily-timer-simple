import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  OnDestroy,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { DailyTimerService } from '../../services/daily-timer.service';

@Component({
  selector: 'app-daily',
  templateUrl: './daily.html',
  styleUrl: './daily.css',
})
export class Daily implements OnDestroy {
  protected readonly timer = inject(DailyTimerService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  protected readonly team = computed(() => this.timer.session()?.team ?? null);

  /** Confirmation avant arrêt, affichée dans un dialogue. */
  protected readonly confirming = signal(false);

  /** Message lu une seule fois par les lecteurs d'écran : démarrage, dépassement. */
  protected readonly announcement = signal('');

  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly stopTrigger = viewChild<ElementRef<HTMLButtonElement>>('stopTrigger');
  private readonly continueButton = viewChild<ElementRef<HTMLButtonElement>>('continueButton');
  private readonly confirmStopButton = viewChild<ElementRef<HTMLButtonElement>>('confirmStop');

  private overrunAnnounced = false;

  constructor() {
    // Le focus va sur le nom de l'équipe, jamais sur « Arrêter » (pas d'arrêt accidentel par Entrée).
    afterNextRender(() => this.heading()?.nativeElement.focus());

    const team = this.team();
    if (team) {
      this.announcement.set(`Daily démarrée, ${team.durationMinutes} minutes`);
    }

    effect(() => {
      if (this.timer.isOverrun() && !this.overrunAnnounced) {
        this.overrunAnnounced = true;
        this.announcement.set('Temps dépassé');
      }
    });
  }

  /**
   * Quitter l'écran sans passer par « Arrêter » (retour arrière, changement de route) arrête la Daily.
   * Le chronomètre ne continue jamais hors de l'écran, et ne reprend pas seul (décision D28).
   */
  ngOnDestroy(): void {
    this.timer.stop();
  }

  protected askStop(): void {
    this.confirming.set(true);
    afterNextRender(() => this.continueButton()?.nativeElement.focus(), { injector: this.injector });
  }

  protected continueDaily(): void {
    this.confirming.set(false);
    afterNextRender(() => this.stopTrigger()?.nativeElement.focus(), { injector: this.injector });
  }

  protected stopDaily(): void {
    this.timer.stop();
    this.router.navigate(['/presentation']);
  }

  /** Dans le dialogue : Échap = Continuer, Tab reste piégé entre les deux boutons. */
  protected onDialogKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.continueDaily();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    const first = this.continueButton()?.nativeElement;
    const last = this.confirmStopButton()?.nativeElement;
    if (!first || !last) {
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
