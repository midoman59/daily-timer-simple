import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  MAX_MEMBERS,
  MIN_MEMBERS,
  capitalizeFirst,
  memberCountLabel,
  normalizeSpaces,
  validateMemberName,
  validateTeamName,
} from '../../domain/team-validation';
import { TeamStore } from '../../services/team.store';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

/** Adapte un validateur de domaine (message ou null) au format Angular. */
function fromDomain(check: (value: string) => string | null) {
  return (control: AbstractControl): ValidationErrors | null => {
    const message = check(control.value ?? '');
    return message ? { message } : null;
  };
}

/**
 * Écran (b) : création ou modification d'une équipe, sans durée.
 * Route « /equipe/nouvelle » pour la création, « /equipe/:id/modifier » pour la modification.
 */
@Component({
  selector: 'app-team-editor',
  imports: [ReactiveFormsModule, RouterLink, ConfirmDialog],
  templateUrl: './team-editor.html',
  styleUrl: './team-editor.css',
})
export class TeamEditor {
  private readonly store = inject(TeamStore);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  /** Identifiant de l'équipe modifiée, ou null pour une création. */
  private readonly teamId = inject(ActivatedRoute).snapshot.paramMap.get('id');

  /** Vrai quand l'écran modifie une équipe existante. */
  protected readonly isEdit = this.teamId !== null;

  /** Membres enregistrés avant la modification : ceux qui n'existent plus à l'enregistrement sont retirés. */
  private readonly savedMembers = this.teamId ? (this.store.find(this.teamId)?.members ?? []) : [];

  /** Vrai si une donnée stockée est illisible : l'écran l'indique. */
  protected readonly unreadable = this.store.readError;

  /** Vrai si l'équipe n'a pas pu être écrite dans le stockage du navigateur. */
  protected readonly storageError = signal(false);

  /** Prénoms retirés, en attente de la confirmation du dialogue 6.2, ou null. */
  protected readonly pendingRemoval = signal<string[] | null>(null);

  private readonly title = viewChild<ElementRef<HTMLElement>>('title');
  private readonly nameField = viewChild.required<ElementRef<HTMLInputElement>>('nameField');
  private readonly memberField = viewChild.required<ElementRef<HTMLInputElement>>('memberField');
  private readonly deleteButtons = viewChildren<ElementRef<HTMLButtonElement>>('deleteButton');
  private readonly saveButton = viewChild<ElementRef<HTMLButtonElement>>('saveButton');

  /** Membres saisis, dans l'ordre de saisie. */
  protected readonly members = signal<string[]>([]);

  /** Libellé du compteur : « 0 membre », « 1 membre », « 2 membres »… */
  protected readonly countLabel = computed(() => memberCountLabel(this.members().length));

  protected readonly isFull = computed(() => this.members().length >= MAX_MEMBERS);

  protected readonly minMembers = MIN_MEMBERS;

  /** Vrai après une tentative d'ajout : l'erreur du prénom ne s'affiche qu'à partir de là. */
  protected readonly memberAttempted = signal(false);

  protected readonly name = new FormControl('', {
    nonNullable: true,
    validators: [fromDomain(validateTeamName)],
  });

  protected readonly memberName = new FormControl('', { nonNullable: true });

  constructor() {
    // À l'arrivée sur l'écran, le focus va au titre : le lecteur d'écran annonce le nouvel écran.
    afterNextRender(() => this.title()?.nativeElement.focus(), { injector: this.injector });

    const team = this.teamId ? this.store.find(this.teamId) : undefined;
    if (team) {
      this.name.setValue(team.name);
      this.members.set([...team.members]);
      this.syncMemberInput();
    }
  }

  protected readonly heading = computed(() => (this.isEdit ? "Modifier l'équipe" : 'Nouvelle équipe'));

  /** Annuler : en modification, retour à la présentation ; en création, retour à « Mes équipes » (D49). */
  protected cancel(): void {
    if (this.isEdit) {
      this.router.navigate(['/equipe', this.teamId]);
    } else {
      this.router.navigate(['/equipes']);
    }
  }

  /** Échap : annule en modification (sans dialogue ouvert), sans effet en création. */
  protected onEscape(): void {
    if (this.isEdit && this.pendingRemoval() === null) {
      this.cancel();
    }
  }

  /** Message à afficher pour le nom, seulement après qu'il a été quitté. */
  protected errorOf(control: AbstractControl): string | null {
    if (!control.touched || control.valid) {
      return null;
    }
    return (control.errors?.['message'] as string | undefined) ?? null;
  }

