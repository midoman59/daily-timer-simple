import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import {
  DEFAULT_DURATION_MINUTES,
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

  /** Vrai après une tentative d'ajout : l'erreur du prénom ne s'affiche qu'à partir de là. */
  protected readonly memberAttempted = signal(false);

  private readonly memberField = viewChild.required<ElementRef<HTMLInputElement>>('memberField');

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
    this.memberName.setValue('');
    this.memberName.markAsUntouched();
    this.memberAttempted.set(false);
    this.memberField().nativeElement.focus();
  }

  protected onMemberEnter(event: Event): void {
    event.preventDefault();
    this.addMember();
  }
}
