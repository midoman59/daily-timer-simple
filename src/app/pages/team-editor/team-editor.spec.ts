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

describe('TeamEditor (S3 : compteur de membres)', () => {
  let fixture: ComponentFixture<TeamEditor>;
  let el: HTMLElement;

  function addName(name: string): void {
    const input = el.querySelector<HTMLInputElement>('#member-name')!;
    input.value = name;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [TeamEditor], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(TeamEditor);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  function counter(): HTMLElement {
    return el.querySelector<HTMLElement>('.counter')!;
  }

  it('affiche « 0 membre » puis se met à jour à chaque ajout', () => {
    expect(counter().textContent?.trim()).toBe('0 membre');
    addName('Léa');
    expect(counter().textContent?.trim()).toBe('1 membre');
    addName('Tom');
    expect(counter().textContent?.trim()).toBe('2 membres');
  });

  it('annonce le compteur aux lecteurs d\'écran', () => {
    expect(counter().getAttribute('role')).toBe('status');
    expect(counter().getAttribute('aria-live')).toBe('polite');
  });

  it('désactive le champ au 15e membre avec le message de maximum', () => {
    for (let i = 1; i <= 15; i++) {
      addName(`Membre${String.fromCharCode(64 + i)}`);
    }
    const input = el.querySelector<HTMLInputElement>('#member-name')!;
    expect(counter().textContent?.trim()).toBe('15 membres');
    expect(input.disabled).toBeTrue();
    expect(el.textContent).toContain('Une équipe ne peut pas dépasser 15 membres.');
  });
});

describe('TeamEditor (S4 : retirer un membre avant enregistrement)', () => {
  let fixture: ComponentFixture<TeamEditor>;
  let el: HTMLElement;

  function addName(name: string): void {
    const input = el.querySelector<HTMLInputElement>('#member-name')!;
    input.value = name;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
  }

  function deleteButtons(): HTMLButtonElement[] {
    return Array.from(el.querySelectorAll<HTMLButtonElement>('.member-list .icon-btn'));
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [TeamEditor], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(TeamEditor);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
    addName('Léa');
    addName('Tom');
    addName('Ana');
  });

  it('a un bouton « Supprimer » nommé pour chaque membre', () => {
    expect(deleteButtons().map((b) => b.getAttribute('aria-label'))).toEqual([
      'Supprimer Léa',
      'Supprimer Tom',
      'Supprimer Ana',
    ]);
  });

  it('retire la ligne et décrémente le compteur', () => {
    deleteButtons()[1].click();
    fixture.detectChanges();
    const names = Array.from(el.querySelectorAll('.member-list .member-name')).map((n) => n.textContent?.trim());
    expect(names).toEqual(['Léa', 'Ana']);
    expect(el.querySelector('.counter')?.textContent?.trim()).toBe('2 membres');
  });

  it('permet de rajouter un prénom supprimé', () => {
    deleteButtons()[0].click();
    fixture.detectChanges();
    addName('Léa');
    const names = Array.from(el.querySelectorAll('.member-list .member-name')).map((n) => n.textContent?.trim());
    expect(names).toEqual(['Tom', 'Ana', 'Léa']);
  });

  it('place le focus sur le bouton Supprimer suivant, ou sur le champ Prénom', () => {
    deleteButtons()[0].click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(deleteButtons()[0]);
    expect(deleteButtons()[0].getAttribute('aria-label')).toBe('Supprimer Tom');

    deleteButtons()[1].click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(el.querySelector('#member-name'));
  });
});

describe('TeamEditor (S5 : valider les champs obligatoires)', () => {
  let fixture: ComponentFixture<TeamEditor>;
  let el: HTMLElement;

  function typeInto(selector: string, value: string): void {
    const input = el.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  }

  function addName(name: string): void {
    typeInto('#member-name', name);
    el.querySelector<HTMLInputElement>('#member-name')!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter' }),
    );
    fixture.detectChanges();
  }

  function saveButton(): HTMLButtonElement {
    return Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes("Enregistrer l'équipe"),
    )!;
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [TeamEditor], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(TeamEditor);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('garde « Enregistrer l\'équipe » inactif tant que le nom est vide', () => {
    addName('Léa');
    addName('Tom');
    expect(saveButton().getAttribute('aria-disabled')).toBe('true');
    typeInto('#team-name', 'Équipe A');
    expect(saveButton().getAttribute('aria-disabled')).toBeNull();
  });

  it('reste inactif avec moins de 2 membres ou une durée invalide', () => {
    typeInto('#team-name', 'Équipe A');
    addName('Léa');
    expect(saveButton().getAttribute('aria-disabled')).toBe('true');
    addName('Tom');
    expect(saveButton().getAttribute('aria-disabled')).toBeNull();
    typeInto('#duration', '7,5');
    expect(saveButton().getAttribute('aria-disabled')).toBe('true');
  });

  it('bloque si la durée ne laisse pas 30 secondes par membre', () => {
    typeInto('#team-name', 'Équipe A');
    typeInto('#duration', '1');
    addName('Léa');
    addName('Tom');
    addName('Ana');
    expect(saveButton().getAttribute('aria-disabled')).toBe('true');
    expect(el.textContent).toContain('au moins 30 secondes');
  });

  it('place le focus sur le premier champ fautif après un clic sur un bouton inactif', () => {
    saveButton().click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(el.querySelector('#team-name'));
    expect(el.textContent).toContain('Donnez un nom à votre équipe.');
  });

  it('ne rend pas la barre d\'action muette : une aide explique ce qui manque', () => {
    typeInto('#team-name', 'Équipe A');
    fixture.detectChanges();
    expect(saveButton().getAttribute('aria-describedby')).toBe('save-hint');
    expect(el.querySelector('#save-hint')?.textContent).toContain('Ajoutez au moins 2 membres');
  });
});
