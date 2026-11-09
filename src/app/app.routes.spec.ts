import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { CLOCK, DailyTimerService } from './services/daily-timer.service';
import { TeamStore } from './services/team.store';

describe('Routes (S1 : accueil selon les équipes, S9 : rechargement)', () => {
  let team: { id: string };

  function configure(): void {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: CLOCK, useValue: () => 0 }],
    });
  }

  beforeEach(() => {
    localStorage.clear();
    configure();
    team = TestBed.inject(TeamStore).save({ name: 'Alpha', members: ['Léa', 'Tom'] })!;
  });

  /** Ouvre l'URL et renvoie l'URL finale, après redirections. */
  async function open(url: string): Promise<string> {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    await harness.fixture.whenStable();
    return TestBed.inject(Router).url;
  }

  it('déclare les écrans attendus', () => {
    const paths = routes.map((route) => route.path);
    expect(paths).toEqual([
      '',
      'equipes',
      'equipe',
      'equipe/nouvelle',
      'equipe/:id',
      'equipe/:id/modifier',
      'equipe/:id/preparer',
      'equipe/:id/daily',
      'equipe/:id/bilan',
      '**',
    ]);
  });

  it('ouvre « Mes équipes » à l\'accueil quand une équipe existe', async () => {
    expect(await open('/')).toBe('/equipes');
  });

  it('ouvre la création à l\'accueil quand aucune équipe n\'existe', async () => {
    localStorage.clear();
    TestBed.resetTestingModule();
    configure();
    expect(await open('/')).toBe('/equipe/nouvelle');
  });

  it('ouvre la création à l\'adresse /equipe', async () => {
    expect(await open('/equipe')).toBe('/equipe/nouvelle');
  });

  it('renvoie à l\'accueil quand l\'équipe demandée n\'existe pas', async () => {
    expect(await open('/equipe/inconnue')).toBe('/equipes');
  });

  it('ouvre la présentation de l\'équipe demandée', async () => {
    expect(await open(`/equipe/${team.id}`)).toBe(`/equipe/${team.id}`);
  });

  it('ne lance pas la Daily au rechargement : la Daily renvoie à la présentation', async () => {
    expect(await open(`/equipe/${team.id}/daily`)).toBe(`/equipe/${team.id}`);
    expect(TestBed.inject(DailyTimerService).session()).toBeNull();
  });
});
