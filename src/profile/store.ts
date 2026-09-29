// Profilo del giocatore: collezione, valute, mazzi, progressi. Salvato nel browser.
// In un gioco online queste operazioni diventano chiamate al server.
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {BY_RARITY, BYID, CARDS, RARITY, SET} from '../engine/cards';
import type {Faction} from '../engine/types';
import {
    BACK_PRICE,
    BACKS,
    FIRST_WIN_ORO,
    LOSS_ORO,
    PACK_GEMME,
    PACK_ORO,
    packPrice,
    PASS_FREE,
    PASS_GEMME,
    PASS_PREM,
    QUEST_POOL,
    type QuestEvent,
    type Reward,
    rewardLabel,
    WIN_ORO,
    XP_LVL
} from '../economy/constants';
import {ARCHETYPES, autoDeck, countMap, type Deck, starterDecks, starterOwned} from '../economy/decks';
import {openPack, type PackCard} from '../economy/packs';
import {
    ART_STYLES,
    type ArtStyle,
    type CardLook,
    CRAFT_FRAMES,
    defaultArt,
    type EffectId,
    type FrameId,
    FRAMES,
    freeStyles,
    FX,
    FX_BY_MASTERY,
    MASTERY_FRAMES,
    RETIRED_FRAMES
} from '../cards/styles';
import {CUST_REWARD, custDone, type CustProgress} from '../economy/custodeMissions';
import {weekIndex, WEEKLY_REWARD, WEEKLY_WINS} from '../economy/weekly';
import {
    type CardMastery,
    challengesFor,
    emptyMastery,
    levelName,
    levelOf,
    type MatchStats,
    matchXp
} from '../economy/mastery';

export interface Quest {
    id: string;
    prog: number;
    claimed: boolean
}

/** Una partita conclusa, per lo storico. */
export interface MatchRecord {
    t: number;
    mode: string;
    label: string;
    foe: string;
    win: boolean;
    turns: number;
    deck: string;
    custode?: string | null;
    facs: string[]
}

/** Cornici del profilo: quelle di maestria si sbloccano quando una tua carta raggiunge quel grado. */
export const profileFrames = (p: Profile) => {
    const top = Math.max(0, ...Object.values(p.mastery || {}).map(m => levelOf(m.xp)));
    return {mastery: MASTERY_FRAMES.filter((_, i) => top > i) as string[], owned: p.pframes || []};
};
/** Opzioni di accessibilità e comfort. */
export type FontSet = 'classico' | 'leggibile' | 'elegante';

export interface Settings {
    textScale: number;
    reduceMotion: boolean;
    highContrast: boolean;
    volume: number;
    font: FontSet;
    noTimer: boolean
}

export const DEFAULT_SETTINGS: Settings = {
    textScale: 1,
    reduceMotion: false,
    highContrast: false,
    volume: 0.8,
    font: 'classico',
    noTimer: false
};
/** Tre coppie di caratteri: titoli e testo. */
export const FONT_SETS: { id: FontSet; name: string; display: string; body: string }[] = [
    {
        id: 'classico',
        name: 'Gotico',
        display: '"Grenze Gotisch", Georgia, serif',
        body: '"Alegreya Sans", "Trebuchet MS", system-ui, sans-serif'
    },
    {
        id: 'leggibile',
        name: 'Leggibile',
        display: '"Atkinson Hyperlegible", Verdana, sans-serif',
        body: '"Atkinson Hyperlegible", Verdana, system-ui, sans-serif'
    },
    {id: 'elegante', name: 'Elegante', display: '"Cinzel", Georgia, serif', body: '"EB Garamond", Georgia, serif'},
];

export interface Profile {
    v: 3;
    oro: number;
    polvere: number;
    gemme: number;
    gettoni: number;
    packs: number;
    owned: Record<string, number>;
    foil: Record<string, boolean>;
    styles: Record<string, ArtStyle[]>;
    look: Record<string, CardLook>;
    effects: Record<string, EffectId[]>;
    frames: Record<string, FrameId[]>;
    bestTier: number;
    mastery: Record<string, CardMastery>;
    lessons: string[];
    onboardSkip: boolean;
    custProg: Record<string, CustProgress>;
    custLeg: string[];
    settings: Settings;
    weekly: { week: number; wins: Record<string, number>; claimed: string[] };
    avatar: string;
    pframe: string | null;
    pframes: string[];
    backMode: 'global' | 'deck';
    history: MatchRecord[];
    facStats: Record<string, { games: number; wins: number }>;
    pity: number;
    opened: number;
    everLeg: boolean;
    xp: number;
    premium: boolean;
    cf: number[];
    cp: number[];
    backs: string[];
    back: string;
    day: number;
    lastWinDay: number;
    quests: Quest[];
    games: number;
    wins: number;
    sound: boolean;
    decks: Deck[];
    activeDeck: string;
    rank: number;
    adv: number[];
    tutorialDone: boolean;
    log: { t: number; txt: string }[];
}