  /** Message du prénom : affiché seulement après une tentative d'ajout. */
  protected memberError(): string | null {
    if (this.isFull()) {
      return `Une équipe ne peut pas dépasser ${MAX_MEMBERS} membres.`;
    }
    if (!this.memberAttempted()) {
      return null;
    }
    return validateMemberName(this.memberName.value, this.members());
  }

  /** Premier motif qui empêche l'enregistrement, dans l'ordre de l'écran ; null si tout est bon. */
  protected saveBlockReason(): string | null {
    if (this.name.invalid) {
      return this.name.errors?.['message'] as string;
    }
    if (this.members().length < MIN_MEMBERS) {
      return `Ajoutez au moins ${MIN_MEMBERS} membres pour continuer.`;
    }
    return null;
  }

  protected canSave(): boolean {
    return this.saveBlockReason() === null;
  }

  /**
   * Clic (ou Entrée) sur « Enregistrer l'équipe » alors qu'il est inactif :
   * les erreurs s'affichent et le focus va sur le premier champ fautif.
   * Un enregistrement qui retire un membre demande d'abord confirmation (S22).
   */
  protected onSave(): void {
    if (!this.canSave()) {
      this.name.markAsTouched();
      if (this.name.invalid) {
        this.nameField().nativeElement.focus();
      } else {
        this.memberField().nativeElement.focus();
      }
      return;
    }
    const removed = this.savedMembers.filter((member) => !this.members().includes(member));
    if (removed.length > 0) {
      this.pendingRemoval.set(removed);
      return;
    }
    this.save();
  }

  /** « Revenir » dans le dialogue 6.2 : rien n'est perdu, le focus retourne sur « Enregistrer l'équipe ». */
  protected cancelRemoval(): void {
    this.pendingRemoval.set(null);
    afterNextRender(() => this.saveButton()?.nativeElement.focus(), { injector: this.injector });
  }

  /** Écrit l'équipe et ouvre sa présentation (c). */
  protected save(): void {
    this.pendingRemoval.set(null);
    const saved = this.store.save({
      id: this.teamId ?? undefined,
      name: normalizeSpaces(this.name.value),
      members: this.members(),
    });
    if (!saved) {
      this.storageError.set(true);
      return;
    }
    this.router.navigate(['/equipe', saved.id], { state: { saved: true } });
  }

  /**
   * Ajoute un prénom en fin de liste : espaces retirés, première lettre en majuscule (S23), puis contrôles.
   * Un prénom refusé reste dans le champ, avec son message.
   */
  protected addMember(): void {
    this.memberAttempted.set(true);
    const name = capitalizeFirst(normalizeSpaces(this.memberName.value));
    if (validateMemberName(name, this.members()) !== null) {
      this.memberField().nativeElement.focus();
      return;
    }
    this.members.update((list) => [...list, name]);
    this.syncMemberInput();
    this.memberName.setValue('');
    this.memberAttempted.set(false);
    this.focusAfterAdd();
  }

  /**
   * Après un ajout, le focus va au champ Prénom. Quand l'équipe est pleine, le champ et le bouton
   * « Ajouter » deviennent inactifs : le focus va alors au dernier bouton « Supprimer », une fois
   * le rendu fait (un élément désactivé ne peut pas recevoir le focus).
   */
  private focusAfterAdd(): void {
    if (this.isFull()) {
      afterNextRender(() => this.deleteButtons().at(-1)?.nativeElement.focus(), { injector: this.injector });
    } else {
      this.memberField().nativeElement.focus();
    }
  }

  /** Désactive la saisie d'un prénom quand l'équipe est pleine. */
  private syncMemberInput(): void {
    if (this.isFull()) {
      this.memberName.disable({ emitEvent: false });
    } else {
      this.memberName.enable({ emitEvent: false });
    }
  }

  /**
   * Retire le membre à cet index. Le focus passe au bouton Supprimer du membre suivant,
   * ou au champ Prénom s'il n'y a plus de membre après.
   */
  protected removeMember(index: number): void {
    const next = this.deleteButtons()[index + 1]?.nativeElement;
    this.members.update((list) => list.filter((_, i) => i !== index));
    this.syncMemberInput();
    (next ?? this.memberField().nativeElement).focus();
  }

  protected onMemberEnter(event: Event): void {
    event.preventDefault();
    this.addMember();
  }
}
