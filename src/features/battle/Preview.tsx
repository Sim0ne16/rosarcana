import {AnimatePresence, motion} from 'framer-motion';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
    activeSynergies,
    ASCEND_FIGHTS,
    cardInfo,
    findU,
    type Game,
    type Keyword,
    KEYWORDS,
    LANE_NAME,
    omenAt,
    OMENS,
    synergiesOf,
    uAtk,
    uMax
} from '../../engine';
import {Card} from '../../cards/Card';
import {splitCardMentions} from '../../cards/cardText';
import {EN_KEYWORD_WORD, EN_KEYWORDS, EN_LANE_NAME, EN_OMENS, EN_SYNERGIES} from '../../i18n/en/mechanics';
import {useLang, useT} from '../../i18n/lang';
import {logTexts} from '../../i18n/log';
import {W} from '../../i18n/words';
import {cardName} from '../../i18n/names';
import {lookOf, useProfile} from '../../profile/store';
import {useBattle} from './store';
import s from './battle.module.css';

/** Anteprima al passaggio (o al tocco) su un'unità o una reliquia: compare accanto all'elemento e sparisce appena lo lasci. */
export function Preview({G}: { G: Game }) {
    const pv = useBattle(st => st.preview), profile = useProfile();
    // l'unità appena selezionata per attaccare o spostarsi non apre la sua anteprima: coprirebbe i bersagli
    const selUid = useBattle(st => (st.sel?.kind === 'unit' ? st.sel.uid : null));
    const lang = useLang();
    useEffect(() => {
        if (!pv?.rect) return;
        const off = (e: PointerEvent) => {
            const t = e.target as Element;
            if (!t.closest('[data-drop^="unit:"], [data-relic]')) useBattle.getState().setPreview(null);
        };
        window.addEventListener('pointerdown', off);
        return () => window.removeEventListener('pointerdown', off);
    }, [pv]);
    const f = pv?.uid != null ? findU(G, pv.uid) : null;
    const show = !!pv?.rect && (pv.uid == null || !!f) && (pv.uid == null || pv.uid !== selUid);
    const c = pv ? cardInfo(pv.id) : null;
    const vw = window.innerWidth, vh = window.innerHeight, narrow = vw < 700;
    const W = narrow ? Math.min(200, vw * 0.5) : 240, H = W * 1.4, total = narrow ? W : W + 240;
    let left = 0, top = 0;
    if (pv?.rect) {
        const r = pv.rect, cx = r.x + r.w / 2;
        left = narrow ? (vw - W) / 2 : cx < vw / 2 ? Math.min(r.x + r.w + 18, vw - total - 8) : Math.max(8, r.x - total - 18);
        top = narrow ? 60 : Math.min(Math.max(70, r.y + r.h / 2 - H / 2), vh - H - 16);
    }
    const kws = c ? (Object.keys(KEYWORDS) as Keyword[]).filter(k => new RegExp(`\\b${k}\\b`).test(c.tx)) : [];
    return (
        <AnimatePresence>
            {show && c && (
                <motion.div key={pv!.id + (pv!.uid ?? '')} className={s.hoverPv}
                            style={{left, top, width: total, ['--pw' as string]: `${W}px`}}
                            initial={{opacity: 0, scale: 0.92}} animate={{opacity: 1, scale: 1}}
                            exit={{opacity: 0, scale: 0.95, transition: {duration: 0.12}}}
                            transition={{duration: 0.16}}>
                    <Card card={c} cost={pv!.cost} look={f?.p === 1 ? undefined : lookOf(profile, c.id)}
                          atk={f ? uAtk(G, f.p, f.l, f.u) : undefined}
                          hp={f ? uMax(G, f.p, f.l, f.u) - f.u.dmg : undefined}/>
                    <div className={s.pvInfo}>
                        {f && (lang === 'en' ? <p>{f.p === 0 ? 'Yours' : "Opponent's"},
                            {EN_LANE_NAME[f.l]} lane.{f.u.sick ? ' Just entered play.' : ''}{f.u.stun ? ' Stunned.' : ''}
                            {f.u.asc ? ' Ascended: +2/+2.' : c.t === 'U' ? ` Ascension: ${f.u.fights ?? 0}/${ASCEND_FIGHTS} fights.` : ''}</p>
                            : <p>{f.p === 0 ? 'Tua' : 'Avversaria'},
                                corsia {LANE_NAME[f.l]}.{f.u.sick ? ' Appena entrata in gioco.' : ''}{f.u.stun ? ' Stordita.' : ''}
                                {f.u.asc ? ' Ascesa: +2/+2.' : c.t === 'U' ? ` Ascesa: ${f.u.fights ?? 0}/${ASCEND_FIGHTS} combattimenti.` : ''}</p>)}
                        {f && omenAt(G, f.l) && (lang === 'en'
                            ? <p><b>{EN_OMENS[omenAt(G, f.l)!].name}</b>: {EN_OMENS[omenAt(G, f.l)!].text}</p>
                            : <p><b>{OMENS[omenAt(G, f.l)!].name}</b>: {OMENS[omenAt(G, f.l)!].text}</p>)}
                        {synergiesOf(c.id).map(sy => {
                            const on = f ? activeSynergies(G, f.p, f.u).some(x => x.id === sy.id) : false;
                            const t = lang === 'en' ? EN_SYNERGIES[sy.id] : undefined;
                            const otherId = sy.a === c.id ? sy.b : sy.a;
                            const otherN = cardName(otherId, lang);
                            return <p key={sy.id} className={on ? s.synOn : ''}>
                                <b>{lang === 'en' ? 'Synergy' : 'Sincronia'} {t?.name ?? sy.name}{on ? (lang === 'en' ? ' (active)' : ' (attiva)') : ''}</b>:
                                {lang === 'en' ? ' with' : ' con'} {otherN}. {t?.text ?? sy.text}</p>;
                        })}
                        {kws.map(k => <p key={k}>
                            <b>{lang === 'en' ? EN_KEYWORD_WORD[k] : k}</b>: {lang === 'en' ? EN_KEYWORDS[k] : KEYWORDS[k]}
                        </p>)}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/** Registro degli eventi: aperto di default, la riga appena arrivata si illumina e lo scroll torna in cima da solo. */
export function Log({G}: { G: Game }) {
    const [flash, setFlash] = useState(false);
    const prevLen = useRef(G.log.length);
    const list = useRef<HTMLUListElement>(null);
    const lang = useLang(), t = useT();
    const fmt = useMemo(() => logTexts(G, lang), [G, lang]);
    useEffect(() => {
        if (G.log.length > prevLen.current) {
            setFlash(true);
            list.current?.scrollTo({top: 0, behavior: 'smooth'});
            const t = setTimeout(() => setFlash(false), 1200);
            prevLen.current = G.log.length;
            return () => clearTimeout(t);
        }
        prevLen.current = G.log.length;
    }, [G.log.length]);
    return <section className={s.log} aria-label={t(W.log)}>
        <h3 className={s.logHead}>{t(W.log)}{G.log.length > 0 &&
            <span className={s.logCount}>{G.log.length}</span>}</h3>
        <ul ref={list}>{[...G.log].reverse().slice(0, 50).map((l, i) => <li key={i}
                                                                            className={`${s[l.cls || 'plain']} ${i === 0 && flash ? s.logNew : ''}`}><LogText
            text={fmt(l)} lang={lang}/></li>)}</ul>
    </section>;
}

/** Riga del registro: i nomi di carte citati aprono il dettaglio al tocco, e ne mostrano l'anteprima al passaggio del mouse. */
function LogText({text, lang}: { text: string; lang: import('../../i18n/lang').Lang }) {
    const b = useBattle.getState;
    return <>{splitCardMentions(text, lang).map((p, i) => typeof p === 'string' ? p :
        <b key={i} className={s.logCard}
           onClick={e => {
               e.stopPropagation();
               b().inspect({id: p.id, p: 0});
           }}
           onMouseEnter={e => {
               const r = e.currentTarget.getBoundingClientRect();
               b().setPreview({id: p.id, rect: {x: r.left, y: r.top, w: r.width, h: r.height}});
           }}
           onMouseLeave={() => b().setPreview(null)}>{p.n}</b>)}</>;
}
