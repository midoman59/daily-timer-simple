import { LEGACY_TEAM_STORAGE_KEY, TEAMS_STORAGE_KEY, TeamStore } from './team.store';

describe('TeamStore (S6, S7, S9 : équipes enregistrées et retrouvées au rechargement)', () => {
  const alpha = { name: 'Équipe Alpha', members: ['Léa', 'Tom'] };
  const beta = { name: 'Équipe Beta', members: ['Ana', 'Ben', 'Cam'] };

  beforeEach(() => {
    localStorage.clear();
  });

  it('démarre sans équipe quand rien n\'est enregistré', () => {
    const store = new TeamStore();
    expect(store.teams()).toEqual([]);
    expect(store.readError()).toBeFalse();
  });

  it('enregistre une équipe avec un identifiant et la retrouve au rechargement', () => {
    const saved = new TeamStore().save(alpha);
    expect(saved).not.toBeNull();
    expect(saved!.id).toBeTruthy();
    expect(new TeamStore().teams()).toEqual([saved!]);
  });

  it('n\'enregistre que le nom et les membres, sans aucune durée', () => {
    new TeamStore().save(alpha);
    const stored = JSON.parse(localStorage.getItem(TEAMS_STORAGE_KEY) ?? 'null');
    const [team] = stored.teams;
    expect(Object.keys(team).sort()).toEqual(['id', 'members', 'name']);
  });

  it('garde plusieurs équipes et les retrouve toutes', () => {
    const store = new TeamStore();
    store.save(alpha);
    store.save(beta);
    expect(new TeamStore().teams().map((team) => team.name)).toEqual(['Équipe Alpha', 'Équipe Beta']);
  });

  it('présente les équipes par ordre alphabétique', () => {
    const store = new TeamStore();
    store.save({ name: 'Zèbre', members: ['A', 'B'] });
    store.save({ name: 'Alpha', members: ['A', 'B'] });
    store.save({ name: 'équipe Mu', members: ['A', 'B'] });
    expect(store.sortedTeams().map((team) => team.name)).toEqual(['Alpha', 'équipe Mu', 'Zèbre']);
  });

  it('modifie une équipe existante par son identifiant, sans en créer une autre', () => {
    const store = new TeamStore();
    const saved = store.save(alpha)!;
    store.save({ ...saved, name: 'Équipe Alpha 2', members: ['Léa'] });
    expect(new TeamStore().teams()).toEqual([{ id: saved.id, name: 'Équipe Alpha 2', members: ['Léa'] }]);
  });

  it('retrouve une équipe par son identifiant', () => {
    const store = new TeamStore();
    const saved = store.save(alpha)!;
    store.save(beta);
    expect(store.find(saved.id)?.name).toBe('Équipe Alpha');
    expect(store.find('inconnu')).toBeUndefined();
  });

  it('migre l\'équipe de la version 1 en ignorant son ancienne durée', () => {
    localStorage.setItem(
      LEGACY_TEAM_STORAGE_KEY,
      JSON.stringify({ version: 1, name: 'Équipe Ancienne', durationMinutes: 15, members: ['Léa', 'Tom'] }),
    );
    const store = new TeamStore();
    expect(store.teams().length).toBe(1);
    expect(store.teams()[0].name).toBe('Équipe Ancienne');
    expect('durationMinutes' in store.teams()[0]).toBeFalse();
    expect(localStorage.getItem(LEGACY_TEAM_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(TEAMS_STORAGE_KEY)).not.toBeNull();
  });

  it('signale des données illisibles sans planter (JSON invalide)', () => {
    localStorage.setItem(TEAMS_STORAGE_KEY, '{pas du json');
    const store = new TeamStore();
    expect(store.teams()).toEqual([]);
    expect(store.readError()).toBeTrue();
  });

  it('ignore une équipe mal formée et signale l\'erreur, sans perdre les autres', () => {
    localStorage.setItem(
      TEAMS_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        teams: [
          { id: '1', name: 'Équipe Alpha', members: ['Léa', 'Tom'] },
          { id: '2', name: '', members: 'pas une liste' },
        ],
      }),
    );
    const store = new TeamStore();
    expect(store.teams().map((team) => team.name)).toEqual(['Équipe Alpha']);
    expect(store.readError()).toBeTrue();
  });

  it('ne plante pas quand le stockage est inaccessible', () => {
    spyOn(Storage.prototype, 'getItem').and.throwError('SecurityError');
    const store = new TeamStore();
    expect(store.teams()).toEqual([]);
  });

  it('n\'ajoute pas une équipe en mémoire si l\'écriture échoue', () => {
    const store = new TeamStore();
    store.save(alpha);
    spyOn(Storage.prototype, 'setItem').and.throwError('QuotaExceededError');
    expect(store.save(beta)).toBeNull();
    expect(store.teams().map((team) => team.name)).toEqual(['Équipe Alpha']);
  });

  it('n\'envoie aucune donnée hors de l\'appareil : ni fetch, ni XMLHttpRequest, ni sendBeacon', () => {
    const fetchSpy = spyOn(window, 'fetch');
    const xhrSpy = spyOn(XMLHttpRequest.prototype, 'open');
    const beaconSpy = spyOn(navigator, 'sendBeacon');
    new TeamStore().save(alpha);
    expect(new TeamStore().teams().length).toBe(1);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrSpy).not.toHaveBeenCalled();
    expect(beaconSpy).not.toHaveBeenCalled();
  });

  it('affiche telle quelle une équipe enregistrée avec un doublon, sans dédoublonner (D45)', () => {
    localStorage.setItem(
      TEAMS_STORAGE_KEY,
      JSON.stringify({ version: 2, teams: [{ id: 'x1', name: 'Équipe', members: ['Thomas', 'thomas'] }] }),
    );
    const store = new TeamStore();
    expect(store.readError()).toBeFalse();
    expect(store.teams()[0].members).toEqual(['Thomas', 'thomas']);
  });

  it('supprime une équipe et ses membres, sans toucher aux autres (S21)', () => {
    const store = new TeamStore();
    const a = store.save(alpha)!;
    store.save(beta);
    expect(store.remove(a.id)).toBeTrue();
    const reloaded = new TeamStore();
    expect(reloaded.teams().map((team) => team.name)).toEqual(['Équipe Beta']);
  });

  it("ignore la suppression d'une équipe inconnue", () => {
    const store = new TeamStore();
    store.save(alpha);
    expect(store.remove('inconnue')).toBeFalse();
    expect(store.teams().length).toBe(1);
  });
});
