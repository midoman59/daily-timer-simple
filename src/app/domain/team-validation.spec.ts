import { DEFAULT_DURATION_MINUTES, validateDuration } from './team-validation';

describe('validateDuration (S1)', () => {
  it('vaut 15 minutes par défaut', () => {
    expect(DEFAULT_DURATION_MINUTES).toBe(15);
  });

  it('accepte un entier entre 1 et 120', () => {
    expect(validateDuration('15')).toBeNull();
    expect(validateDuration('1')).toBeNull();
    expect(validateDuration('120')).toBeNull();
  });

  it('refuse une valeur décimale', () => {
    expect(validateDuration('7,5')).toBe('Saisissez un nombre entier de minutes.');
  });
});
