import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TeamStore } from '../../services/team.store';

@Component({
  selector: 'app-presentation',
  imports: [RouterLink],
  templateUrl: './presentation.html',
  styleUrl: './presentation.css',
})
export class Presentation {
  protected readonly store = inject(TeamStore);
}
