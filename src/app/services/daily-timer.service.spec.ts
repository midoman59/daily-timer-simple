import { TestBed } from '@angular/core/testing';
import { CLOCK, DailyTimerService } from './daily-timer.service';

describe('DailyTimerService (S9 : chronomètre de la Daily)', () => {
  let now: number;
  let service: DailyTimerService;
  const team = { name: 'Alpha', durationMinutes: 15, members: ['Léa', 'Tom'] };

  beforeEach(() => {
    now = 1_000_000;
    TestBed.configureTestingModule({ providers: [{ provide: CLOCK, useValue: () => now }] });
    service = TestBed.inject(DailyTimerService);
  });

  afterEach(() => service.stop());

  it('ne démarre jamais tout seul', () => {
    expect(service.session()).toBeNull();
    now += 60_000;
    service.tick();
    expect(service.session()).toBeNull();
  });

  it('démarre au lancement avec la durée configurée', () => {
    service.start(team);
    expect(service.countdown()).toBe('15:00');
    expect(service.isOverrun()).toBeFalse();
  });

  it('suit le temps système pour décompter', () => {
    service.start(team);
    now += 65_000;
    service.tick();
    expect(service.countdown()).toBe('13:55');
  });

  it('passe en dépassement après la durée et compte en +mm:ss', () => {
    service.start(team);
    now += 15 * 60_000 + 5_000;
    service.tick();
    expect(service.isOverrun()).toBeTrue();
    expect(service.countdown()).toBe('00:00');
    expect(service.overrunLabel()).toBe('00:05');
  });

  it("s'arrête sur demande et efface la session", () => {
    service.start(team);
    service.stop();
    expect(service.session()).toBeNull();
  });
});
