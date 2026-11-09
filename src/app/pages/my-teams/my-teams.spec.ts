import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MyTeams } from './my-teams';
import { TeamStore } from '../../services/team.store';

describe('MyTeams (S1, S2 : écran Mes équipes)', () => {
  let store: TeamStore;
  let root: HTMLElement;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    store = TestBed.inject(TeamStore);
    store.save({ name: 'Zèbre', members: ['Léa', 'Tom'] });
    store.save({ name: 'Alpha', members: ['Ana', 'Ben', 'Cam'] });
    const fixture = TestBed.createComponent(MyTeams);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  });

  it('affiche le titre et le bouton principal « Nouvelle équipe »', () => {
    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Mes équipes');
    expect(root.textContent).toContain('Nouvelle équipe');
  });

  it('liste les équipes par ordre alphabétique, avec leur nombre de membres', () => {
    const titles = Array.from(root.querySelectorAll('.row-title')).map((el) => el.textContent?.trim());
    expect(titles).toEqual(['Alpha', 'Zèbre']);
    const counts = Array.from(root.querySelectorAll('.row-meta')).map((el) => el.textContent?.trim());
    expect(counts).toEqual(['3 membres', '2 membres']);
  });

  it('donne à chaque équipe un bouton « Ouvrir » vers sa présentation', () => {
    const links = Array.from(root.querySelectorAll('a')).filter((a) => a.textContent?.trim() === 'Ouvrir');
    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toContain(`/equipe/${store.sortedTeams()[0].id}`);
  });

  it('met le focus sur le titre à l\'arrivée', async () => {
    const fixture = TestBed.createComponent(MyTeams);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('h1'));
    fixture.destroy();
  });
});
