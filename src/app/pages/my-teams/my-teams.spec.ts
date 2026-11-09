import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MyTeams } from './my-teams';
import { TeamStore } from '../../services/team.store';

describe('MyTeams (S1, S2, S19, S20, S21 : écran Mes équipes)', () => {
  let store: TeamStore;
  let fixture: ComponentFixture<MyTeams>;
  let root: HTMLElement;

  function deleteButton(name: string): HTMLButtonElement {
    return Array.from(root.querySelectorAll('button')).find(
      (b) => b.getAttribute('aria-label') === `Supprimer ${name}`,
    )!;
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    store = TestBed.inject(TeamStore);
    store.save({ name: 'Zèbre', members: ['Léa', 'Tom'] });
    store.save({ name: 'Alpha', members: ['Ana', 'Ben', 'Cam'] });
    fixture = TestBed.createComponent(MyTeams);
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

  it('demande confirmation avant de supprimer, avec le nombre de membres (S21)', () => {
    deleteButton('Alpha').click();
    fixture.detectChanges();
    const dialog = root.querySelector('[role="alertdialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog!.textContent).toContain('Supprimer l\'équipe « Alpha » ?');
    expect(dialog!.textContent).toContain('Les 3 membres de l\'équipe seront supprimés. Cette action est définitive.');
    expect(store.teams().length).toBe(2);
  });

  it('« Annuler » ferme le dialogue sans rien supprimer', () => {
    deleteButton('Alpha').click();
    fixture.detectChanges();
    Array.from(root.querySelectorAll<HTMLButtonElement>('[role="alertdialog"] button')).find((b) => b.textContent?.trim() === 'Annuler')!.click();
    fixture.detectChanges();
    expect(root.querySelector('[role="alertdialog"]')).toBeNull();
    expect(store.teams().length).toBe(2);
  });

  it('« Supprimer l\'équipe » retire l\'équipe et sa ligne disparaît', () => {
    deleteButton('Alpha').click();
    fixture.detectChanges();
    Array.from(root.querySelectorAll<HTMLButtonElement>('[role="alertdialog"] button')).find((b) => b.textContent?.trim() === 'Supprimer l\'équipe')!.click();
    fixture.detectChanges();
    expect(store.teams().map((team) => team.name)).toEqual(['Zèbre']);
    const titles = Array.from(root.querySelectorAll('.row-title')).map((el) => el.textContent?.trim());
    expect(titles).toEqual(['Zèbre']);
  });

  it('met le focus sur le titre à l\'arrivée', async () => {
    await fixture.whenStable();
    expect(document.activeElement).toBe(root.querySelector('h1'));
  });
});
