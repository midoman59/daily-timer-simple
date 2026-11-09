import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MyTeams } from '../my-teams/my-teams';
import { TeamStore } from '../../services/team.store';
import { TeamEditor } from './team-editor';

/** Ouvre l'écran à l'URL donnée et attend le rendu. */
async function open(url: string) {
  const harness = await RouterTestingHarness.create(url);
  const editor = harness.routeNativeElement as HTMLElement;
  await harness.fixture.whenStable();
  return { harness, el: harness.fixture.nativeElement as HTMLElement, editor };
}

function input(el: HTMLElement, id: string): HTMLInputElement {
  return el.querySelector<HTMLInputElement>(`#${id}`)!;
}

function button(el: HTMLElement, label: string): HTMLButtonElement {
  return Array.from(el.querySelectorAll<HTMLButtonElement>('button, a')).find(
    (b) => b.textContent?.trim() === label,
  ) as HTMLButtonElement;
}

/** Saisit un prénom et valide avec Entrée, comme le fait l'utilisateur. */
async function addMember(harness: RouterTestingHarness, el: HTMLElement, name: string): Promise<void> {
  const field = input(el, 'member-name');
  field.value = name;
  field.dispatchEvent(new Event('input'));
  field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  harness.fixture.detectChanges();
  await harness.fixture.whenStable();
}

function typeName(harness: RouterTestingHarness, el: HTMLElement, value: string): void {
  const field = input(el, 'team-name');
  field.value = value;
  field.dispatchEvent(new Event('input'));
  field.dispatchEvent(new Event('blur'));
  harness.fixture.detectChanges();
}

