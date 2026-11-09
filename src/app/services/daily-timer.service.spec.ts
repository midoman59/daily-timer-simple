import { TestBed } from '@angular/core/testing';
import { CLOCK, DailyTimerService, RANDOM } from './daily-timer.service';

describe('DailyTimerService (S13 à S17 : chronomètre de la Daily)', () => {
  let now: number;
  let random: () => number;
  let service: DailyTimerService;
  const team = { id: 't1', name: 'Alpha', members: ['Léa', 'Tom'] };
  const plan = [
    { name: 'Léa', minutes: 2 },
    { name: 'Tom', minutes: 1 },
  ];

  beforeEach(() => {
    now = 1_000_000;
    random = Math.random;
    TestBed.configureTestingModule({
      providers: [
        { provide: CLOCK, useValue: () => now },
        { provide: RANDOM, useValue: () => random() },
      ],
    });
    service = TestBed.inject(DailyTimerService);
  });

  afterEach(() => service.stop());

  it('ne démarre jamais tout seul', () => {
    expect(service.session()).toBeNull();
    now += 60_000;
    service.tick();
    expect(service.session()).toBeNull();
  });

  it('démarre avec le temps du premier membre, choisi au lancement', () => {
    service.start(team, plan, 'team');
    expect(service.current()?.name).toBe('Léa');
    expect(service.countdown()).toBe('02:00');
    expect(service.isOverrun()).toBeFalse();
  });

  it('suit l\'heure du système pour décompter', () => {
    service.start(team, plan, 'team');
    now += 61_000;
    service.tick();
    expect(service.countdown()).toBe('00:59');
  });

  it('passe en dépassement : le décompte continue avec « +mm:ss »', () => {
    service.start(team, plan, 'team');
    now += 130_000;
    service.tick();
    expect(service.isOverrun()).toBeTrue();
    expect(service.countdown()).toBe('00:00');
    expect(service.overrunLabel()).toBe('00:10');
  });

  it('passer au suivant repart du temps du nouveau membre', () => {
    service.start(team, plan, 'team');
    now += 30_000;
    service.next();
    expect(service.current()?.name).toBe('Tom');
    expect(service.countdown()).toBe('01:00');
    expect(service.isOverrun()).toBeFalse();
  });

  it('passer le membre qui parle lui donne la parole au suivant immédiatement', () => {
    service.start(team, plan, 'team');
    now += 10_000;
    service.pass(0);
    expect(service.current()?.name).toBe('Tom');
    expect(service.countdown()).toBe('01:00');
  });

  it('au dernier membre, la Daily est terminée et le décompte s\'arrête à 00:00', () => {
    service.start(team, plan, 'team');
    service.next();
    service.next();
    expect(service.finished()).toBeTrue();
    expect(service.current()).toBeNull();
    expect(service.countdown()).toBe('00:00');
  });

  it('tire l\'ordre aléatoire au démarrage avec le tirage injecté', () => {
    random = () => 0;
    service.start(team, plan, 'random');
    expect(service.current()?.name).toBe('Tom');
  });

  it('arrête la Daily et efface la session', () => {
    service.start(team, plan, 'team');
    service.stop();
    expect(service.session()).toBeNull();
    expect(service.current()).toBeNull();
  });
});
