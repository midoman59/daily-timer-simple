import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { TEAM_STORAGE_KEY, TeamStore } from './services/team.store';

describe('Routes (S7 : ouverture selon l\'équipe enregistrée)', () => {
  let router: Router;

  function setup(): void {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    router = TestBed.inject(Router);
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('ouvre la présentation au chargement quand une équipe existe', async () => {
    localStorage.setItem(
      TEAM_STORAGE_KEY,
      JSON.stringify({ version: 1, name: 'Alpha', durationMinutes: 15, members: ['Léa', 'Tom'] }),
    );
    setup();
    await router.navigateByUrl('/');
    expect(router.url).toBe('/presentation');
  });

  it('ouvre l\'écran de création quand aucune équipe n\'existe', async () => {
    setup();
    await router.navigateByUrl('/');
    expect(router.url).toBe('/equipe');
  });

  it('renvoie vers l\'écran de création avec le bandeau quand les données sont illisibles', async () => {
    localStorage.setItem(TEAM_STORAGE_KEY, '{pas du json');
    setup();
    await router.navigateByUrl('/presentation');
    expect(router.url).toBe('/equipe');
    expect(TestBed.inject(TeamStore).readError()).toBeTrue();
  });

  it('renvoie une adresse inconnue vers la bonne page', async () => {
    setup();
    await router.navigateByUrl('/n-importe-quoi');
    expect(router.url).toBe('/equipe');
  });
});
