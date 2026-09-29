// Missioni leggendarie dei Custodi: tre sfide per Custode; completate tutte, il ritratto diventa leggendario.
export interface CustProgress { games: number; wins: number; bells: number }
export const CUST_MISSIONS: { id: keyof CustProgress; goal: number; txt: (n: string) => string }[] = [
  { id: 'games', goal: 3, txt: n => `Gioca 3 partite con ${n}` },
  { id: 'bells', goal: 2, txt: n => `Fai suonare 2 volte l'Ultimo Rintocco di ${n}` },
  { id: 'wins', goal: 5, txt: n => `Vinci 5 partite con ${n}` },
];
export const CUST_REWARD = { gettoni: 2, polvere: 200 };
export const custDone = (p?: CustProgress) => !!p && CUST_MISSIONS.every(m => p[m.id] >= m.goal);
