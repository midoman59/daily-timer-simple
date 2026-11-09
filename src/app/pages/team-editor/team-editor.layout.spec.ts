import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TeamEditor } from './team-editor';

describe('TeamEditor (S10 : accessibilité tactile et mise en page)', () => {
  let fixture: ComponentFixture<TeamEditor>;
  let el: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [TeamEditor], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(TeamEditor);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('donne au bouton Ajouter une zone cliquable d\'au moins 44 x 44 px', () => {
    const add = Array.from(el.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes('Ajouter'),
    )!;
    const box = add.getBoundingClientRect();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  });

  it('donne au bouton Supprimer une zone cliquable de 44 x 44 px', () => {
    const input = el.querySelector<HTMLInputElement>('#member-name')!;
    input.value = 'Léa';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    const remove = el.querySelector<HTMLButtonElement>('.icon-btn')!;
    const box = remove.getBoundingClientRect();
    expect(box.width).toBe(44);
    expect(box.height).toBe(44);
  });

  it('garde une marge latérale de 16 px', () => {
    const page = el.querySelector<HTMLElement>('.page')!;
    const style = getComputedStyle(page);
    expect(style.paddingLeft).toBe('16px');
    expect(style.paddingRight).toBe('16px');
  });
});