function newQuests(): Quest[] {
    const pool = [...QUEST_POOL].sort(() => Math.random() - 0.5), out: Quest[] = [], evs = new Set<string>();
    for (const q of pool) if (out.length < 3 && !evs.has(q.ev)) {
        out.push({id: q.id, prog: 0, claimed: false});
        evs.add(q.ev);
    }
    return out;
}

export function freshProfile(): Profile {
    const owned = starterOwned();
    return {
        v: 3,
        oro: 300,
        polvere: 0,
        gemme: 50,
        gettoni: 1,
        packs: 3,
        owned,
        foil: {},
        styles: {},
        look: {},
        effects: {},
        frames: {},
        bestTier: 0,
        mastery: {},
        lessons: [],
        onboardSkip: false,
        custProg: {},
        custLeg: [],
        settings: {...DEFAULT_SETTINGS},
        weekly: {week: weekIndex(), wins: {}, claimed: []},
        facStats: {},
        avatar: 'vesta',
        pframe: null,
        pframes: [],
        backMode: 'global',
        history: [],
        pity: 0,
        opened: 0,
        everLeg: false,
        xp: 0,
        premium: false,
        cf: [],
        cp: [],
        backs: ['cera'],
        back: 'cera',
        day: 1,
        lastWinDay: 0,
        quests: newQuests(),
        games: 0,
        wins: 0,
        sound: true,
        decks: starterDecks(owned),
        activeDeck: 'p-fiamma-radice',
        rank: 0,
        adv: [],
        tutorialDone: false,
        log: [{
            t: Date.now(),
            txt: 'Benvenuto: collezione iniziale, due mazzi pronti, 300 oro, 50 gemme, 3 bustine e un gettone stile'
        }]
    };
}

export const tierIdx = (rank: number) => Math.min(5, Math.floor(rank / 100));

interface Actions {
    logT: (txt: string) => void;
    grant: (rw: Reward, src: string) => string;
    bump: (ev: QuestEvent, n?: number) => void;
    openPack: () => PackCard[] | null;
    buy: (k: 'gem') => void;
    buyPacks: (cur: 'oro' | 'gemme', n: number) => boolean;
    craft: (id: string) => boolean;
    disenchant: (id: string) => boolean;
    unlockStyle: (id: string, s: ArtStyle, useToken: boolean) => boolean;
    unlockEffect: (id: string, fx: EffectId, useToken: boolean) => boolean;
    unlockFrame: (id: string, f: FrameId) => boolean;
    setLook: (id: string, look: Partial<CardLook>) => void;
    claimQuest: (i: number) => void;
    claimPass: (L: number, prem: boolean) => 'legChoice' | void;
    claimAllPass: () => boolean;
    pickLegendary: (id: string) => void;
    buyPremium: () => void;
    setBack: (k: string) => void;
    buyBack: (k: string) => boolean;
    deck: {
        create: () => string;
        addPreset: (id: string) => string | void;
        update: (id: string, d: Partial<Deck>) => void;
        remove: (id: string) => void;
        setActive: (id: string) => void;
        toggleFaction: (id: string, f: Faction) => string | void;
        add: (id: string, card: string) => string | void;
        removeCard: (id: string, card: string) => void;
        fill: (id: string) => void;
    };
    matchResult: (r: {
        mode: 'ranked' | 'casual' | 'adv' | 'tutorial' | 'other';
        win: boolean;
        noReward?: boolean;
        node?: number;
        foe: string;
        advReward?: Reward;
        advName?: string;
        stats?: MatchStats
    }) => string[];
    dev: (k: 'oro' | 'polvere' | 'xp' | 'rank' | 'maestria' | 'day' | 'sound' | 'reset' | 'unlock' | 'allcards') => void;
    lessonDone: (id: string, reward: Reward) => string[];
    recordCustode: (id: string, name: string, win: boolean, bells: number) => string[];
    skipOnboarding: () => void;
    setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
    weeklyWin: (id: string) => void;
    setAvatar: (id: string) => void;
    setPFrame: (f: string | null) => void;
    buyPFrame: (f: string) => boolean;
    setBackMode: (m: 'global' | 'deck') => void;
    addHistory: (r: MatchRecord) => void;
    weeklyClaim: (id: string) => string | null;
    recordFactions: (facs: string[], win: boolean) => void;
}

