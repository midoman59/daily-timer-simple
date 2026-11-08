import { Component } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import {
  DEFAULT_DURATION_MINUTES,
  validateDuration,
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
  protected readonly name = new FormControl('', {
    nonNullable: true,
    validators: [fromDomain(validateTeamName)],
  });

  protected readonly duration = new FormControl(String(DEFAULT_DURATION_MINUTES), {
    nonNullable: true,
    validators: [fromDomain(validateDuration)],
  });

  /** Message à afficher pour un champ, seulement après qu'il a été quitté. */
  protected errorOf(control: AbstractControl): string | null {
    if (!control.touched || control.valid) {
      return null;
    }
    return (control.errors?.['message'] as string | undefined) ?? null;
  }
}
