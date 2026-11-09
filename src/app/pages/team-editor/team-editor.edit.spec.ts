import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TeamStore } from '../../services/team.store';
import { TeamEditor } from './team-editor';

describe('TeamEditor (S8 : modifier l\'équipe enregistrée)', () => {
  let fixture: ComponentFixture<TeamEditor>;
  let el: HTMLElement;
  let router: Router;
  const saved = { name: 'Équipe Alpha', durationMinutes: 15, members: ['Léa', 'Tom'] };

  function button(text: string): HTMLButtonElement | undefined {
    return Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes(text),
    );
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [TeamEditor], providers: [provideRouter([])] });
    TestBed.inject(TeamStore).save(saved);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(TeamEditor);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('ouvre l\'écran 1 prérempli avec l\'équipe enregistrée', () => {
    expect(el.querySelector('h1')?.textContent).toContain("Modifier l'équipe");
    expect(el.querySelector<HTMLInputElement>('#team-name')?.value).toBe('Équipe Alpha');
    expect(el.querySelector<HTMLInputElement>('#duration')?.value).toBe('15');
    const names = Array.from(el.querySelectorAll('.member-list .member-name')).map((n) => n.textContent?.trim());
    expect(names).toEqual(['Léa', 'Tom']);
  });

  it('place le focus sur le titre à l\'ouverture', () => {
    expect(document.activeElement).toBe(el.querySelector('h1'));
  });

  it('enregistrer les changements met à jour l\'équipe', () => {
    const duration = el.querySelector<HTMLInputElement>('#duration')!;
    duration.value = '20';
    duration.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    button("Enregistrer l'équipe")!.click();
    fixture.detectChanges();
    expect(TestBed.inject(TeamStore).team()?.durationMinutes).toBe(20);
    expect(router.navigate).toHaveBeenCalledWith(['/presentation']);
  });

  it('« Annuler » revient à la présentation sans rien modifier', () => {
    const duration = el.querySelector<HTMLInputElement>('#duration')!;
    duration.value = '45';
    duration.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    button('Annuler')!.click();
    expect(router.navigate).toHaveBeenCalledWith(['/presentation']);
    expect(TestBed.inject(TeamStore).team()).toEqual(saved);
  });

  it('n\'affiche pas « Annuler » lors de la première création', () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [TeamEditor], providers: [provideRouter([])] });
    const created = TestBed.createComponent(TeamEditor);
    created.detectChanges();
    expect(created.nativeElement.textContent).not.toContain('Annuler');
  });
});
