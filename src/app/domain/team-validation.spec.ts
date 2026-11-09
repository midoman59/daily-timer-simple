import {
  DEFAULT_DURATION_MINUTES,
  validateDuration,
  validateMemberName,
  validateTimePerMember,
} from './team-validation';

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

describe('validateMemberName (S2, S5)', () => {
  it('refuse un prénom vide ou composé d\'espaces', () => {
    expect(validateMemberName('', [])).toBe('Saisissez un prénom.');
    expect(validateMemberName('   ', [])).toBe('Saisissez un prénom.');
  });

  it('accepte lettres accentuées, espaces, traits d\'union et apostrophes', () => {
    expect(validateMemberName('Léa', [])).toBeNull();
    expect(validateMemberName("Marie-Claire D'Arc", [])).toBeNull();
    expect(validateMemberName('Jean’Luc', [])).toBeNull();
  });

  it('refuse les chiffres et autres caractères', () => {
    expect(validateMemberName('Tom2', [])).toBe(
      "Le prénom ne peut contenir que des lettres, espaces, traits d'union et apostrophes.",
    );
  });

  it('limite le prénom à 30 caractères', () => {
    expect(validateMemberName('a'.repeat(30), [])).toBeNull();
    expect(validateMemberName('a'.repeat(31), [])).toBe(
      'Le prénom ne peut pas dépasser 30 caractères.',
    );
  });

  it('refuse un doublon insensible à la casse et aux espaces, sensible aux accents', () => {
    expect(validateMemberName('thomas', ['Thomas'])).toBe('Ce prénom existe déjà dans l\'équipe.');
    expect(validateMemberName('  Thomas  ', ['Thomas'])).toBe('Ce prénom existe déjà dans l\'équipe.');
    expect(validateMemberName('Lea', ['Léa'])).toBeNull();
  });
});

describe('validateTimePerMember (S5)', () => {
  it('exige au moins 30 secondes par membre', () => {
    expect(validateTimePerMember(15, 15)).toBeNull();
    expect(validateTimePerMember(1, 2)).toBeNull();
    expect(validateTimePerMember(1, 3)).toBe(
      'La durée divisée par le nombre de membres doit être d\'au moins 30 secondes.',
    );
  });

  it('ne se prononce pas sans membre', () => {
    expect(validateTimePerMember(1, 0)).toBeNull();
  });
});
