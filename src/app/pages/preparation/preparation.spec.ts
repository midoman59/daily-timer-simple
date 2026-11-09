import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MyTeams } from '../my-teams/my-teams';
import { DailyTimerService } from '../../services/daily-timer.service';
import { TeamStore } from '../../services/team.store';
import { Preparation } from './preparation';

/** Laisse le routeur et le rendu finir : whenStable ne revient jamais quand le chronomètre tourne. */
async function settle(harness: RouterTestingHarness): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await new Promise((resolve) => setTimeout(resolve));
  }
  harness.fixture.detectChanges();
}

describe('Preparation (S10 à S12 : préparer la Daily)', () => {
  let teamId: string;
  let store: TeamStore;
  let timer: DailyTimerService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'equipe/:id/preparer', component: Preparation },
          { path: '**', component: MyTeams },
        ]),
      ],
    });
    store = TestBed.inject(TeamStore);
    timer = TestBed.inject(DailyTimerService);
    teamId = store.save({ name: 'Équipe Alpha', members: ['Léa', 'Tom'] })!.id;
  });

  async function open() {
    const harness = await RouterTestingHarness.create(`/equipe/${teamId}/preparer`);
    await settle(harness);
    return { harness, el: harness.fixture.nativeElement as HTMLElement };
  }

  function button(el: HTMLElement, label: string): HTMLButtonElement {
    return Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.trim() === label) as HTMLButtonElement;
  }

  function select(el: HTMLElement, index: number): HTMLSelectElement {
    return el.querySelector<HTMLSelectElement>(`#minutes-${index}`)!;
  }

  it('propose 1 à 5 minutes pour chaque membre, pré-réglées à 2 minutes (S10)', async () => {
    const { el } = await open();
    const options = Array.from(select(el, 0).options).map((o) => o.value);
    expect(options).toEqual(['1', '2', '3', '4', '5']);
    expect(select(el, 0).value).toBe('2');
    expect(select(el, 1).value).toBe('2');
  });

  it('« Appliquer à tous » reprend la valeur du premier membre pour chacun (S10)', async () => {
    const { harness, el } = await open();
    select(el, 0).value = '4';
    select(el, 0).dispatchEvent(new Event('change'));
    button(el, 'Appliquer à tous').click();
    harness.fixture.detectChanges();
    expect(select(el, 1).value).toBe('4');
  });

  it('ne lance pas le chronomètre à l\'arrivée et n\'enregistre rien dans l\'équipe (S12, S13)', async () => {
    const before = JSON.stringify(store.teams());
    await open();
    expect(timer.session()).toBeNull();
    expect(JSON.stringify(store.teams())).toBe(before);
  });

  it('désactive « Commencer la Daily » quand un temps est absent, et la rétablit ensuite (S10)', async () => {
    const { harness, el } = await open();
    select(el, 1).value = '';
    select(el, 1).dispatchEvent(new Event('change'));
    harness.fixture.detectChanges();
    expect(button(el, 'Commencer la Daily').getAttribute('aria-disabled')).toBe('true');
    expect(el.textContent).toContain('Choisissez une durée entre 1 et 5 minutes.');
    select(el, 1).value = '3';
    select(el, 1).dispatchEvent(new Event('change'));
    harness.fixture.detectChanges();
    expect(button(el, 'Commencer la Daily').getAttribute('aria-disabled')).toBeNull();
  });

  it('« Commencer la Daily » lance la Daily avec les temps choisis et l\'ordre de l\'équipe, puis ouvre l\'écran Daily', async () => {
    const { harness, el } = await open();
    select(el, 1).value = '3';
    select(el, 1).dispatchEvent(new Event('change'));
    harness.fixture.detectChanges();
    button(el, 'Commencer la Daily').click();
    await settle(harness);

    expect(TestBed.inject(Router).url).toBe(`/equipe/${teamId}/daily`);
    expect(timer.session()?.teamId).toBe(teamId);
    expect(timer.current()?.name).toBe('Léa');
    expect(timer.current()?.allottedSeconds).toBe(120);
  });

  it('l\'ordre aléatoire choisi est transmis à la Daily', async () => {
    const { harness, el } = await open();
    const random = el.querySelector<HTMLInputElement>('input[value="random"]')!;
    random.checked = true;
    random.dispatchEvent(new Event('change'));
    harness.fixture.detectChanges();
    button(el, 'Commencer la Daily').click();
    await settle(harness);
    expect(timer.run()?.order.length).toBe(2);
  });

  it('« Annuler » revient à la présentation sans rien lancer (S12)', async () => {
    const { harness, el } = await open();
    button(el, 'Annuler').click();
    await settle(harness);
    expect(TestBed.inject(Router).url).toBe(`/equipe/${teamId}`);
    expect(timer.session()).toBeNull();
  });
});
