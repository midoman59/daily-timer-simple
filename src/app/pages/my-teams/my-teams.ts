import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { memberCountLabel } from '../../domain/team-validation';
import { Team } from '../../domain/team.model';
import { TeamStore } from '../../services/team.store';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

/** Écran (a) « Mes équipes » : liste triée, ouverture, création, suppression avec confirmation. */
@Component({
  selector: 'app-my-teams',
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './my-teams.html',
  styleUrl: './my-teams.css',
})
export class MyTeams {
  protected readonly store = inject(TeamStore);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  protected readonly memberCountLabel = memberCountLabel;

  /** Équipe dont la suppression attend confirmation (dialogue 6.1), ou null. */
  protected readonly pendingDelete = signal<Team | null>(null);

  private readonly title = viewChild<ElementRef<HTMLElement>>('title');
  private readonly newButton = viewChild<ElementRef<HTMLAnchorElement>>('newButton');

  /** Bouton « Supprimer » qui a ouvert le dialogue : le focus y revient si l'on annule. */
  private returnFocus: HTMLElement | null = null;

  constructor() {
    // Après un changement d'écran, le focus va au titre : le lecteur d'écran annonce le nouvel écran.
    afterNextRender(() => this.title()?.nativeElement.focus(), { injector: this.injector });
  }

  protected askDelete(team: Team, trigger: EventTarget | null): void {
    this.returnFocus = trigger instanceof HTMLElement ? trigger : null;
    this.pendingDelete.set(team);
  }

  protected cancelDelete(): void {
    this.pendingDelete.set(null);
    afterNextRender(() => this.returnFocus?.focus(), { injector: this.injector });
  }

  /** Supprime l'équipe. Si c'était la dernière, l'application affiche la création (b). */
  protected confirmDelete(): void {
    const team = this.pendingDelete();
    if (!team) {
      return;
    }
    this.store.remove(team.id);
    this.pendingDelete.set(null);
    if (this.store.teams().length === 0) {
      this.router.navigate(['/equipe/nouvelle']);
      return;
    }
    afterNextRender(() => this.newButton()?.nativeElement.focus(), { injector: this.injector });
  }
}
