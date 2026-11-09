import { TestBed } from '@angular/core/testing';
import { CLOCK, DAILY_STORAGE_KEY, DailyTimerService, RANDOM } from './daily-timer.service';

describe('DailyTimerService (S13 à S17, S26 à S28 : chronomètre, reprise, bilan)', () => {
  let now: number;
  const team = { id: 't1', name: 'Alpha', members: ['Léa', 'Tom'] };
  const plan = [
    { name: 'Léa', minutes: 2 },
    { name: 'Tom', minutes: 1 },
  ];
  const SECOND = 1000;

  function create(): DailyTimerService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: CLOCK, useValue: () => now },
        { provide: RANDOM, useValue: () => 0.5 },
      ],
    });
    return TestBed.inject(DailyTimerService);
  }

  beforeEach(() => {
    localStorage.clear();
    now = 1_000_000;
  });

  it('ne démarre le décompte qu’au clic « Commencer la Daily » (start)', () => {
    const service = create();
    expect(service.session()).toBeNull();
    service.start(team, plan, 'team');
    expect(service.countdown()).toBe('02:00');
    now += 30 * SECOND;
    service.tick();
    expect(service.countdown()).toBe('01:30');
  });

  it('passe en dépassement (« +mm:ss ») et reste sur le même membre jusqu’à « Suivant »', () => {
    const service = create();
    service.start(team, plan, 'team');
    now += 125 * SECOND;
    service.tick();
    expect(service.isOverrun()).toBeTrue();
    expect(service.overrunLabel()).toBe('00:05');
    now += 200 * SECOND;
    service.tick();
    expect(service.current()?.name).toBe('Léa');
    service.next();
    expect(service.current()?.name).toBe('Tom');
    expect(service.isOverrun()).toBeFalse();
  });

  it('une pause fige le décompte, et la reprise ne compte pas le temps de pause', () => {
    const service = create();
    service.start(team, plan, 'team');
    now += 10 * SECOND;
    service.pause();
    now += 500 * SECOND;
    service.tick();
    expect(service.countdown()).toBe('01:50');
    service.resume();
    now += 10 * SECOND;
    service.tick();
    expect(service.countdown()).toBe('01:40');
  });

  it('« Terminer la Daily » enregistre le bilan puis ne garde plus rien de la Daily', () => {
    const service = create();
    service.start(team, plan, 'team');
    now += 150 * SECOND;
    service.next();
    now += 30 * SECOND;
    service.finish();
    expect(service.session()).toBeNull();
    expect(localStorage.getItem(DAILY_STORAGE_KEY)).toBeNull();
    expect(service.report()?.rows.map((row) => [row.name, row.spokenSeconds, row.overrunSeconds])).toEqual([
      ['Léa', 150, 30],
      ['Tom', 30, 0],
    ]);
  });

  it('enregistre la Daily au fil de l’eau et la retrouve figée après rechargement, sans temps de fermeture', () => {
    const service = create();
    service.start(team, plan, 'team');
    now += 20 * SECOND;
    service.tick();

    now += 3600 * SECOND; // Fermeture d'une heure : rien ne doit compter.
    const reopened = create();
    expect(reopened.session()?.teamId).toBe('t1');
    expect(reopened.paused()).toBeTrue();
    expect(reopened.countdown()).toBe('01:40');
    reopened.resume();
    now += 5 * SECOND;
    reopened.tick();
    expect(reopened.countdown()).toBe('01:35');
  });

  it('un décompte figé avant une fermeture reste figé (rien ne repart seul)', () => {
    const service = create();
    service.start(team, plan, 'team');
    now += 10 * SECOND;
    service.askStop();
    service.tick();
    const reopened = create();
    now += 60 * SECOND;
    reopened.tick();
    expect(reopened.paused()).toBeTrue();
    expect(reopened.countdown()).toBe('01:50');
  });

  it('une garde de sortie puis « Continuer » reprend le décompte sans perte', () => {
    const service = create();
    service.start(team, plan, 'team');
    now += 10 * SECOND;
    service.askLeave('/equipe/t1/preparer');
    expect(service.confirm()).toEqual({ kind: 'leave', url: '/equipe/t1/preparer' });
    now += 100 * SECOND;
    service.tick();
    expect(service.countdown()).toBe('01:50');
    service.cancelConfirm();
    expect(service.confirm()).toBeNull();
    now += 10 * SECOND;
    service.tick();
    expect(service.countdown()).toBe('01:40');
  });

  it('une Daily arrêtée ne laisse rien en mémoire ni dans le stockage', () => {
    const service = create();
    service.start(team, plan, 'team');
    service.stop();
    expect(service.session()).toBeNull();
    expect(localStorage.getItem(DAILY_STORAGE_KEY)).toBeNull();
    expect(create().session()).toBeNull();
  });

  it('une donnée de Daily illisible est retirée sans erreur', () => {
    localStorage.setItem(DAILY_STORAGE_KEY, '{"version":1,"teamId":"t1"}');
    expect(create().session()).toBeNull();
    expect(localStorage.getItem(DAILY_STORAGE_KEY)).toBeNull();
  });

  it('un stockage refusé ne fait pas échouer la Daily', () => {
    const service = create();
    spyOn(Storage.prototype, 'setItem').and.throwError('quota');
    expect(() => service.start(team, plan, 'team')).not.toThrow();
    expect(service.countdown()).toBe('02:00');
  });
});
