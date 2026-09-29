import type { Faction } from '../../engine/types';
import type { Reward } from '../../economy/constants';
export interface AdvNode { portrait?: string; art: string; n: string; foe: string; facs: Faction[]; tier: number; noise: number; seal?: number; force?: string[]; rw: Reward; txt: string }
export const ADVENTURE: AdvNode[] = [
  { n: 'Il sentiero delle braci', art: 'brace-r2', portrait: 'avv-garra', foe: 'Garra la Tizzonaia', facs: ['brace', 'radice'], tier: 0, noise: 6, rw: { oro: 100 }, txt: 'Un mazzo rapido che punta ai Sigilli scoperti. Tieni almeno un difensore per corsia.' },
  { n: 'La baia nebbiosa', art: 'marea-c1', portrait: 'avv-pescatore', foe: 'Il Pescatore Muto', facs: ['marea', 'radice'], tier: 0, noise: 5, rw: { pack: 1 }, txt: 'Sposta e rimanda in mano le tue unità. Non affidarti a una sola corsia.' },
  { n: 'Il bosco che respira', art: 'radice-r0', portrait: 'avv-ortica', foe: 'Madre Ortica', facs: ['radice', 'vuoto'], tier: 1, noise: 4, rw: { polvere: 150, gettoni: 1 }, txt: 'Le sue unità crescono ogni turno: colpisci prima che diventino enormi.' },
  { n: 'La cripta velata', art: 'vuoto-c0', portrait: 'avv-frate', foe: 'Frate Cenere', facs: ['vuoto', 'brace'], tier: 2, noise: 3, rw: { pack: 1, oro: 100 }, txt: 'Sacrifici e ritorni dal cimitero. Ciò che uccidi potrebbe tornare.' },
  { n: 'Nyxa si desta', art: 'vuoto-l0', foe: 'Nyxa, Regina del Nulla', facs: ['vuoto', 'marea'], tier: 3, noise: 1, seal: 14, force: ['vuoto-l0', 'marea-l0'], rw: { pack: 2, polvere: 300, gettoni: 2 }, txt: 'Scontro finale. I Sigilli di Nyxa hanno 14 punti vita invece di 10.' },
];
