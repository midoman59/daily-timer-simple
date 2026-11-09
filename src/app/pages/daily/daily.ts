import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { isFinished } from '../../domain/daily-run';
import { DailyTimerService } from '../../services/daily-timer.service';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

/**
 * Écran (e) : la Daily et son chronomètre. Le chronomètre part au clic « Commencer la Daily » (d).
 * La Daily ne se termine que par « Terminer la Daily », qui ouvre le bilan (f). Une Daily en cours
 * reste enregistrée : à la réouverture, elle est figée jusqu'à « Reprendre la Daily ».
 */
@Component({
  selector: 'app-daily',
  imports: [ConfirmDialog],
  templateUrl: './daily.html',
  styleUrl: './daily.css',
})
export class Daily {
  protected readonly timer = inject(DailyTimerService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  /** Dialogue ouvert : arrêt depuis le bouton, ou garde de sortie. */
  protected readonly confirm = this.timer.confirm;

  /** Message lu une seule fois par les lecteurs d'écran : démarrage, dépassement. */
  protected readonly announcement = signal('');

  /** Bandeau de pause : la Daily est figée et aucun dialogue n'est ouvert. */
  protected readonly held = computed(() => this.timer.paused() && this.confirm() === null);

  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private readonly primaryButton = viewChild<ElementRef<HTMLButtonElement>>('primaryButton');
  private readonly stopTrigger = viewChild<ElementRef<HTMLButtonElement>>('stopTrigger');

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
    if (first && !this.timer.paused()) {
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

  /** « Reprendre la Daily » : seul clic qui relance le décompte après une reprise. */
  protected resume(): void {
    this.timer.resume();
    afterNextRender(() => this.primaryButton()?.nativeElement.focus(), { injector: this.injector });
  }

  /** « Suivant », ou « Terminer la Daily » au dernier membre. */
  protected advance(): void {
    if (this.endsDaily()) {
      this.finish();
      return;
    }
    this.timer.next();
  }

  /** « Passer ce membre » (celui qui parle, sauf le dernier) ou « Passer » sur une ligne. */
  protected pass(index: number): void {
    this.timer.pass(index);
    // Une ligne passée disparaît : le focus va à l'action principale, pour ne pas se perdre.
    afterNextRender(() => this.primaryButton()?.nativeElement.focus(), { injector: this.injector });
  }

  /** Termine la Daily et ouvre le bilan de cette équipe. */
  protected finish(): void {
    const teamId = this.timer.session()?.teamId;
    this.timer.finish();
    this.router.navigate(teamId ? ['/equipe', teamId, 'bilan'] : ['/equipes']);
  }

  protected askStop(): void {
    this.timer.askStop();
  }

  /** « Continuer » : le dialogue se ferme, le décompte reprend s'il tournait. */
  protected keepDaily(): void {
    const kind = this.confirm()?.kind;
    this.timer.cancelConfirm();
    afterNextRender(
      () => (kind === 'stop' ? this.stopTrigger() : this.primaryButton())?.nativeElement.focus(),
      { injector: this.injector },
    );
  }

  /** « Arrêter » dans le dialogue d'arrêt : la Daily est effacée, retour à la présentation. */
  protected stopDaily(): void {
    const teamId = this.timer.session()?.teamId;
    this.timer.stop();
    this.router.navigate(teamId ? ['/equipe', teamId] : ['/equipes']);
  }

  /** « Arrêter » dans la garde de sortie : la Daily est effacée, puis la navigation demandée se fait. */
  protected leaveDaily(): void {
    const request = this.confirm();
    const teamId = this.timer.session()?.teamId;
    this.timer.stop();
    if (request?.kind === 'leave') {
      this.router.navigateByUrl(request.url);
    } else {
      this.router.navigate(teamId ? ['/equipe', teamId] : ['/equipes']);
    }
  }
}
