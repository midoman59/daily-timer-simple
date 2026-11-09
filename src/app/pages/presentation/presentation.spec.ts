import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MyTeams } from '../my-teams/my-teams';
import { TeamStore } from '../../services/team.store';
import { Presentation } from './presentation';

describe('Presentation (S8 : vérifier l\'équipe avant la Daily)', () => {
  let teamId: string;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'equipe/:id', component: Presentation },
          { path: '**', component: MyTeams },
        ]),
      ],
    });
    teamId = TestBed.inject(TeamStore).save({ name: 'Équipe Alpha', members: ['Léa', 'Tom', 'Ana'] })!.id;
  });

  async function open(id = teamId) {
    const harness = await RouterTestingHarness.create(`/equipe/${id}`);
    await harness.fixture.whenStable();
    return { harness, el: harness.fixture.nativeElement as HTMLElement };
  }

  it('affiche le nom, le nombre de membres et la liste dans l\'ordre de saisie', async () => {
    const { el } = await open();
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Équipe Alpha');
    expect(el.textContent).toContain('3 membres');
    const names = Array.from(el.querySelectorAll('.member-list .row-title')).map((n) => n.textContent?.trim());
    expect(names).toEqual(['Léa', 'Tom', 'Ana']);
  });

  it('n\'affiche aucune durée', async () => {
    const { el } = await open();
    expect(el.textContent).not.toContain('min ·');
    expect(el.textContent).not.toContain('Durée');
  });

  it('propose « Démarrer une Daily » (principal) et « Modifier l\'équipe » (secondaire)', async () => {
    const { el } = await open();
    const start = Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes('Démarrer une Daily'));
    expect(start).toBeDefined();
    const modify = Array.from(el.querySelectorAll('a')).find((a) => a.textContent?.includes("Modifier l'équipe"));
    expect(modify?.getAttribute('href')).toContain(`/equipe/${teamId}/modifier`);
  });

  it('« Démarrer une Daily » ouvre la préparation, sans lancer le chronomètre', async () => {
    const { harness, el } = await open();
    const start = Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes('Démarrer une Daily')) as HTMLButtonElement;
    start.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe(`/equipe/${teamId}/preparer`);
  });

  it('désactive « Démarrer une Daily » avec moins de 2 membres, et l\'explique', async () => {
    const small = TestBed.inject(TeamStore).save({ name: 'Petite', members: ['Léa'] })!.id;
    const { el } = await open(small);
    const start = Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes('Démarrer une Daily'))!;
    expect(start.getAttribute('aria-disabled')).toBe('true');
    expect(el.textContent).toContain('Ajoutez au moins 2 membres pour démarrer.');
    start.click();
    await Promise.resolve();
    expect(TestBed.inject(Router).url).toBe(`/equipe/${small}`);
  });

  it('affiche « Équipe enregistrée. » quand on arrive après un enregistrement', async () => {
    spyOnProperty(history, 'state', 'get').and.returnValue({ saved: true });
    const { el } = await open();
    expect(el.textContent).toContain('Équipe enregistrée.');
  });

  it('met le focus sur le titre à l\'arrivée', async () => {
    const { el } = await open();
    await Promise.resolve();
    expect(document.activeElement).toBe(el.querySelector('h1'));
  });
});
