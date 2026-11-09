import { Component, ElementRef, Injector, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { formatReportText } from '../../domain/report-text';
import { formatClock } from '../../domain/time-format';
import { DailyTimerService } from '../../services/daily-timer.service';

/** Message de copie : confirmation (status) ou échec (alert). */
interface CopyMessage {
  kind: 'status' | 'alert';
  text: string;
}

/**
 * Écran (f) : bilan de la Daily terminée. Rien n'est enregistré : quitter cet écran efface le bilan (D56).
 */
@Component({
  selector: 'app-bilan',
  templateUrl: './bilan.html',
  styleUrl: './bilan.css',
})
export class Bilan {
  private readonly timer = inject(DailyTimerService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  protected readonly report = this.timer.report;

  /** Résultat de la dernière copie, lu par les lecteurs d'écran. */
  protected readonly copyMessage = signal<CopyMessage | null>(null);

  private readonly title = viewChild<ElementRef<HTMLElement>>('title');

  /** Nombre de membres qui ont dépassé leur temps, en ne comptant que ceux qui ont parlé. */
  protected readonly overrunCount = computed(
    () => this.report()?.rows.filter((row) => row.overrunSeconds > 0).length ?? 0,
  );

  protected readonly summary = computed(() => {
    const count = this.overrunCount();
    if (count === 0) {
      return 'Aucun dépassement. Chaque membre est resté dans son temps.';
    }
    return count === 1 ? '1 membre a dépassé son temps.' : `${count} membres ont dépassé leur temps.`;
  });

  constructor() {
    afterNextRender(() => this.title()?.nativeElement.focus(), { injector: this.injector });
  }

  protected clock(seconds: number | null): string {
    return seconds === null ? '—' : formatClock(seconds);
  }

  /** Copie le bilan dans le presse-papiers. En cas d'échec, le texte reste sélectionnable. */
  protected async copy(): Promise<void> {
    const report = this.report();
    if (!report) {
      return;
    }
    const text = formatReportText(report.teamName, report.dateLabel, report.rows);
    try {
      await navigator.clipboard.writeText(text);
      this.copyMessage.set({ kind: 'status', text: 'Bilan copié.' });
    } catch {
      this.copyMessage.set({ kind: 'alert', text: 'Copie impossible : sélectionnez le texte du bilan.' });
    }
  }

  /** « Retour à l'équipe » : le bilan est effacé, la présentation de la même équipe s'ouvre. */
  protected back(): void {
    const teamId = this.report()?.teamId;
    this.timer.report.set(null);
    this.router.navigate(teamId ? ['/equipe', teamId] : ['/equipes']);
  }
}
