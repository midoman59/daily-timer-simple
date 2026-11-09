import { Component, inject } from '@angular/core';
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
