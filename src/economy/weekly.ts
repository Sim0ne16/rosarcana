// Sfide della settimana: tre partite a regole speciali che cambiano ogni lunedì.
import type {CustodeId, OmenId} from '../engine';

export interface WeeklyRules {
    mySeal?: number;
    opSeal?: number;
    custodi?: [CustodeId, CustodeId];
    omens?: OmenId[];
    commonsOnly?: boolean;
    startC?: number
}

export interface WeeklyChallenge {
    id: string;
    title: string;
    desc: string;
    rules: WeeklyRules
}

export const WEEKLY_WINS = 3;
export const WEEKLY_REWARD = {oro: 100, gettoni: 1};
const POOL: WeeklyChallenge[] = [
    {
        id: 'fragili',
        title: 'Sigilli fragili',
        desc: 'Tutti i Sigilli hanno solo 6 punti vita: vince chi colpisce per primo.',
        rules: {mySeal: 6, opSeal: 6}
    },
    {
        id: 'ecate',
        title: 'Notte di Ecate',
        desc: 'Entrambi i giocatori hanno Ecate dei Crocevia come Custode.',
        rules: {custodi: ['ecate', 'ecate']}
    },
    {
        id: 'comuni',
        title: 'Solo comuni',
        desc: 'Si gioca con le sole carte comuni delle fazioni del tuo mazzo.',
        rules: {commonsOnly: true}
    },
    {
        id: 'nebbia',
        title: 'Nebbia ovunque',
        desc: 'Tutte e tre le corsie hanno il presagio Nebbia: niente bersagli.',
        rules: {omens: ['nebbia', 'nebbia', 'nebbia']}
    },
    {
        id: 'cristalli',
        title: 'Tempesta di Cristalli',
        desc: 'Si parte con 5 Cristalli: le carte grandi arrivano subito.',
        rules: {startC: 5}
    },
    {
        id: 'eclissi',
        title: 'Eclissi totale',
        desc: 'Tutte le corsie hanno il presagio Eclissi: ogni colpo ai Sigilli fa 1 danno in più.',
        rules: {omens: ['eclissi', 'eclissi', 'eclissi']}
    },
    {
        id: 'fortezze',
        title: 'Fortezze',
        desc: 'Sigilli da 14 punti vita e presagio Terra consacrata ovunque: partite lunghe.',
        rules: {mySeal: 14, opSeal: 14, omens: ['consacrata', 'consacrata', 'consacrata']}
    },
    {
        id: 'luna',
        title: 'Luna piena',
        desc: 'Luna crescente su tutte le corsie: ogni turno la tua unità più debole cresce. Conta chi resiste.',
        rules: {omens: ['luna', 'luna', 'luna']}
    },
    {
        id: 'miasma',
        title: 'Aria avvelenata',
        desc: 'Miasma ovunque: le unità perdono 1 salute a ogni tuo turno. Meglio colpire in fretta.',
        rules: {omens: ['miasma', 'miasma', 'miasma']}
    },
    {
        id: 'arena',
        title: 'Giochi di sangue',
        desc: 'Arena di sangue su tutte le corsie: ogni unità che uccide e sopravvive diventa più forte.',
        rules: {omens: ['arena', 'arena', 'arena']}
    },
    {
        id: 'palude',
        title: 'Terre sommerse',
        desc: 'Palude ovunque: tutte le unità hanno -1 attacco. Vince chi trova un altro modo di colpire.',
        rules: {omens: ['palude', 'palude', 'palude']}
    },
    {
        id: 'mura',
        title: 'Mura e brecce',
        desc: 'Bastione ai lati, Eclissi al centro: la corsia centrale decide la partita.',
        rules: {omens: ['bastione', 'eclissi', 'bastione']}
    },
    {
        id: 'golia',
        title: 'Davide e Golia',
        desc: 'I Sigilli avversari hanno 16 punti vita, ma tu parti con 3 Cristalli.',
        rules: {opSeal: 16, startC: 3}
    },
    {
        id: 'traghetto',
        title: "L'ultimo traghetto",
        desc: 'Entrambi i giocatori hanno il Traghettatore come Custode: ogni prima morte del turno ferisce un Sigillo.',
        rules: {custodi: ['traghettatore', 'traghettatore']}
    },
    {
        id: 'stagioni',
        title: 'Cambio di stagione',
        desc: 'Entrambi i giocatori hanno la Madre delle Stagioni come Custode, e i Sigilli hanno 12 punti vita.',
        rules: {custodi: ['madre', 'madre'], mySeal: 12, opSeal: 12}
    },
    {
        id: 'pozzi',
        title: 'Il coro dei pozzi',
        desc: 'Pozzo dei sussurri su tutte le corsie: chi controlla una corsia pesca una carta in più.',
        rules: {omens: ['pozzo', 'pozzo', 'pozzo']}
    },
];
/** Numero della settimana (cambia il lunedì). */
export const weekIndex = (now = Date.now()) => Math.floor((now - Date.UTC(2026, 0, 5)) / 604800000);
export const weeklyChallenges = (w = weekIndex()) => [0, 1, 2].map(k => POOL[(w * 3 + k) % POOL.length]);
export const daysToReset = (now = Date.now()) => {
    const next = Date.UTC(2026, 0, 5) + (weekIndex(now) + 1) * 604800000;
    return Math.max(1, Math.ceil((next - now) / 86400000));
};
