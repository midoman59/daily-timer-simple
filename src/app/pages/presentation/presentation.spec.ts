import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { DailyTimerService } from '../../services/daily-timer.service';
import { TeamStore } from '../../services/team.store';
import { Presentation } from './presentation';

describe('Presentation (S6 : voir la présentation de l\'équipe)', () => {
  let fixture: ComponentFixture<Presentation>;
  let el: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [Presentation], providers: [provideRouter([])] });
    TestBed.inject(TeamStore).save({
      name: 'Équipe Alpha',
      durationMinutes: 15,
      members: ['Zoé', 'Adam', 'Léa'],
    });
    fixture = TestBed.createComponent(Presentation);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('affiche le nom, la durée, le nombre de membres et la liste dans l\'ordre de saisie', () => {
    expect(el.querySelector('h1')?.textContent).toContain('Équipe Alpha');
    expect(el.textContent).toContain('15 min');
    expect(el.textContent).toContain('3 membres');
    const names = Array.from(el.querySelectorAll('.member-list .member-name')).map((n) => n.textContent?.trim());
    expect(names).toEqual(['Zoé', 'Adam', 'Léa']);
  });

  it('présente « Démarrer une Daily » comme action principale', () => {
    const start = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Démarrer une Daily'),
    );
    expect(start).toBeDefined();
    expect(start!.classList).toContain('btn-primary');
  });

  it('place le focus sur le titre de l\'écran à son arrivée', () => {
    expect(document.activeElement).toBe(el.querySelector('#team-title'));
  });

  it('ouvre l\'écran de modification avec « Modifier l\'équipe »', () => {
    const edit = Array.from(el.querySelectorAll('a')).find((a) => a.textContent?.includes("Modifier l'équipe"));
    expect(edit?.getAttribute('href')).toContain('equipe');
  });

  it('« Démarrer une Daily » lance le chronomètre et ouvre l\'écran de la Daily', () => {
    const timer = TestBed.inject(DailyTimerService);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const start = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Démarrer une Daily'),
    )!;
    start.click();
    expect(timer.session()?.team.name).toBe('Équipe Alpha');
    expect(router.navigate).toHaveBeenCalledWith(['/daily']);
    timer.stop();
  });
});
