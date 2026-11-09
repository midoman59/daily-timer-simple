import { Component, ElementRef, Injector, afterNextRender, inject, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DailyTimerService } from '../../services/daily-timer.service';
import { TeamStore } from '../../services/team.store';

@Component({
  selector: 'app-presentation',
  imports: [RouterLink],
  templateUrl: './presentation.html',
  styleUrl: './presentation.css',
})
export class Presentation {
  protected readonly store = inject(TeamStore);
  private readonly timer = inject(DailyTimerService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  private readonly title = viewChild<ElementRef<HTMLElement>>('title');

  constructor() {
    // Après un changement d'écran, le focus va au titre : le lecteur d'écran annonce le nouvel écran.
    afterNextRender(() => this.title()?.nativeElement.focus(), { injector: this.injector });
  }

  /** Lance la Daily : le chronomètre part ici, jamais à l'ouverture de l'écran suivant. */
  protected startDaily(): void {
    const team = this.store.team();
    if (!team || team.members.length < 2) {
      return;
    }
    this.timer.start(team);
    this.router.navigate(['/daily']);
  }
}
