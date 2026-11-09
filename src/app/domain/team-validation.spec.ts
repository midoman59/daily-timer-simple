import { capitalizeFirst, memberCountLabel, validateMemberName, validateTeamName } from './team-validation';

describe('memberCountLabel (S4, S8)', () => {
  it('accorde le mot membre selon le nombre', () => {
    expect(memberCountLabel(0)).toBe('0 membre');
    expect(memberCountLabel(1)).toBe('1 membre');
    expect(memberCountLabel(2)).toBe('2 membres');
    expect(memberCountLabel(15)).toBe('15 membres');
  });
});

describe('validateTeamName (S3, S5)', () => {
  it('refuse un nom vide ou composé d\'espaces', () => {
    expect(validateTeamName('')).toBe('Donnez un nom à votre équipe.');
    expect(validateTeamName('   ')).toBe('Donnez un nom à votre équipe.');
  });

  it('accepte un nom de 50 caractères et refuse le 51e', () => {
    expect(validateTeamName('a'.repeat(50))).toBeNull();
    expect(validateTeamName('a'.repeat(51))).toBe('Le nom d\'équipe ne dépasse pas 50 caractères.');
  });

  it('mesure la longueur après retrait des espaces superflus', () => {
    expect(validateTeamName(`  ${'a'.repeat(50)}  `)).toBeNull();
  });
});

describe('validateMemberName (S3, S5)', () => {
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
    expect(validateMemberName('a'.repeat(31), [])).toBe('Le prénom ne dépasse pas 30 caractères.');
  });

  it('refuse un doublon insensible à la casse et aux espaces, sensible aux accents', () => {
    expect(validateMemberName('thomas', ['Thomas'])).toBe('Ce prénom existe déjà dans l\'équipe.');
    expect(validateMemberName('  Thomas  ', ['Thomas'])).toBe('Ce prénom existe déjà dans l\'équipe.');
    expect(validateMemberName('Lea', ['Léa'])).toBeNull();
  });
});

describe('capitalizeFirst (majuscule du prénom)', () => {
  it('met en majuscule la première lettre sans toucher au reste', () => {
    expect(capitalizeFirst('jean-pierre')).toBe('Jean-pierre');
    expect(capitalizeFirst('élodie')).toBe('Élodie');
    expect(capitalizeFirst('MARIE')).toBe('MARIE');
    expect(capitalizeFirst('mcDonald')).toBe('McDonald');
  });

  it('laisse une chaîne vide ou sans lettre inchangée', () => {
    expect(capitalizeFirst('')).toBe('');
    expect(capitalizeFirst('-')).toBe('-');
  });
});
