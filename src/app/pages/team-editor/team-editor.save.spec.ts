import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TeamStore } from '../../services/team.store';
import { TEAM_STORAGE_KEY } from '../../services/team.store';
import { TeamEditor } from './team-editor';

describe('TeamEditor (S6 : enregistrer l\'équipe)', () => {
  let fixture: ComponentFixture<TeamEditor>;
  let el: HTMLElement;
  let router: Router;

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
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(TeamEditor);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('enregistre l\'équipe valide puis ouvre la présentation', async () => {
    typeInto('#team-name', '  Équipe   Alpha ');
    typeInto('#duration', '20');
    addName('Léa');
    addName('Tom');
    saveButton().click();
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/presentation']);
    expect(TestBed.inject(TeamStore).team()).toEqual({
      name: 'Équipe Alpha',
      durationMinutes: 20,
      members: ['Léa', 'Tom'],
    });
    const stored = JSON.parse(localStorage.getItem(TEAM_STORAGE_KEY) ?? 'null');
    expect(stored.name).toBe('Équipe Alpha');
  });

  it('n\'ouvre pas la présentation si l\'équipe est invalide', () => {
    typeInto('#team-name', 'Équipe A');
    saveButton().click();
    fixture.detectChanges();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