export type ProfileStore = Profile & Actions;

export const useProfile = create<ProfileStore>()(persist((set, get) => {
    const patch = (fn: (s: Profile) => void) => set(s => {
        const d = structuredClone(stripActions(s));
        fn(d);
        return d;
    });

    /** Aggiorna la maestria delle carte giocate; restituisce le righe da mostrare a fine partita. */
    function recordMastery(stats: MatchStats, win: boolean): string[] {
        const lines: string[] = [];
        patch(d => {
            for (const [id, st] of Object.entries(stats)) {
                if (!BYID[id]) continue;
                const m = d.mastery[id] = {...emptyMastery(), ...d.mastery[id]}, before = levelOf(m.xp);
                m.plays += st.plays;
                m.seal += st.seal;
                m.kills += st.kills;
                m.relic += st.relic;
                if (st.plays) {
                    m.games++;
                    if (win) m.wins++;
                }
                m.xp += matchXp(st, win);
                for (const ch of challengesFor(id)) if (!m.done.includes(ch.id) && m[ch.stat] >= ch.goal) {
                    m.done.push(ch.id);
                    m.xp += ch.xp;
                    d.polvere += ch.polvere;
                    lines.push(`Sfida completata con ${BYID[id].n}: ${ch.txt.toLowerCase()} (+${ch.polvere} polvere)`);
                }
                const after = levelOf(m.xp);
                if (after > before) lines.push(`${BYID[id].n} sale a maestria ${levelName(after)}: nuova cornice sbloccata`);
            }
        });
        return lines;
    }

    return {
        ...freshProfile(),
        logT: txt => patch(s => {
            s.log.unshift({t: Date.now(), txt});
            s.log = s.log.slice(0, 60);
        }),
        grant: (rw, src) => {
            const label = rewardLabel(rw);
            patch(s => applyReward(s, rw));
            if (label) get().logT(`${src}: ${label}`);
            return label;
        },
        bump: (ev, n = 1) => patch(s => s.quests.forEach(q => {
            const d = QUEST_POOL.find(x => x.id === q.id);
            if (d && d.ev === ev && !q.claimed) q.prog = Math.min(d.goal, q.prog + n);
        })),
        openPack: () => {
            if (get().packs <= 0) return null;
            let res: PackCard[] = [];
            patch(d => {
                d.packs--;
                res = openPack(d);
                // le carte dorate delle bustine portano effetto Olografico e cornice Dorata
                res.filter(x => x.foil).forEach(x => {
                    addTo(d.effects, x.id, 'luce');
                    if (!d.look[x.id]?.effect && !d.look[x.id]?.frame) d.look[x.id] = {
                        art: d.look[x.id]?.art ?? defaultArt(x.id),
                        effect: 'luce',
                        frame: null
                    };
                });
            });
            get().bump('open');
            const leg = res.filter(x => x.rar === 'l').map(x => BYID[x.id].n),
                foil = res.filter(x => x.foil).map(x => BYID[x.id].n);
            get().logT(`Aperta una bustina ${SET.name}${leg.length ? `: Leggendaria ${leg.join(', ')}` : ''}${foil.length ? `, dorata: ${foil.join(', ')}` : ''}`);
            return res;
        },
        buyPacks: (cur, n) => {
            const s = get(), price = packPrice(cur === 'oro' ? PACK_ORO : PACK_GEMME, n);
            if (s[cur] < price) return false;
            patch(d => {
                d[cur] -= price;
                d.packs += n;
            });
            s.logT(`Acquistat${n === 1 ? 'a 1 bustina' : `e ${n} bustine`} (-${price} ${cur})`);
            return true;
        },
        buy: k => {
            const s = get();
            if (k === 'gem') {
                patch(d => {
                    d.gemme += 1000;
                });
                s.logT('Acquisto di prova: +1000 gemme (nessun pagamento reale)');
            }
        },
        craft: id => {
            const c = BYID[id], R = RARITY[c.r], s = get();
            if ((s.owned[id] || 0) >= R.max || s.polvere < R.craft) return false;
            patch(d => {
                d.polvere -= R.craft;
                d.owned[id] = (d.owned[id] || 0) + 1;
            });
            s.bump('craft');
            s.logT(`Creata ${c.n} (-${R.craft} polvere)`);
            return true;
        },
        disenchant: id => {
            const c = BYID[id], R = RARITY[c.r], s = get();
            if (!s.owned[id]) return false;
            patch(d => {
                d.owned[id]--;
                d.polvere += R.dis;
            });
            s.bump('craft');
            s.logT(`Disfatta ${c.n} (+${R.dis} polvere)`);
            return true;
        },
        unlockStyle: (id, st, useToken) => {
            const s = get(), cost = ART_STYLES[st].cost;
            if ((s.styles[id] || []).includes(st)) return true;
            if (useToken ? s.gettoni < 1 : s.polvere < cost) return false;
            patch(d => {
                if (useToken) d.gettoni--; else d.polvere -= cost;
                d.styles[id] = [...(d.styles[id] || []), st];
                d.look[id] = {...lookOf(d, id), art: st};
            });
            s.logT(`Stile ${ART_STYLES[st].name} per ${BYID[id].n} (${useToken ? '1 gettone' : `-${cost} polvere`})`);
            return true;
        },
        unlockEffect: (id, fx, useToken) => {
            const s = get(), cost = FX[fx].cost(BYID[id].r);
            if ((s.effects[id] || []).includes(fx)) return true;
            if (useToken ? s.gettoni < 1 : s.polvere < cost) return false;
            patch(d => {
                if (useToken) d.gettoni--; else d.polvere -= cost;
                addTo(d.effects, id, fx);
                d.look[id] = {...lookOf(d, id), effect: fx};
            });
            s.logT(`Effetto ${FX[fx].name} per ${BYID[id].n} (${useToken ? '1 gettone' : `-${cost} polvere`})`);
            return true;
        },
        unlockFrame: (id, f) => {
            const s = get(), cost = FRAMES[f].cost;
            if (cost == null || (s.frames[id] || []).includes(f)) return cost != null;
            if (s.polvere < cost) return false;
            patch(d => {
                d.polvere -= cost;
                addTo(d.frames, id, f);
                d.look[id] = {...lookOf(d, id), frame: f};
            });
            s.logT(`Cornice ${FRAMES[f].name} per ${BYID[id].n} (-${cost} polvere)`);
            return true;
        },
        setLook: (id, look) => patch(d => {
            d.look[id] = {...lookOf(d, id), ...look};
        }),
        claimQuest: i => {
            const s = get(), q = s.quests[i], d = QUEST_POOL.find(x => x.id === q?.id);
            if (!q || !d || q.claimed || q.prog < d.goal) return;
            patch(x => {
                x.quests[i].claimed = true;
            });
            s.grant({oro: d.oro}, `Missione "${d.txt}"`);
        },
        claimPass: (L, prem) => {
            const s = get();
            if (prem) {
                if (!s.premium || s.cp.includes(L)) return;
                patch(d => {
                    d.cp.push(L);
                });
                s.grant(PASS_PREM[L - 1], `Pass premium livello ${L}`);
                return;
            }
            if (s.cf.includes(L)) return;
            patch(d => {
                d.cf.push(L);
            });
            const rw = PASS_FREE[L - 1];
            if (rw.legChoice) return 'legChoice';
            s.grant(rw, `Pass livello ${L}`);
        },
        claimAllPass: () => {
            const s = get(), lvl = Math.min(20, Math.floor(s.xp / XP_LVL));
            let leg = false;
            for (let L = 1; L <= lvl; L++) {
                if (get().claimPass(L, false) === 'legChoice') leg = true;
                if (s.premium) get().claimPass(L, true);
            }
            return leg;
        },
        pickLegendary: id => {
            if (!id) {
                get().grant({polvere: 1600}, 'Pass livello 20');
                return;
            }
            patch(d => {
                d.owned[id] = 1;
            });
            get().logT(`Pass livello 20: scelta ${BYID[id].n}`);
        },
        buyPremium: () => {
            const s = get();
            if (s.premium || s.gemme < PASS_GEMME) return;
            patch(d => {
                d.gemme -= PASS_GEMME;
                d.premium = true;
            });
            s.logT(`Pass premium sbloccato (-${PASS_GEMME} gemme)`);
        },
        setBack: k => patch(d => {
            if (d.backs.includes(k)) d.back = k;
        }),
        buyBack: k => {
            const s = get();
            if (s.backs.includes(k) || s.oro < BACK_PRICE) return false;
            patch(d => {
                d.oro -= BACK_PRICE;
                d.backs.push(k);
                d.back = k;
            });
            s.logT(`Dorso ${BACKS[k]} acquistato (-${BACK_PRICE} oro)`);
            return true;
        },
        deck: {
            addPreset: pid => {
                const pr = [...starterDecks(), ...ARCHETYPES.map(({
                                                                      blurb: _b,
                                                                      archetype: _a,
                                                                      ...d
                                                                  }) => d)].find(d => d.id === pid);
                if (!pr) return;
                if (get().decks.length >= 8) return 'Hai già 8 mazzi: eliminane uno prima';
                const id = get().decks.some(d => d.id === pid) ? `${pid}-${Date.now().toString(36)}` : pid;
                patch(d => {
                    d.decks.push({...pr, id});
                });
            },
            create: () => {
                const id = 'd' + Date.now();
                patch(d => {
                    d.decks.push({id, name: 'Nuovo mazzo', fac: [], cards: []});
                });
                return id;
            },
            update: (id, x) => patch(d => {
                const k = d.decks.find(k => k.id === id);
                if (k) Object.assign(k, x);
            }),
            remove: id => patch(d => {
                d.decks = d.decks.filter(k => k.id !== id);
                if (d.activeDeck === id) d.activeDeck = d.decks[0]?.id;
            }),
            setActive: id => patch(d => {
                d.activeDeck = id;
            }),
            toggleFaction: (id, f) => {
                let msg: string | void = undefined;
                patch(d => {
                    const k = d.decks.find(k => k.id === id);
                    if (!k) return;
                    if (k.fac.includes(f)) {
                        k.fac = k.fac.filter(x => x !== f);
                        k.cards = k.cards.filter(c => BYID[c].f !== f);
                    } else if (k.fac.length < 2) k.fac.push(f); else msg = 'Al massimo due fazioni: togline una prima';
                });
                return msg;
            },
            add: (id, card) => {
                let msg: string | void = undefined;
                patch(d => {
                    const k = d.decks.find(k => k.id === id);
                    if (!k) return;
                    const c = BYID[card], n = countMap(k.cards)[card] || 0,
                        lim = Math.min(d.owned[card] || 0, RARITY[c.r].max);
                    if (k.cards.length >= 30) {
                        msg = 'Il mazzo ha già 30 carte';
                        return;
                    }
                    if (n >= lim) {
                        msg = lim < RARITY[c.r].max ? 'Non possiedi altre copie: puoi crearle dalla Collezione' : 'Hai già il massimo di copie';
                        return;
                    }
                    if (!k.fac.includes(c.f)) {
                        if (k.fac.length >= 2) {
                            msg = 'Questa carta è di una terza fazione';
                            return;
                        }
                        k.fac.push(c.f);
                    }
                    k.cards.push(card);
                });
                return msg;
            },
            removeCard: (id, card) => patch(d => {
                const k = d.decks.find(k => k.id === id);
                if (!k) return;
                const i = k.cards.indexOf(card);
                if (i >= 0) k.cards.splice(i, 1);
            }),
            fill: id => patch(d => {
                const k = d.decks.find(k => k.id === id);
                if (k) k.cards = autoDeck(k.fac, d.owned, k.cards);
            }),
        },
        matchResult: r => {
            if (r.noReward) {
                // partita troppo breve: conta come giocata, niente ricompense; in classificata la sconfitta toglie comunque punti
                patch(d => {
                    d.games++;
                    if (r.win) d.wins++;
                    if (r.mode === 'ranked' && !r.win) d.rank = Math.max(0, d.rank - 15);
                });
                return r.mode === 'ranked' && !r.win ? ['-15 punti classifica'] : [];
            }
            const s = get(), lines: string[] = [];
            patch(d => {
                d.games++;
                if (r.win) d.wins++;
            });
            s.bump('play');
            if (r.win) s.bump('win');
            if (r.mode === 'ranked') {
                let oro = r.win ? WIN_ORO : LOSS_ORO;
                const xp = r.win ? 120 : 70, before = tierIdx(s.rank);
                if (r.win && s.lastWinDay !== s.day) {
                    oro += FIRST_WIN_ORO;
                    lines.push('Bonus prima vittoria del giorno incluso');
                }
                patch(d => {
                    if (r.win) d.lastWinDay = d.day;
                    d.rank = Math.max(0, d.rank + (r.win ? 25 : -15));
                    d.oro += oro;
                    d.xp += xp;
                });
                lines.unshift(`+${oro} oro, +${xp} XP pass`);
                lines.push(`${r.win ? '+25' : '-15'} punti classificata`);
                if (tierIdx(get().rank) > before) lines.push('Promozione di grado!');
                s.logT(`Classificata ${r.win ? 'vinta' : 'persa'} contro ${r.foe}: +${oro} oro, +${xp} XP`);
            } else if (r.mode === 'other') {
                const xp = r.win ? 80 : 50;
                patch(d => {
                    d.xp += xp;
                });
                lines.push(`+${xp} XP pass`);
            } else if (r.mode === 'casual') {
                const oro = r.win ? 10 : 3, xp = r.win ? 90 : 50;
                patch(d => {
                    d.oro += oro;
                    d.xp += xp;
                });
                lines.push(`+${oro} oro, +${xp} XP pass`);
                s.logT(`Casual ${r.win ? 'vinta' : 'persa'} contro ${r.foe}: +${oro} oro`);
            } else if (r.mode === 'adv') {
                const xp = r.win ? 80 : 50;
                patch(d => {
                    d.xp += xp;
                });
                lines.push(`+${xp} XP pass`);
                if (r.win && r.node != null) {
                    if (!s.adv.includes(r.node)) {
                        patch(d => {
                            d.adv.push(r.node!);
                        });
                        lines.push('Prima vittoria: ' + s.grant(r.advReward || {}, `Avventura, ${r.advName}`));
                    } else {
                        patch(d => {
                            d.oro += 20;
                        });
                        lines.push('+20 oro');
                    }
                }
            } else if (r.win && !s.tutorialDone) {
                patch(d => {
                    d.tutorialDone = true;
                });
                lines.push('Tutorial completato: ' + s.grant({oro: 100, pack: 1, gettoni: 1}, 'Tutorial'));
            } else if (!r.win) lines.push('Puoi ripetere il tutorial quando vuoi.');
            if (r.stats) lines.push(...recordMastery(r.stats, r.win));
            return lines;
        },
        lessonDone: (id, rw) => {
            const s = get();
            if (s.lessons.includes(id)) return ['Prova già completata: nessuna nuova ricompensa.'];
            patch(d => {
                d.lessons.push(id);
            });
            return ['Prova superata: ' + s.grant(rw, 'Prove della Rosa')];
        },
        recordCustode: (id, name, win, bells) => {
            const lines: string[] = [];
            patch(d => {
                const pr = d.custProg[id] = Object.assign({games: 0, wins: 0, bells: 0}, d.custProg[id]);
                pr.games++;
                if (win) pr.wins++;
                pr.bells += bells;
            });
            const s = get();
            if (!s.custLeg.includes(id) && custDone(s.custProg[id])) {
                patch(d => {
                    d.custLeg.push(id);
                });
                lines.push(`${name} è ora un Custode leggendario: ` + s.grant(CUST_REWARD, `Missioni di ${name}`));
            }
            return lines;
        },
        skipOnboarding: () => patch(d => {
            d.onboardSkip = true;
        }),
        setAvatar: id => patch(d => {
            d.avatar = id;
        }),
        setPFrame: f => patch(d => {
            d.pframe = f;
        }),
        buyPFrame: f => {
            const s = get(), cost = FRAMES[f as FrameId]?.cost;
            if (cost == null || s.pframes.includes(f) || s.polvere < cost) return false;
            patch(d => {
                d.polvere -= cost;
                d.pframes.push(f);
                d.pframe = f;
            });
            s.logT(`Cornice del profilo ${FRAMES[f as FrameId].name} (-${cost} polvere)`);
            return true;
        },
        setBackMode: m => patch(d => {
            d.backMode = m;
        }),
        addHistory: r => patch(d => {
            d.history = [r, ...(d.history || [])].slice(0, 50);
        }),
        weeklyWin: id => patch(d => {
            if (d.weekly?.week !== weekIndex()) d.weekly = {week: weekIndex(), wins: {}, claimed: []};
            d.weekly.wins[id] = (d.weekly.wins[id] || 0) + 1;
        }),
        weeklyClaim: id => {
            const s = get();
            if (s.weekly.week !== weekIndex() || (s.weekly.wins[id] || 0) < WEEKLY_WINS || s.weekly.claimed.includes(id)) return null;
            patch(d => {
                d.weekly.claimed.push(id);
            });
            return s.grant(WEEKLY_REWARD, 'Sfida della settimana');
        },
        recordFactions: (facs, win) => patch(d => {
            for (const f of facs) {
                const r = d.facStats[f] = Object.assign({games: 0, wins: 0}, d.facStats[f]);
                r.games++;
                if (win) r.wins++;
            }
        }),
        setSetting: (k, v) => patch(d => {
            d.settings = {...DEFAULT_SETTINGS, ...d.settings, [k]: v};
        }),
        dev: k => {
            if (k === 'reset') {
                set({...freshProfile()});
                return;
            }
            patch(d => {
                if (k === 'oro') d.oro += 1000;
                if (k === 'polvere') d.polvere += 2000;
                if (k === 'xp') d.xp += 1500;
                if (k === 'rank') d.rank += 100;
                if (k === 'allcards') {
                    for (const c of CARDS) d.owned[c.id] = Math.max(d.owned[c.id] || 0, RARITY[c.r].max);
                }
                if (k === 'unlock') {
                    d.onboardSkip = true;
                    d.tutorialDone = true;
                    d.games = Math.max(d.games, 5);
                }
                if (k === 'maestria') for (const id of Object.keys(d.owned)) {
                    const m = d.mastery[id] = {...emptyMastery(), ...d.mastery[id]};
                    m.xp += 300;
                }
                if (k === 'day') {
                    d.day++;
                    d.quests = newQuests();
                }
                if (k === 'sound') d.sound = !d.sound;
            });
        },
    };
}, {
    name: 'sigilli-profile-v3', version: 11, partialize: s => stripActions(s),
    // salvataggi precedenti: la vecchia "finitura dorata" diventa effetto Olografico + cornice Dorata
    migrate: (old, v) => {
        const o = old as Profile & { look: Record<string, { art: ArtStyle; foil?: boolean }> };
        if (v < 4) {
            o.effects = o.effects || {};
            o.frames = o.frames || {};
            o.bestTier = tierIdx(o.rank || 0);
            for (const id in o.foil || {}) if (o.foil[id]) {
                addTo(o.effects, id, 'olografico');
                addTo(o.frames, id, 'oro' as FrameId);
            }
            for (const id in o.look || {}) {
                const l = o.look[id];
                o.look[id] = {
                    art: l.art,
                    effect: l.foil ? 'olografico' : null,
                    frame: l.foil ? ('oro' as FrameId) : null
                } as CardLook;
            }
        }
        if (v < 5) {
            o.mastery = o.mastery || {};
            for (const id in o.look || {}) {
                const l = o.look[id] as CardLook;
                if (l.frame && !FRAMES[l.frame]) l.frame = null;
            }
        }
        o.settings = {...DEFAULT_SETTINGS, ...o.settings};
        o.avatar ??= 'vesta';
        o.pframe ??= null;
        o.pframes ??= [];
        o.backMode ??= 'global';
        o.history ??= [];
        o.weekly ??= {week: weekIndex(), wins: {}, claimed: []};
        o.facStats ??= {};
        if (v < 11) {
            // effetti ritirati: l'olografico diventa Luce radente, gli altri vengono rimborsati in polvere
            const RET: Record<string, number> = {
                aurora: 250,
                scintille: 350,
                acquaforte: 300,
                galassia: 400,
                prismatico: 400,
                rune: 450
            };
            let refund = 0;
            for (const id in o.effects || {}) {
                const next: EffectId[] = [];
                for (const e of o.effects[id] as string[]) {
                    if (e === 'olografico') next.push('luce'); else if (e in RET) refund += RET[e]; else if (e in FX) next.push(e as EffectId);
                }
                o.effects[id] = [...new Set(next)];
            }
            for (const id in o.look || {}) {
                const l = o.look[id] as unknown as { effect: string | null; art: string };
                if (l.effect === 'olografico') l.effect = 'luce'; else if (l.effect && !(l.effect in FX)) l.effect = null;
                if (l.art === 'senzabordi') l.art = 'illustrata';
            }
            o.polvere = (o.polvere || 0) + refund;
        }
        if (v >= 9 && v < 10) {
            let refund = 0;
            const gone = ['maree', 'rovi', 'nebbia', 'brina'];
            for (const id in o.frames || {}) {
                const list = o.frames[id] as string[];
                refund += list.filter(f => gone.includes(f)).reduce((a, f) => a + RETIRED_FRAMES[f], 0);
                o.frames[id] = list.filter(f => !gone.includes(f)) as FrameId[];
            }
            for (const id in o.look || {}) {
                const l = o.look[id] as unknown as { frame: string | null };
                if (l.frame && gone.includes(l.frame)) l.frame = null;
            }
            o.polvere = (o.polvere || 0) + refund;
        }
        if (v >= 8 && v < 9) {
            let refund = 0;
            for (const id in o.frames || {}) {
                const list = o.frames[id] as string[];
                refund += list.filter(f => f === 'fiamme' || f === 'aurea').reduce((a, f) => a + RETIRED_FRAMES[f], 0);
                o.frames[id] = list.filter(f => f !== 'fiamme' && f !== 'aurea') as FrameId[];
            }
            for (const id in o.look || {}) {
                const l = o.look[id] as unknown as { frame: string | null };
                if (l.frame === 'fiamme' || l.frame === 'aurea') l.frame = null;
            }
            o.polvere = (o.polvere || 0) + refund;
        }
        if (v < 8) {
            // cornici ritirate: rimborso in polvere; la vecchia Dorata delle bustine diventa Miniatura d'oro
            let refund = 0;
            for (const id in o.frames || {}) {
                const list = o.frames[id] as string[], keep: FrameId[] = [];
                for (const f of list) {
                    if (f === 'oro') refund += RETIRED_FRAMES.oro; else if (f in RETIRED_FRAMES) refund += RETIRED_FRAMES[f]; else keep.push(f as FrameId);
                }
                o.frames[id] = keep;
            }
            for (const id in o.look || {}) {
                const l = o.look[id] as unknown as { frame: string | null };
                if (l.frame && l.frame in RETIRED_FRAMES) l.frame = null;
            }
            o.polvere = (o.polvere || 0) + refund;
        }
        if (v < 7) {
            o.lessons ??= [];
            o.custProg ??= {};
            o.custLeg ??= [];
            o.onboardSkip ??= !!o.tutorialDone;
        }
        if (v < 6) {
            o.decks = o.decks || [];
            for (const pr of starterDecks()) if (!o.decks.some(d => d.id === pr.id) && o.decks.length < 8) o.decks.push(pr);
        }
        return o as unknown as ProfileStore;
    },
}));

