import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { CLOCK, DailyTimerService } from '../../services/daily-timer.service';
import { Daily } from './daily';

describe('Daily (S9 : écran de la Daily)', () => {
  let fixture: ComponentFixture<Daily>;
  let el: HTMLElement;
  let now: number;
  let router: Router;
  let timer: DailyTimerService;
  const team = { name: 'Équipe Alpha', durationMinutes: 15, members: ['Léa', 'Tom'] };

  function button(text: string): HTMLButtonElement | undefined {
    return Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.trim() === text,
    );
  }

  function refresh(): void {
    timer.tick();
    fixture.detectChanges();
  }

  beforeEach(() => {
    now = 1_000_000;
    TestBed.configureTestingModule({
      imports: [Daily],
      providers: [provideRouter([]), { provide: CLOCK, useValue: () => now }],
    });
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    timer = TestBed.inject(DailyTimerService);
    timer.start(team);
    fixture = TestBed.createComponent(Daily);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => timer.stop());

  it('affiche le nom, le décompte, la durée prévue et les membres', () => {
    expect(el.querySelector('h1')?.textContent).toContain('Équipe Alpha');
    expect(el.querySelector('[role="timer"]')?.textContent?.trim()).toBe('15:00');
    expect(el.textContent).toContain('sur 15 min');
    const names = Array.from(el.querySelectorAll('.member-list .member-name')).map((n) => n.textContent?.trim());
    expect(names).toEqual(['Léa', 'Tom']);
  });

  it('met le décompte à jour au fil du temps', () => {
    now += 30_000;
    refresh();
    expect(el.querySelector('[role="timer"]')?.textContent?.trim()).toBe('14:30');
  });

  it('affiche « Temps dépassé » et « +mm:ss » en dépassement', () => {
    now += 15 * 60_000 + 7_000;
    refresh();
    expect(el.querySelector('[role="timer"]')?.classList).toContain('is-overrun');
    expect(el.textContent).toContain('Temps dépassé');
    expect(el.textContent).toContain('+00:07');
  });

  it('annonce le démarrage et le dépassement', () => {
    const status = el.querySelector('[role="status"]')!;
    expect(status.textContent).toContain('Daily démarrée, 15 minutes');
    now += 16 * 60_000;
    refresh();
    expect(status.textContent).toContain('Temps dépassé');
  });

  it("demande confirmation avant d'arrêter, avec « Continuer » en action sûre", () => {
    button('Arrêter la Daily')!.click();
    fixture.detectChanges();
    const dialog = el.querySelector('[role="alertdialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('Arrêter la Daily ?');
    expect(document.activeElement?.textContent).toContain('Continuer');
  });

  it('« Continuer » ferme la confirmation sans arrêter le chronomètre', () => {
    button('Arrêter la Daily')!.click();
    fixture.detectChanges();
    button('Continuer')!.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="alertdialog"]')).toBeNull();
    expect(timer.session()).not.toBeNull();
  });

  it('Échap ferme la confirmation comme « Continuer »', () => {
    button('Arrêter la Daily')!.click();
    fixture.detectChanges();
    el.querySelector('[role="alertdialog"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(el.querySelector('[role="alertdialog"]')).toBeNull();
    expect(timer.session()).not.toBeNull();
  });

  it('« Arrêter » arrête la Daily et ramène à la présentation', () => {
    button('Arrêter la Daily')!.click();
    fixture.detectChanges();
    button('Arrêter')!.click();
    expect(timer.session()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/presentation']);
  });
});
