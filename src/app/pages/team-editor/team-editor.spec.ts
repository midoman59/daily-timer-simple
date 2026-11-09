import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TeamEditor } from './team-editor';

describe('TeamEditor (S1 : nom et durée)', () => {
  let fixture: ComponentFixture<TeamEditor>;
  let el: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [TeamEditor], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(TeamEditor);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it("affiche les champs « Nom d'équipe » et « Durée de la Daily »", () => {
    expect(el.querySelector<HTMLInputElement>('#team-name')).not.toBeNull();
    expect(el.querySelector<HTMLInputElement>('#duration')).not.toBeNull();
    expect(el.querySelector('label[for="team-name"]')?.textContent).toContain("Nom d'équipe");
    expect(el.querySelector('label[for="duration"]')?.textContent).toContain('Durée de la Daily');
  });

  it('pré-remplit la durée à 15 minutes', () => {
    expect(el.querySelector<HTMLInputElement>('#duration')?.value).toBe('15');
  });

  it('affiche le message de durée non entière pour « 7,5 »', () => {
    const input = el.querySelector<HTMLInputElement>('#duration')!;
    input.value = '7,5';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(el.textContent).toContain('Saisissez un nombre entier de minutes.');
  });
});

describe('TeamEditor (S2 : ajouter des membres par prénom)', () => {
  let fixture: ComponentFixture<TeamEditor>;
  let el: HTMLElement;

  function typeInto(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function pressEnter(input: HTMLInputElement): void {
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
  }

  function memberNames(): string[] {
    return Array.from(el.querySelectorAll('.member-list li .member-name')).map((li) =>
      (li.textContent ?? '').trim(),
    );
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [TeamEditor], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(TeamEditor);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('ajoute un membre en fin de liste avec Entrée', () => {
    const input = el.querySelector<HTMLInputElement>('#member-name')!;
    typeInto(input, 'Léa');
    pressEnter(input);
    typeInto(input, 'Tom');
    pressEnter(input);
    expect(memberNames()).toEqual(['Léa', 'Tom']);
  });

  it('ajoute un membre avec le bouton « Ajouter »', () => {
    const input = el.querySelector<HTMLInputElement>('#member-name')!;
    typeInto(input, 'Léa');
    const button = Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes('Ajouter'))!;
    button.click();
    fixture.detectChanges();
    expect(memberNames()).toEqual(['Léa']);
  });

  it('vide le champ et reprend le focus après chaque ajout', () => {
    const input = el.querySelector<HTMLInputElement>('#member-name')!;
    typeInto(input, 'Léa');
    pressEnter(input);
    expect(input.value).toBe('');
    expect(document.activeElement).toBe(input);
  });

  it('refuse un prénom vide avec le message « Saisissez un prénom. »', () => {
    const input = el.querySelector<HTMLInputElement>('#member-name')!;
    pressEnter(input);
    expect(memberNames()).toEqual([]);
    expect(el.textContent).toContain('Saisissez un prénom.');
  });
});
