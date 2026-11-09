import { Component, ElementRef, computed, signal, viewChild, viewChildren } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import {
  DEFAULT_DURATION_MINUTES,
  MAX_MEMBERS,
  normalizeSpaces,
  validateDuration,
  validateMemberName,
  validateTeamName,
} from '../../domain/team-validation';

/** Adapte un validateur de domaine (message ou null) au format Angular. */
function fromDomain(check: (value: string) => string | null) {
  return (control: AbstractControl): ValidationErrors | null => {
    const message = check(control.value ?? '');
    return message ? { message } : null;
  };
}

@Component({
  selector: 'app-team-editor',
  imports: [ReactiveFormsModule],
  templateUrl: './team-editor.html',
  styleUrl: './team-editor.css',
})
export class TeamEditor {
  /** Membres saisis, dans l'ordre de saisie. */
  protected readonly members = signal<string[]>([]);

  /** Libellé du compteur : « 0 membre », « 1 membre », « 2 membres »… */
  protected readonly countLabel = computed(() => {
    const count = this.members().length;
    return count <= 1 ? `${count} membre` : `${count} membres`;
  });

  protected readonly isFull = computed(() => this.members().length >= MAX_MEMBERS);

  /** Vrai après une tentative d'ajout : l'erreur du prénom ne s'affiche qu'à partir de là. */
  protected readonly memberAttempted = signal(false);

  private readonly memberField = viewChild.required<ElementRef<HTMLInputElement>>('memberField');
  private readonly deleteButtons = viewChildren<ElementRef<HTMLButtonElement>>('deleteButton');

  protected readonly name = new FormControl('', {
    nonNullable: true,
    validators: [fromDomain(validateTeamName)],
  });

  protected readonly duration = new FormControl(String(DEFAULT_DURATION_MINUTES), {
    nonNullable: true,
    validators: [fromDomain(validateDuration)],
  });

  protected readonly memberName = new FormControl('', {
    nonNullable: true,
    validators: [fromDomain((value) => validateMemberName(value, this.members()))],
  });

  /** Message à afficher pour un champ, seulement après qu'il a été quitté. */
  protected errorOf(control: AbstractControl): string | null {
    if (!control.touched || control.valid) {
      return null;
    }
    return (control.errors?.['message'] as string | undefined) ?? null;
  }

  /** Message du prénom : affiché seulement après une tentative d'ajout. */
  protected memberError(): string | null {
    if (this.isFull()) {
      return 'Une équipe ne peut pas dépasser ' + MAX_MEMBERS + ' membres.';
    }
    if (!this.memberAttempted() || this.memberName.valid) {
      return null;
    }
    return (this.memberName.errors?.['message'] as string | undefined) ?? null;
  }

  protected addMember(): void {
    this.memberAttempted.set(true);
    this.memberName.updateValueAndValidity();
    if (this.memberName.invalid) {
      this.memberField().nativeElement.focus();
      return;
    }
    this.members.update((list) => [...list, normalizeSpaces(this.memberName.value)]);
    this.syncMemberInput();
    this.memberName.setValue('');
    this.memberName.markAsUntouched();
    this.memberAttempted.set(false);
    this.memberField().nativeElement.focus();
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
