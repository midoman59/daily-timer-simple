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
