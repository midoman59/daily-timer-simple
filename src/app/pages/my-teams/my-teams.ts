import { Component, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { memberCountLabel } from '../../domain/team-validation';
import { TeamStore } from '../../services/team.store';

/** Écran (a) « Mes équipes » : liste des équipes, ouverture d'une équipe, création. */
@Component({
  selector: 'app-my-teams',
  imports: [RouterLink],
  templateUrl: './my-teams.html',
  styleUrl: './my-teams.css',
})
export class MyTeams {
  protected readonly store = inject(TeamStore);
  protected readonly memberCountLabel = memberCountLabel;

  private readonly title = viewChild<ElementRef<HTMLElement>>('title');

  constructor() {
    // Après un changement d'écran, le focus va au titre : le lecteur d'écran annonce le nouvel écran.
    afterNextRender(() => this.title()?.nativeElement.focus());
  }
}
