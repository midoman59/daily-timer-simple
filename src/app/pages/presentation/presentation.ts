import { Component, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MIN_MEMBERS, memberCountLabel } from '../../domain/team-validation';
import { TeamStore } from '../../services/team.store';

/** Durée d'affichage du message « Équipe enregistrée. » (design, écran c). */
const SAVED_MESSAGE_MS = 3000;

/** Écran (c) : présentation de l'équipe, avec le lancement de la Daily. */
@Component({
  selector: 'app-presentation',
  imports: [RouterLink],
  templateUrl: './presentation.html',
  styleUrl: './presentation.css',
})
export class Presentation {
  private readonly store = inject(TeamStore);
  private readonly router = inject(Router);

  private readonly title = viewChild<ElementRef<HTMLElement>>('title');

  /** Identifiant de l'équipe présentée, lu dans l'URL. */
  private readonly teamId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  /** Équipe présentée, ou undefined si elle n'existe plus. */
  protected readonly team = computed(() => this.store.find(this.teamId));

  protected readonly memberCountLabel = memberCountLabel;
  protected readonly minMembers = MIN_MEMBERS;

  /** Vrai juste après l'enregistrement : le message « Équipe enregistrée. » reste 3 secondes. */
  protected readonly justSaved = signal(
    (history.state as { saved?: boolean } | null)?.saved === true,
  );

  constructor() {
    // Après un changement d'écran, le focus va au titre : le lecteur d'écran annonce le nouvel écran.
    afterNextRender(() => this.title()?.nativeElement.focus());
    if (this.justSaved()) {
      setTimeout(() => this.justSaved.set(false), SAVED_MESSAGE_MS);
    }
  }

  /** Ouvre la préparation de la Daily : le chronomètre ne part qu'à « Commencer la Daily ». */
  protected startDaily(): void {
    const team = this.team();
    if (!team || team.members.length < MIN_MEMBERS) {
      return;
    }
    this.router.navigate(['/equipe', team.id, 'preparer']);
  }
}
