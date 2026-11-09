import {
  Component,
  ElementRef,
  HostListener,
  Injector,
  OnDestroy,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { isFinished } from '../../domain/daily-run';
import { DailyTimerService } from '../../services/daily-timer.service';

/**
 * Écran (e) : la Daily et son chronomètre. Le chronomètre part seulement quand la Daily a été lancée
 * depuis la préparation ; quitter l'écran arrête la Daily (aucune reprise seule, décision D28).
 */
@Component({
  selector: 'app-daily',
  imports: [RouterLink],
  templateUrl: './daily.html',
  styleUrl: './daily.css',
})
export class Daily implements OnDestroy {
  protected readonly timer = inject(DailyTimerService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  /** Confirmation avant arrêt, affichée dans un dialogue. */
  protected readonly confirming = signal(false);

  /** Message lu une seule fois par les lecteurs d'écran : démarrage, dépassement. */
  protected readonly announcement = signal('');

  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly primaryButton = viewChild<ElementRef<HTMLButtonElement>>('primaryButton');
  private readonly stopTrigger = viewChild<ElementRef<HTMLButtonElement>>('stopTrigger');
  private readonly continueButton = viewChild<ElementRef<HTMLButtonElement>>('continueButton');
  private readonly confirmStopButton = viewChild<ElementRef<HTMLButtonElement>>('confirmStop');

  /** Membre dont le dépassement a déjà été annoncé : une seule annonce par membre. */
  private overrunAnnouncedFor = -1;

  /** Libellé du mode d'ordre utilisé pour cette Daily. */
  protected readonly modeLabel = computed(() =>
    this.timer.session()?.mode === 'random' ? 'Ordre aléatoire' : "Ordre de l'équipe",
  );

  /** Vrai quand le membre qui parle est le dernier : l'action principale devient « Terminer la Daily ». */
  protected readonly isLast = computed(() => {
    const run = this.timer.run();
    if (!run || isFinished(run)) {
      return false;
    }
    return !run.order.some((slot, index) => index > run.currentIndex && slot.status === 'waiting');
  });

  protected readonly endsDaily = computed(() => this.timer.finished() || this.isLast());

  /** Position du membre qui parle dans l'ordre, ou -1 quand la Daily est terminée. */
  protected readonly currentIndex = computed(() => this.timer.run()?.currentIndex ?? -1);

  protected readonly clockLabel = computed(() => {
    const current = this.timer.current();
    return current ? `Temps restant pour ${current.name}` : 'Daily terminée';
  });

  constructor() {
    // Le focus va sur le nom de l'équipe, jamais sur « Arrêter » (pas d'arrêt accidentel par Entrée).
    afterNextRender(() => this.heading()?.nativeElement.focus(), { injector: this.injector });

    const first = this.timer.current();
    if (first) {
      this.announcement.set(`Daily démarrée, la parole est à ${first.name}`);
    }

    effect(() => {
      const run = this.timer.run();
      if (this.timer.isOverrun() && run && run.currentIndex !== this.overrunAnnouncedFor) {
        this.overrunAnnouncedFor = run.currentIndex;
        this.announcement.set('Temps dépassé');
      }
    });
  }

  /**
   * Quitter l'écran sans passer par « Arrêter » (retour arrière, changement de route) arrête la Daily.
   * Le chronomètre ne continue jamais hors de l'écran, et ne reprend pas seul.
   */
  ngOnDestroy(): void {
    this.timer.stop();
  }

  /** « Passer au suivant », ou « Terminer la Daily » au dernier membre. */
  protected primary(): void {
    if (this.endsDaily()) {
      this.endDaily();
      return;
    }
    this.timer.next();
  }

  /** « Passer ce membre » (celui qui parle) ou « Passer » sur une ligne (membre à venir). */
  protected pass(index: number): void {
    this.timer.pass(index);
    // Une ligne passée disparaît : le focus va à l'action principale, pour ne pas se perdre.
    afterNextRender(() => this.primaryButton()?.nativeElement.focus(), { injector: this.injector });
  }

  /** Termine la Daily et revient à la présentation de l'équipe. */
  protected endDaily(): void {
    const teamId = this.timer.session()?.teamId;
    this.timer.stop();
    this.router.navigate(teamId ? ['/equipe', teamId] : ['/equipes']);
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
    this.endDaily();
  }

  /**
   * Focus hors du dialogue pendant la confirmation (clic sur le voile, focus sur BODY) : Tab et Maj+Tab
   * ramènent le focus dans le dialogue, au lieu de laisser le navigateur atteindre le fond. Échap ferme
   * aussi la confirmation (= Continuer), même sans focus dans le dialogue.
   */
  @HostListener('document:keydown', ['$event'])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.confirming() || (event.key !== 'Tab' && event.key !== 'Escape')) {
      return;
    }
    const first = this.continueButton()?.nativeElement;
    const last = this.confirmStopButton()?.nativeElement;
    if (!first || !last) {
      return;
    }
    const dialog = first.closest('[role="alertdialog"]');
    if (dialog?.contains(document.activeElement)) {
      return; // Déjà dans le dialogue : onDialogKeydown gère le piège et Échap.
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.continueDaily();
      return;
    }
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
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
