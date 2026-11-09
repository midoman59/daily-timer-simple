/** Équipe enregistrée : une seule par appareil. Les membres gardent l'ordre de saisie. */
export interface Team {
  name: string;
  durationMinutes: number;
  members: string[];
}
