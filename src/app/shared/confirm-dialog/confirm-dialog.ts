import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

/** Identifiants uniques des dialogues ouverts, pour lier titre et texte (aria-labelledby, aria-describedby). */
let nextDialogId = 0;

/**
 * Dialogue de confirmation (design 6.0) : rôle alertdialog, focus initial sur l'action sûre,
 * piège de focus, Échap = action sûre. Le parent retire le dialogue quand l'une des sorties est émise.
 */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  host: { '(document:keydown)': 'onDocumentKeydown($event)' },
})
export class ConfirmDialog {
  /** Titre du dialogue. */
  readonly title = input.required<string>();

  /** Texte explicatif. */
  readonly description = input.required<string>();

  /** Action sûre : celle qui a le focus au départ, et celle d'Échap. */
  readonly safeLabel = input.required<string>();

  /** Action qui confirme l'opération. */
  readonly actionLabel = input.required<string>();

  /** Style de l'action sûre : bouton principal plein ou secondaire. */
  readonly safeTone = input<'primary' | 'secondary'>('secondary');

  /** Style de l'action : plein, destructif plein, ou destructif en texte. */
  readonly actionTone = input<'primary' | 'destructive-fill' | 'destructive-text'>('primary');

  /** Émis par l'action sûre, par Échap, ou par un clic sur le voile. */
  readonly safe = output<void>();

  /** Émis par l'action de confirmation. */
  readonly action = output<void>();

  protected readonly titleId = `confirm-title-${nextDialogId}`;
  protected readonly descId = `confirm-desc-${nextDialogId++}`;

  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLElement>>('dialog');
  private readonly safeButton = viewChild.required<ElementRef<HTMLButtonElement>>('safeButton');
  private readonly actionButton = viewChild.required<ElementRef<HTMLButtonElement>>('actionButton');

  constructor() {
    afterNextRender(() => this.safeButton().nativeElement.focus(), { injector: this.injector });
  }

  /**
   * Tab et Maj+Tab restent dans le dialogue, même quand le focus est sur BODY (clic sur le voile) ;
   * Échap ferme comme l'action sûre.
   */
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.safe.emit();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    const first = this.safeButton().nativeElement;
    const last = this.actionButton().nativeElement;
    if (!this.dialog().nativeElement.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