function applyReward(s: Profile, rw: Reward) {
    if (rw.oro) s.oro += rw.oro;
    if (rw.polvere) s.polvere += rw.polvere;
    if (rw.gemme) s.gemme += rw.gemme;
    if (rw.pack) s.packs += rw.pack;
    if (rw.gettoni) s.gettoni += rw.gettoni;
    if (rw.back && !s.backs.includes(rw.back)) s.backs.push(rw.back);
}

function stripActions(s: ProfileStore | Profile): Profile {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(s)) if (typeof v !== 'function' && k !== 'deck') o[k] = v;
    return o as unknown as Profile;
}

function addTo<T>(m: Record<string, T[]>, id: string, v: T) {
    const a = m[id] || [];
    if (!a.includes(v)) m[id] = [...a, v];
}

/** Effetti di una carta: quelli sbloccati più quelli regalati dalla maestria. */
export const effectsOf = (p: Profile, id: string): EffectId[] => {
    const lvl = levelOf(masteryOf(p, id).xp);
    return [...new Set([...(p.effects?.[id] || []), ...(Object.entries(FX_BY_MASTERY) as [EffectId, number][]).filter(([, l]) => lvl >= l).map(([e]) => e)])];
};
export const masteryOf = (p: Profile, id: string): CardMastery => ({...emptyMastery(), ...p.mastery?.[id]});
export const framesOf = (p: Profile, id: string): FrameId[] => [...(p.frames?.[id] || []).filter(f => CRAFT_FRAMES.includes(f)), ...MASTERY_FRAMES.slice(0, levelOf(masteryOf(p, id).xp))];
export const lookOf = (p: Profile, id: string): CardLook => {
    const l = p.look[id], owned: ArtStyle[] = [...freeStyles(id), ...(p.styles[id] || [])];
    return {
        art: l && owned.includes(l.art) && l.art in ART_STYLES ? l.art : defaultArt(id),
        effect: l?.effect && l.effect in FX && effectsOf(p, id).includes(l.effect) ? l.effect : null,
        frame: l?.frame && framesOf(p, id).includes(l.frame) ? l.frame : null,
    };
};
export const legendaryChoices = (p: Profile) => BY_RARITY.l.filter(c => !p.owned[c.id]);
export {BACKS};
