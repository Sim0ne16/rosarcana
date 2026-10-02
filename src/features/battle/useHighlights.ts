import {BYID, findU} from '../../engine';
import {moveTargets, playOptions, useBattle} from './store';

/** Calcola quali corsie, unità e Sigilli sono bersagli validi per la selezione o il trascinamento in corso. */
export function useHighlights() {
    const G = useBattle(s => s.G), sel = useBattle(s => s.sel), dragging = useBattle(s => s.dragging);
    const lanes = new Set<number>(), units = new Set<number>(), seals = new Set<string>(),
        laneTargets = new Set<number>();
    if (!G) return {lanes, units, seals, laneTargets};
    if (sel?.kind === 'hand') {
        const c = G.p[0].hand[sel.hi];
        if (sel.step === 'lane' && c) sel.opts.forEach(o => {
            if (o.lane != null) (c.id && isRelic(c.id) ? seals.add(`0-${o.lane}`) : lanes.add(o.lane));
        });
        if (sel.step === 'target') sel.targets?.forEach(t => {
            if (t.type === 'unit') units.add(t.uid); else if (t.type === 'seal') seals.add(`${t.p}-${t.lane}`); else laneTargets.add(t.lane);
        });
        // spostamento: resta evidenziata l'unità scelta e si accendono le corsie in cui può finire
        if (sel.step === 'dest') {
            if (sel.target?.type === 'unit') units.add(sel.target.uid);
            sel.dests?.forEach(l => laneTargets.add(l));
        }
    }
    if (sel?.kind === 'unit') sel.to.forEach(l => lanes.add(l));
    if (dragging != null) {
        const hi = G.p[0].hand.findIndex(h => h.hid === dragging);
        if (hi >= 0) {
            const id = G.p[0].hand[hi].id;
            playOptions(G, 0, hi).forEach(o => {
                if (o.target) {
                    const t = o.target;
                    if (t.type === 'unit') units.add(t.uid); else if (t.type === 'seal') seals.add(`${t.p}-${t.lane}`);
                }
                if (o.lane != null) (isRelic(id) ? seals.add(`0-${o.lane}`) : lanes.add(o.lane));
            });
        } else if (findU(G, dragging)) moveTargets(G, 0, dragging).forEach(l => lanes.add(l));
    }
    return {lanes, units, seals, laneTargets};
}

const isRelic = (id: string) => BYID[id]?.t === 'R';
