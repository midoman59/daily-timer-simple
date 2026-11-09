import {
  MemberPlan,
  createDailyRun,
  currentSlot,
  elapsedMs,
  isFinished,
  nextMember,
  passMember,
  pause,
  remainingMs,
  reportRows,
  resume,
  validateMinutes,
} from './daily-run';

const members: MemberPlan[] = [
  { name: 'Léa', minutes: 2 },
  { name: 'Tom', minutes: 1 },
  { name: 'Ana', minutes: 3 },
];

const START = 1_000_000;
const SECOND = 1000;

describe('Daily : temps de parole', () => {
  it('démarre le premier membre à son temps alloué, dans l’ordre de l’équipe', () => {
    const run = createDailyRun(members, 'team', START);
    expect(run.order.map((slot) => slot.name)).toEqual(['Léa', 'Tom', 'Ana']);
    expect(currentSlot(run)?.name).toBe('Léa');
    expect(remainingMs(run, START)).toBe(120 * SECOND);
  });

  it('le décompte devient négatif en dépassement et reste sur le même membre', () => {
    const run = createDailyRun(members, 'team', START);
    expect(remainingMs(run, START + 130 * SECOND)).toBe(-10 * SECOND);
    expect(currentSlot(run)?.name).toBe('Léa');
  });

  it('« Suivant » passe au membre suivant ; le temps non utilisé est perdu', () => {
    const run = createDailyRun(members, 'team', START);
    const next = nextMember(run, START + 30 * SECOND);
    expect(currentSlot(next)?.name).toBe('Tom');
    expect(remainingMs(next, START + 30 * SECOND)).toBe(60 * SECOND);
    expect(next.order[0].status).toBe('done');
  });

  it('un tirage aléatoire est fixé à la création et suit le mode choisi', () => {
    const run = createDailyRun(members, 'random', START, () => 0);
    expect(run.order.map((slot) => slot.name)).toEqual(['Tom', 'Ana', 'Léa']);
    expect(createDailyRun(members, 'team', START).order.map((slot) => slot.name)).toEqual(['Léa', 'Tom', 'Ana']);
  });
});

describe('Daily : passer un membre', () => {
  it('passer le membre qui parle donne la parole au suivant, sans temps pour lui', () => {
    const run = passMember(createDailyRun(members, 'team', START), 0, START + 10 * SECOND);
    expect(run.order[0].status).toBe('passed');
    expect(currentSlot(run)?.name).toBe('Tom');
  });

  it('passer un membre à venir ne change pas le membre qui parle', () => {
    const run = passMember(createDailyRun(members, 'team', START), 2, START);
    expect(run.order[2].status).toBe('passed');
    expect(currentSlot(run)?.name).toBe('Léa');
  });

  it('un membre déjà fait ou déjà passé ne peut plus être passé', () => {
    const first = nextMember(createDailyRun(members, 'team', START), START + SECOND);
    expect(passMember(first, 0, START + 2 * SECOND)).toBe(first);
    const passed = passMember(createDailyRun(members, 'team', START), 1, START);
    expect(passMember(passed, 1, START)).toBe(passed);
  });
});

describe('Daily : fin et bilan', () => {
  it('« Suivant » au dernier membre termine la Daily', () => {
    let run = createDailyRun(members, 'team', START);
    run = nextMember(run, START + 10 * SECOND);
    run = nextMember(run, START + 20 * SECOND);
    run = nextMember(run, START + 90 * SECOND);
    expect(isFinished(run)).toBe(true);
    expect(currentSlot(run)).toBeNull();
  });

  it('le bilan donne le temps parlé, le temps alloué, le dépassement et le statut passé', () => {
    let run = createDailyRun(members, 'team', START);
    run = nextMember(run, START + 150 * SECOND); // Léa : 150 s pour 120 s alloués
    run = passMember(run, 1, START + 150 * SECOND); // Tom passé
    run = nextMember(run, START + 180 * SECOND); // Ana : 30 s
    expect(reportRows(run)).toEqual([
      { name: 'Léa', passed: false, spokenSeconds: 150, allottedSeconds: 120, overrunSeconds: 30 },
      { name: 'Tom', passed: true, spokenSeconds: null, allottedSeconds: 60, overrunSeconds: 0 },
      { name: 'Ana', passed: false, spokenSeconds: 30, allottedSeconds: 180, overrunSeconds: 0 },
    ]);
  });
});

describe('Daily : pause et reprise', () => {
  it('la pause fige le décompte, et le temps de pause ne compte pas', () => {
    const run = pause(createDailyRun(members, 'team', START), START + 10 * SECOND);
    expect(elapsedMs(run, START + 100 * SECOND)).toBe(10 * SECOND);
    expect(remainingMs(run, START + 100 * SECOND)).toBe(110 * SECOND);
  });

  it('la reprise repart du temps déjà parlé', () => {
    let run = pause(createDailyRun(members, 'team', START), START + 10 * SECOND);
    run = resume(run, START + 100 * SECOND);
    expect(elapsedMs(run, START + 110 * SECOND)).toBe(20 * SECOND);
  });

  it('« Suivant » pendant la pause : le membre suivant reste figé jusqu’à la reprise', () => {
    let run = pause(createDailyRun(members, 'team', START), START + 10 * SECOND);
    run = nextMember(run, START + 50 * SECOND);
    expect(currentSlot(run)?.name).toBe('Tom');
    expect(remainingMs(run, START + 500 * SECOND)).toBe(60 * SECOND);
    run = resume(run, START + 500 * SECOND);
    expect(remainingMs(run, START + 510 * SECOND)).toBe(50 * SECOND);
  });
});

describe('validateMinutes', () => {
  it('accepte les entiers de 1 à 5 et refuse le reste', () => {
    expect(validateMinutes('1')).toBeNull();
    expect(validateMinutes('5')).toBeNull();
    expect(validateMinutes('0')).not.toBeNull();
    expect(validateMinutes('6')).not.toBeNull();
    expect(validateMinutes('2.5')).not.toBeNull();
  });
});
