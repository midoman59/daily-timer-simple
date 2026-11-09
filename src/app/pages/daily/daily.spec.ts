import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { leaveDaily } from '../../app.routes';
import { CLOCK, DAILY_STORAGE_KEY, DailyTimerService } from '../../services/daily-timer.service';
import { TeamStore } from '../../services/team.store';
import { MyTeams } from '../my-teams/my-teams';
import { Daily } from './daily';

/** Laisse le routeur et le rendu finir : whenStable ne revient jamais quand le chronomètre tourne. */
async function settle(harness: RouterTestingHarness): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await new Promise((resolve) => setTimeout(resolve));
  }
  harness.fixture.detectChanges();
}

describe('Daily (S13 à S17, S26 à S28 : écran de la Daily)', () => {
  let now: number;
  let teamId: string;
  let timer: DailyTimerService;

  beforeEach(() => {
    localStorage.clear();
    now = 1_000_000;
    TestBed.configureTestingModule({
      providers: [
        { provide: CLOCK, useValue: () => now },
        provideRouter([
          { path: 'equipe/:id/daily', component: Daily, canDeactivate: [leaveDaily] },
          { path: 'equipe/:id/bilan', component: MyTeams },
          { path: '**', component: MyTeams },
        ]),
      ],
    });
    const team = TestBed.inject(TeamStore).save({ name: 'Équipe Alpha', members: ['Léa', 'Tom', 'Ana'] })!;
    teamId = team.id;
    timer = TestBed.inject(DailyTimerService);
    timer.start(
      team,
      [
        { name: 'Léa', minutes: 2 },
        { name: 'Tom', minutes: 1 },
        { name: 'Ana', minutes: 3 },
      ],
      'team',
    );
  });

  afterEach(() => timer.stop());

  async function open() {
    const harness = await RouterTestingHarness.create(`/equipe/${teamId}/daily`);
    await settle(harness);
    return { harness, el: harness.fixture.nativeElement as HTMLElement };
  }

  function button(el: HTMLElement, label: string): HTMLButtonElement | undefined {
    return Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.trim() === label);
  }

  function statuses(el: HTMLElement): string[] {
    return Array.from(el.querySelectorAll('.member-list .row')).map((row) => {
      const title = row.querySelector('.row-title')?.textContent?.trim() ?? '';
      const status = row.querySelector('.row-status')?.textContent?.trim();
      const action = row.querySelector('button')?.textContent?.trim();
      return `${title}:${status ?? action ?? ''}`;
    });
  }

  it("affiche le nom de l'équipe, le mode d'ordre et le membre qui parle avec son décompte", async () => {
    const { el } = await open();
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Équipe Alpha');
    expect(el.textContent).toContain("Ordre de l'équipe");
    expect(el.querySelector('.current-name')?.textContent?.trim()).toBe('Léa');
    expect(el.querySelector('.clock')?.textContent?.trim()).toBe('02:00');
    expect(el.querySelector('.clock')?.getAttribute('aria-label')).toBe('Temps restant pour Léa');
    expect(el.textContent).toContain('Temps prévu : 2:00');
  });

  it("met le focus sur le nom de l'équipe, pas sur « Arrêter »", async () => {
    const { el } = await open();
    await Promise.resolve();
    expect(document.activeElement).toBe(el.querySelector('h1'));
  });

  it('liste l\'ordre avec les statuts « En cours », « fait » et l\'action « Passer » (S14, S15)', async () => {
    const { harness, el } = await open();
    expect(statuses(el)).toEqual(['Léa:En cours', 'Tom:Passer', 'Ana:Passer']);

    button(el, 'Suivant')!.click();
    harness.fixture.detectChanges();
    expect(statuses(el)).toEqual(['Léa:fait', 'Tom:En cours', 'Ana:Passer']);
  });

  it('« Passer » sur une ligne retire le membre sans temps, et il ne revient pas (S15)', async () => {
    const { harness, el } = await open();
    el.querySelector<HTMLButtonElement>('button[aria-label="Passer Tom"]')!.click();
    harness.fixture.detectChanges();
    expect(statuses(el)).toEqual(['Léa:En cours', 'Tom:passé', 'Ana:Passer']);

    button(el, 'Suivant')!.click();
    harness.fixture.detectChanges();
    expect(el.querySelector('.current-name')?.textContent?.trim()).toBe('Ana');
  });

  it('« Passer ce membre » passe celui qui parle : la parole va au suivant (S15)', async () => {
    const { harness, el } = await open();
    button(el, 'Passer ce membre')!.click();
    harness.fixture.detectChanges();
    expect(el.querySelector('.current-name')?.textContent?.trim()).toBe('Tom');
    expect(statuses(el)).toEqual(['Léa:passé', 'Tom:En cours', 'Ana:Passer']);
  });

  it('un absent en dernier est compté « passé » au bilan, pas « parlé » (I3)', async () => {
    const { harness, el } = await open();
    button(el, 'Suivant')!.click();
    harness.fixture.detectChanges();
    button(el, 'Suivant')!.click();
    harness.fixture.detectChanges();
    expect(el.querySelector('.current-name')?.textContent?.trim()).toBe('Ana');

    button(el, 'Passer ce membre')!.click();
    harness.fixture.detectChanges();
    expect(statuses(el)).toEqual(['Léa:fait', 'Tom:fait', 'Ana:passé']);
    button(el, 'Terminer la Daily')!.click();
    await settle(harness);
    expect(timer.report()?.rows.map((row) => [row.name, row.passed, row.spokenSeconds])).toEqual([
      ['Léa', false, 0],
      ['Tom', false, 0],
      ['Ana', true, null],
    ]);
  });

  it('au dernier membre, « Passer ce membre » reste disponible (I3, décision 11)', async () => {
    const { harness, el } = await open();
    button(el, 'Suivant')!.click();
    harness.fixture.detectChanges();
    button(el, 'Suivant')!.click();
    harness.fixture.detectChanges();
    expect(button(el, 'Passer ce membre')).toBeDefined();
  });

  it('au dernier membre, « Terminer la Daily » ouvre le bilan et ne ramène pas à la présentation (S26)', async () => {
    const { harness, el } = await open();
    button(el, 'Suivant')!.click();
    harness.fixture.detectChanges();
    button(el, 'Suivant')!.click();
    harness.fixture.detectChanges();
    const primary = button(el, 'Terminer la Daily');
    expect(primary).toBeDefined();
    primary!.click();
    await settle(harness);
    expect(TestBed.inject(Router).url).toBe(`/equipe/${teamId}/bilan`);
    expect(timer.session()).toBeNull();
    expect(timer.report()?.rows.map((row) => row.name)).toEqual(['Léa', 'Tom', 'Ana']);
  });

  it('passe en dépassement : « Temps dépassé » et « +mm:ss » apparaissent, sans passer au suivant (S16)', async () => {
    const { harness, el } = await open();
    now += 125_000;
    timer.tick();
    harness.fixture.detectChanges();
    expect(el.querySelector('.overrun-title')?.classList).not.toContain('is-hidden');
    expect(el.querySelector('.clock')?.textContent?.trim()).toBe('+00:05');
    expect(el.querySelector('.clock')?.classList).toContain('is-overrun');
    expect(el.querySelector('.current-name')?.textContent?.trim()).toBe('Léa');
  });

  it('« Suivant » remet le décompte à zéro pour le membre suivant (S16)', async () => {
    const { harness, el } = await open();
    now += 125_000;
    timer.tick();
    button(el, 'Suivant')!.click();
    harness.fixture.detectChanges();
    expect(el.querySelector('.clock')?.textContent?.trim()).toBe('01:00');
    expect(el.querySelector('.clock')?.classList).not.toContain('is-overrun');
  });

  it('une Daily rouverte est figée : bandeau et « Reprendre la Daily », rien ne repart seul (S27)', async () => {
    timer.pause();
    const { harness, el } = await open();
    expect(el.textContent).toContain('Daily en pause');
    now += 60_000;
    timer.tick();
    harness.fixture.detectChanges();
    expect(el.querySelector('.clock')?.textContent?.trim()).toBe('02:00');
    button(el, 'Reprendre la Daily')!.click();
    harness.fixture.detectChanges();
    expect(el.textContent).not.toContain('Daily en pause');
  });

  it('« Arrêter la Daily » demande confirmation, et « Continuer » reprend sans perte', async () => {
    const { harness, el } = await open();
    button(el, 'Arrêter la Daily')!.click();
    harness.fixture.detectChanges();
    expect(el.querySelector('[role="alertdialog"]')).not.toBeNull();
    expect(el.querySelector('[role="alertdialog"]')?.textContent).toContain("Elle n'est pas conservée.");
    await settle(harness);
    expect(document.activeElement?.textContent?.trim()).toBe('Continuer');

    button(el, 'Continuer')!.click();
    harness.fixture.detectChanges();
    expect(el.querySelector('[role="alertdialog"]')).toBeNull();
    expect(timer.session()).not.toBeNull();
    expect(timer.paused()).toBeFalse();
  });

  it('« Arrêter » dans la confirmation arrête la Daily et revient à la présentation (S17)', async () => {
    const { harness, el } = await open();
    button(el, 'Arrêter la Daily')!.click();
    harness.fixture.detectChanges();
    button(el, 'Arrêter')!.click();
    await settle(harness);
    expect(timer.session()).toBeNull();
    expect(localStorage.getItem(DAILY_STORAGE_KEY)).toBeNull();
    expect(TestBed.inject(Router).url).toBe(`/equipe/${teamId}`);
  });

  it('la garde de sortie bloque la navigation et ouvre « Quitter la Daily ? » (S28)', async () => {
    const { harness } = await open();
    const moved = await TestBed.inject(Router).navigateByUrl('/equipes');
    await settle(harness);
    expect(moved).toBeFalse();
    expect(timer.confirm()).toEqual({ kind: 'leave', url: '/equipes' });
    expect(timer.session()).not.toBeNull();
  });

  it('« Arrêter » dans la garde de sortie efface la Daily et poursuit la navigation (S28)', async () => {
    const { harness, el } = await open();
    await TestBed.inject(Router).navigateByUrl('/equipes');
    await settle(harness);
    expect(el.textContent).toContain('Quitter la Daily ?');
    button(el, 'Arrêter')!.click();
    await settle(harness);
    expect(timer.session()).toBeNull();
    expect(TestBed.inject(Router).url).toBe('/equipes');
  });
});