describe('TeamEditor (S3 à S7 : création et modification sans durée)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'equipe/nouvelle', component: TeamEditor },
          { path: 'equipe/:id/modifier', component: TeamEditor },
          { path: '**', component: MyTeams },
        ]),
      ],
    });
  });

  describe('création', () => {
    it('n\'affiche aucun champ de durée ni message de durée (S3)', async () => {
      const { el } = await open('/equipe/nouvelle');
      expect(el.querySelector('#duration')).toBeNull();
      expect(el.textContent).not.toContain('Durée');
      expect(el.textContent).not.toContain('min');
    });

    it('a pour titre « Nouvelle équipe » et met le focus dessus à l\'arrivée', async () => {
      const { el } = await open('/equipe/nouvelle');
      expect(el.querySelector('h1')?.textContent?.trim()).toBe('Nouvelle équipe');
      expect(document.activeElement).toBe(el.querySelector('h1'));
    });

    it('ajoute les membres en fin de liste avec Entrée, vide le champ et met à jour le compteur (S3, S4)', async () => {
      const { harness, el } = await open('/equipe/nouvelle');
      await addMember(harness, el, 'Léa');
      await addMember(harness, el, 'Tom');
      const names = Array.from(el.querySelectorAll('.member-list .row-title')).map((n) => n.textContent?.trim());
      expect(names).toEqual(['Léa', 'Tom']);
      expect(input(el, 'member-name').value).toBe('');
      expect(el.querySelector('.counter')?.textContent?.trim()).toBe('2 membres');
    });

    it('refuse un doublon et un prénom vide avec un message lié au champ (S5)', async () => {
      const { harness, el } = await open('/equipe/nouvelle');
      await addMember(harness, el, 'Thomas');
      await addMember(harness, el, 'thomas');
      expect(el.textContent).toContain("Ce prénom existe déjà dans l'équipe.");
      expect(input(el, 'member-name').getAttribute('aria-describedby')).toBe('member-name-error');
      expect(el.querySelectorAll('.member-list .row').length).toBe(1);
    });

    it('garde « Enregistrer l\'équipe » inactif sans nom ou avec moins de 2 membres (S5)', async () => {
      const { harness, el } = await open('/equipe/nouvelle');
      const save = button(el, "Enregistrer l'équipe");
      expect(save.getAttribute('aria-disabled')).toBe('true');
      expect(el.textContent).toContain('Ajoutez au moins 2 membres pour continuer.');
      typeName(harness, el, 'Équipe Alpha');
      await addMember(harness, el, 'Léa');
      expect(save.getAttribute('aria-disabled')).toBe('true');
    });

    it('refuse un nom au-delà de 50 caractères avec son message', async () => {
      const { harness, el } = await open('/equipe/nouvelle');
      typeName(harness, el, 'a'.repeat(51));
      expect(el.textContent).toContain('Le nom d\'équipe ne dépasse pas 50 caractères.');
    });

    it('enregistre l\'équipe, navigue vers sa présentation et la conserve (S6, S9)', async () => {
      const { harness, el } = await open('/equipe/nouvelle');
      typeName(harness, el, '  Équipe   Alpha ');
      await addMember(harness, el, 'Léa');
      await addMember(harness, el, 'Tom');
      button(el, "Enregistrer l'équipe").click();
      await harness.fixture.whenStable();

      const router = TestBed.inject(Router);
      const [saved] = TestBed.inject(TeamStore).teams();
      expect(saved.name).toBe('Équipe Alpha');
      expect(saved.members).toEqual(['Léa', 'Tom']);
      expect(router.url).toBe(`/equipe/${saved.id}`);
    });

    it('propose toujours Annuler, qui ramène à « Mes équipes » (D49)', async () => {
      const { harness, el } = await open('/equipe/nouvelle');
      expect(button(el, 'Annuler')).toBeDefined();
      button(el, 'Annuler').click();
      await harness.fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe('/equipes');
    });

    it('met en majuscule la première lettre de chaque prénom ajouté, sans toucher au reste (S23)', async () => {
      const { harness, el } = await open('/equipe/nouvelle');
      await addMember(harness, el, 'jean-pierre');
      await addMember(harness, el, 'élodie');
      await addMember(harness, el, 'MARIE');
      const names = Array.from(el.querySelectorAll('.member-list .row-title')).map((node) => node.textContent?.trim());
      expect(names).toEqual(['Jean-pierre', 'Élodie', 'MARIE']);
    });

    it('refuse un doublon sans tenir compte de la casse, et garde la saisie (S24)', async () => {
      const { harness, el } = await open('/equipe/nouvelle');
      await addMember(harness, el, 'Thomas');
      await addMember(harness, el, 'thomas');
      expect(el.querySelectorAll('.member-list .row-title').length).toBe(1);
      expect(el.textContent).toContain('Ce prénom existe déjà dans l\'équipe.');
      expect(input(el, 'member-name').value).toBe('thomas');
    });

    it('garde le focus dans la liste après le 15e membre (B1)', async () => {
      const { harness, el } = await open('/equipe/nouvelle');
      const names = ['Ana', 'Ben', 'Cam', 'Dan', 'Eva', 'Fred', 'Gil', 'Hana', 'Ivan', 'Jade', 'Karl', 'Lou', 'Max', 'Nina', 'Omar'];
      for (const name of names) {
        await addMember(harness, el, name);
      }
      expect(el.textContent).toContain('Une équipe ne peut pas dépasser 15 membres.');
      expect(input(el, 'member-name').disabled).toBeTrue();
      expect(document.activeElement?.getAttribute('aria-label')).toBe('Supprimer Omar');
    });

    it('après la suppression d\'un membre du milieu, le focus va au Supprimer du membre suivant (I1)', async () => {
      const { harness, el } = await open('/equipe/nouvelle');
      await addMember(harness, el, 'Ana');
      await addMember(harness, el, 'Ben');
      await addMember(harness, el, 'Cléo');
      el.querySelector<HTMLButtonElement>('button[aria-label="Supprimer Ben"]')!.click();
      harness.fixture.detectChanges();
      await harness.fixture.whenStable();
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement?.getAttribute('aria-label')).toBe('Supprimer Cléo');
    });

    it('après la suppression du dernier membre, le focus va au champ Prénom (I1)', async () => {
      const { harness, el } = await open('/equipe/nouvelle');
      await addMember(harness, el, 'Ana');
      await addMember(harness, el, 'Ben');
      el.querySelector<HTMLButtonElement>('button[aria-label="Supprimer Ben"]')!.click();
      harness.fixture.detectChanges();
      await harness.fixture.whenStable();
      expect(document.activeElement).toBe(input(el, 'member-name'));
    });

    it('affiche le bandeau d\'illisibilité quand une donnée stockée est illisible', async () => {
      localStorage.setItem('daily-timer-simple.teams.v2', '{pas du json');
      const { el } = await open('/equipe/nouvelle');
      expect(el.textContent).toContain("Les données de l'équipe sont illisibles. Recréez l'équipe.");
    });
  });

  describe('modification', () => {
    it('ouvre l\'écran prérempli avec le nom et les membres de l\'équipe (S7)', async () => {
      const team = TestBed.inject(TeamStore).save({ name: 'Équipe Beta', members: ['Ana', 'Ben'] })!;
      const { el } = await open(`/equipe/${team.id}/modifier`);
      expect(el.querySelector('h1')?.textContent?.trim()).toBe("Modifier l'équipe");
      expect(input(el, 'team-name').value).toBe('Équipe Beta');
      const names = Array.from(el.querySelectorAll('.member-list .row-title')).map((n) => n.textContent?.trim());
      expect(names).toEqual(['Ana', 'Ben']);
    });

    it('enregistre les changements sur la même équipe, sans en créer une autre (S7)', async () => {
      const store = TestBed.inject(TeamStore);
      const team = store.save({ name: 'Équipe Beta', members: ['Ana', 'Ben'] })!;
      const { harness, el } = await open(`/equipe/${team.id}/modifier`);
      typeName(harness, el, 'Équipe Bêta');
      button(el, "Enregistrer l'équipe").click();
      await harness.fixture.whenStable();
      expect(store.teams()).toEqual([{ id: team.id, name: 'Équipe Bêta', members: ['Ana', 'Ben'] }]);
      expect(TestBed.inject(Router).url).toBe(`/equipe/${team.id}`);
    });

    it('Annuler revient à la présentation sans rien enregistrer (S7)', async () => {
      const store = TestBed.inject(TeamStore);
      const team = store.save({ name: 'Équipe Beta', members: ['Ana', 'Ben'] })!;
      const { harness, el } = await open(`/equipe/${team.id}/modifier`);
      typeName(harness, el, 'Autre nom');
      button(el, 'Annuler').click();
      await harness.fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe(`/equipe/${team.id}`);
      expect(store.find(team.id)?.name).toBe('Équipe Beta');
    });

    it('retirer un membre demande confirmation avant l\'enregistrement, et « Revenir » ne perd rien (S22)', async () => {
      const store = TestBed.inject(TeamStore);
      const team = store.save({ name: 'Équipe Gamma', members: ['Ana', 'Ben', 'Cam'] })!;
      const { harness, el } = await open(`/equipe/${team.id}/modifier`);
      el.querySelector<HTMLButtonElement>('button[aria-label="Supprimer Ben"]')!.click();
      harness.fixture.detectChanges();
      button(el, "Enregistrer l'équipe").click();
      harness.fixture.detectChanges();
      expect(el.querySelector('[role="alertdialog"]')?.textContent).toContain("Cette modification retire Ben de l'équipe.");
      expect(store.find(team.id)?.members).toEqual(['Ana', 'Ben', 'Cam']);

      button(el, 'Revenir').click();
      harness.fixture.detectChanges();
      expect(el.querySelector('[role="alertdialog"]')).toBeNull();
      expect(store.find(team.id)?.members).toEqual(['Ana', 'Ben', 'Cam']);

      button(el, "Enregistrer l'équipe").click();
      harness.fixture.detectChanges();
      button(el, 'Enregistrer').click();
      await harness.fixture.whenStable();
      expect(store.find(team.id)?.members).toEqual(['Ana', 'Cam']);
    });

    it('Échap équivaut à Annuler en modification', async () => {
      const team = TestBed.inject(TeamStore).save({ name: 'Équipe Beta', members: ['Ana', 'Ben'] })!;
      const { harness, el } = await open(`/equipe/${team.id}/modifier`);
      el.querySelector('main')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await harness.fixture.whenStable();
      expect(TestBed.inject(Router).url).toBe(`/equipe/${team.id}`);
    });
  });
});
