import { screenDepth } from './app';

describe('screenDepth (design 5.6 : sens de glissement entre écrans)', () => {
  it('ordonne les cinq écrans du parcours', () => {
    expect(screenDepth('/equipes')).toBe(0);
    expect(screenDepth('/equipe/nouvelle')).toBe(1);
    expect(screenDepth('/equipe/abc/modifier')).toBe(1);
    expect(screenDepth('/equipe/abc')).toBe(2);
    expect(screenDepth('/equipe/abc/preparer')).toBe(3);
    expect(screenDepth('/equipe/abc/daily')).toBe(4);
  });

  it('ignore la requête et le fragment, et renvoie null pour une adresse inconnue', () => {
    expect(screenDepth('/equipe/abc?x=1')).toBe(2);
    expect(screenDepth('/inconnu')).toBeNull();
    expect(screenDepth('/')).toBeNull();
  });
});
