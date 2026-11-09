import { TEAM_STORAGE_KEY, TeamStore } from './team.store';

describe('TeamStore (S7 : retrouver l\'équipe au rechargement)', () => {
  const team = { name: 'Équipe Alpha', durationMinutes: 15, members: ['Léa', 'Tom'] };

  beforeEach(() => {
    localStorage.clear();
  });

  it('relit l\'équipe enregistrée au démarrage, sans ressaisie', () => {
    new TeamStore().save(team);
    expect(new TeamStore().team()).toEqual(team);
  });

  it('ne fait aucun appel réseau : seul le stockage local est utilisé', () => {
    const fetchSpy = spyOn(window, 'fetch');
    new TeamStore().save(team);
    expect(new TeamStore().team()).toEqual(team);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('part d\'un état vide quand rien n\'est enregistré', () => {
    const store = new TeamStore();
    expect(store.team()).toBeNull();
    expect(store.readError()).toBeFalse();
  });

  it('signale des données illisibles sans planter (JSON invalide)', () => {
    localStorage.setItem(TEAM_STORAGE_KEY, '{pas du json');
    const store = new TeamStore();
    expect(store.team()).toBeNull();
    expect(store.readError()).toBeTrue();
  });

  it('signale des données illisibles quand la forme ne correspond pas', () => {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify({ version: 1, name: '', durationMinutes: 500, members: 'x' }));
    const store = new TeamStore();
    expect(store.team()).toBeNull();
    expect(store.readError()).toBeTrue();
  });

  it('ne plante pas quand le stockage est inaccessible', () => {
    spyOn(Storage.prototype, 'getItem').and.throwError('SecurityError');
    const store = new TeamStore();
    expect(store.team()).toBeNull();
  });

  it('n\'affiche pas une équipe non écrite comme enregistrée si l\'écriture échoue', () => {
    spyOn(Storage.prototype, 'setItem').and.throwError('QuotaExceededError');
    const store = new TeamStore();
    expect(store.save(team)).toBeFalse();
    expect(store.team()).toBeNull();
  });

  it('garde l\'équipe précédente en mémoire si la nouvelle écriture échoue', () => {
    const previous = { name: 'Équipe Beta', durationMinutes: 10, members: ['Ana', 'Ben'] };
    const store = new TeamStore();
    expect(store.save(previous)).toBeTrue();
    spyOn(Storage.prototype, 'setItem').and.throwError('QuotaExceededError');
    expect(store.save(team)).toBeFalse();
    expect(store.team()).toEqual(previous);
    expect(JSON.parse(localStorage.getItem(TEAM_STORAGE_KEY) ?? 'null').name).toBe('Équipe Beta');
  });
});
