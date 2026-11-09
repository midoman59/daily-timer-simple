/**
 * Équipe enregistrée sur l'appareil. Elle ne contient que son nom et ses membres :
 * le temps de parole se choisit à chaque Daily. Les membres gardent l'ordre de saisie.
 */
export interface Team {
  id: string;
  name: string;
  members: string[];
}
