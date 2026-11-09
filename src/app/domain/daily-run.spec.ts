import {
  DailyRun,
  createDailyRun,
  currentSlot,
  isFinished,
  nextMember,
  passMember,
  remainingMs,
  validateMinutes,
} from './daily-run';

const members = [
  { name: 'Léa', minutes: 2 },
  { name: 'Tom', minutes: 1 },
  { name: 'Ana', minutes: 3 },
];

const names = (run: DailyRun): string[] => run.order.map((slot) => slot.name);
const statuses = (run: DailyRun): string[] => run.order.map((slot) => slot.status);

describe('Daily : ordre de passage (S11, S12)', () => {
  it('suit l\'ordre de l\'équipe quand il est choisi', () => {
    const run = createDailyRun(members, 'team', 0);
    expect(names(run)).toEqual(['Léa', 'Tom', 'Ana']);
  });

  it('tire un ordre aléatoire une fois, en gardant tous les membres', () => {
    const run = createDailyRun(members, 'random', 0, () => 0.5);
    expect(names(run).slice().sort()).toEqual(['Ana', 'Léa', 'Tom']);
  });

  it('ne change pas la liste des membres passée en entrée', () => {
    createDailyRun(members, 'random', 0, () => 0);
    expect(members.map((member) => member.name)).toEqual(['Léa', 'Tom', 'Ana']);
  });

  it('donne au premier membre de l\'ordre le temps prévu et la parole', () => {
    const run = createDailyRun(members, 'team', 1000);
    expect(currentSlot(run)?.name).toBe('Léa');
    expect(currentSlot(run)?.allottedSeconds).toBe(120);
    expect(statuses(run)).toEqual(['current', 'waiting', 'waiting']);
  });

  it('ne démarre pas sans membre', () => {
    const run = createDailyRun([], 'team', 0);
    expect(isFinished(run)).toBeTrue();
  });
});

describe('Daily : passer au membre suivant (S14)', () => {
  it('marque le membre quitté comme fait et redonne le temps du suivant', () => {
    const run = nextMember(createDailyRun(members, 'team', 0), 90_000);
    expect(statuses(run)).toEqual(['done', 'current', 'waiting']);
    expect(currentSlot(run)?.name).toBe('Tom');
    expect(remainingMs(run, 90_000)).toBe(60_000);
  });

  it('au dernier membre, la Daily est terminée', () => {
    let run = createDailyRun(members, 'team', 0);
    run = nextMember(run, 1);
    run = nextMember(run, 2);
    run = nextMember(run, 3);
    expect(isFinished(run)).toBeTrue();
    expect(statuses(run)).toEqual(['done', 'done', 'done']);
    expect(remainingMs(run, 10)).toBe(0);
  });
});

describe('Daily : passer un membre (S15)', () => {
  it('passe un membre à venir sans lui attribuer de temps', () => {
    const run = passMember(createDailyRun(members, 'team', 0), 2, 5);
    expect(statuses(run)).toEqual(['current', 'waiting', 'passed']);
  });

  it('passe le membre qui parle : la parole va immédiatement au suivant, avec son temps', () => {
    const run = passMember(createDailyRun(members, 'team', 0), 0, 30_000);
    expect(statuses(run)).toEqual(['passed', 'current', 'waiting']);
    expect(currentSlot(run)?.name).toBe('Tom');
    expect(remainingMs(run, 30_000)).toBe(60_000);
  });

  it('un membre passé ne reprend pas dans la même Daily', () => {
    let run = passMember(createDailyRun(members, 'team', 0), 1, 0);
    run = nextMember(run, 10);
    expect(currentSlot(run)?.name).toBe('Ana');
    expect(statuses(run)).toEqual(['done', 'passed', 'current']);
  });

  it('passer le dernier membre qui parle termine la Daily', () => {
    let run = nextMember(createDailyRun(members, 'team', 0), 1);
    run = nextMember(run, 2);
    run = passMember(run, 2, 3);
    expect(isFinished(run)).toBeTrue();
  });

  it('ne change pas un membre déjà fait ou déjà passé', () => {
    const afterNext = nextMember(createDailyRun(members, 'team', 0), 1);
    expect(passMember(afterNext, 0, 2)).toEqual(afterNext);
    const afterPass = passMember(createDailyRun(members, 'team', 0), 1, 0);
    expect(passMember(afterPass, 1, 5)).toEqual(afterPass);
  });
});

describe('Préparation : temps de parole par membre (S10)', () => {
  it('accepte un entier de 1 à 5 minutes', () => {
    for (const value of ['1', '2', '3', '4', '5']) {
      expect(validateMinutes(value)).toBeNull();
    }
  });

  it('refuse une valeur absente ou hors bornes, avec le message de l\'écran', () => {
    const message = 'Choisissez une durée entre 1 et 5 minutes.';
    expect(validateMinutes('')).toBe(message);
    expect(validateMinutes('0')).toBe(message);
    expect(validateMinutes('6')).toBe(message);
    expect(validateMinutes('2,5')).toBe(message);
  });
});

describe('Daily : décompte et dépassement (S16)', () => {
  it('calcule le temps restant du membre courant à partir de l\'heure du début de son tour', () => {
    const run = createDailyRun(members, 'team', 0);
    expect(remainingMs(run, 60_000)).toBe(60_000);
  });

  it('devient négatif au-delà du temps prévu (le décompte continue)', () => {
    const run = createDailyRun(members, 'team', 0);
    expect(remainingMs(run, 150_000)).toBe(-30_000);
  });
});
