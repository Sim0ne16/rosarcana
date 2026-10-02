import {AnimatePresence, motion, useMotionValue, useSpring} from 'framer-motion';
import {useEffect, useRef} from 'react';
import {
    ASCEND_FIGHTS,
    cardInfo,
    FACTIONS,
    findU,
    type Game,
    LANE_NAME,
    omenAt,
    OMENS,
    RARITY,
    uAtk,
    uMax
} from '../../engine';
import {Card} from '../../cards/Card';
import {FACTION_GLYPH, Glyph, HEART, RarityGem, SWORD} from '../../cards/glyphs';
import {loreOf} from '../../cards/lore';
import {EN_CARDS} from '../../i18n/en/cards';
import {EN_LANE_NAME, EN_OMENS} from '../../i18n/en/mechanics';
import {EN_LORE} from '../../i18n/en/lore';
import {useLang, useT} from '../../i18n/lang';
import {factionName, rarityName, typeName} from '../../i18n/names';
import {lookOf, useProfile} from '../../profile/store';
import {TooltipHost} from '../../ui/Tooltip';
import {useBattle} from './store';
import s from './battle.module.css';

/** Pulsante lente: attiva la modalità dettaglio (anche con il tasto L). */
export function LensButton() {
    const lens = useBattle(st => st.lens);
    const t = useT();
    const b = useBattle.getState;
    useEffect(() => {
        const k = (e: KeyboardEvent) => {
            if ((e.key === 'l' || e.key === 'L') && !(e.target as HTMLElement).closest('input,textarea')) b().toggleLens();
        };
        window.addEventListener('keydown', k);
        return () => window.removeEventListener('keydown', k);
    }, [b]);
    return (
        <button data-sfx="none" className={`${s.lens} ${lens ? s.lensOn : ''}`} onClick={() => b().toggleLens()}
                aria-pressed={lens}
                title={t('Lente: tocca una carta per vederla in dettaglio (tasto L, o clic destro su una carta)', 'Loupe: tap a card to see it in detail (key L, or right-click a card)')}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.4"/>
                <path d="m15 15 6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                <path d="M10 7v6M7 10h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span>{lens ? t('Lente attiva', 'Loupe active') : t('Lente', 'Loupe')}</span>
        </button>
    );
}

const TILT_MAX = 14; // gradi massimi di inclinazione
const TILT_SENS = 8; // px di trascinamento per grado

/** Inclina la carta seguendo il trascinamento del puntatore, senza mai spostarla dal suo posto: al rilascio torna piatta. */
function TiltCard({children}: { children: React.ReactNode }) {
    const rx = useMotionValue(0), ry = useMotionValue(0);
    const srx = useSpring(rx, {stiffness: 300, damping: 22}), sry = useSpring(ry, {stiffness: 300, damping: 22});
    const start = useRef<{ x: number; y: number } | null>(null);
    const end = (e: React.PointerEvent) => {
        start.current = null;
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
        rx.set(0);
        ry.set(0);
    };
    return (
        <motion.div className={s.inspectCard} style={{rotateX: srx, rotateY: sry}}
                    onPointerDown={e => {
                        start.current = {x: e.clientX, y: e.clientY};
                        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                    }}
                    onPointerMove={e => {
                        if (!start.current) return;
                        const dx = e.clientX - start.current.x, dy = e.clientY - start.current.y;
                        ry.set(Math.max(-TILT_MAX, Math.min(TILT_MAX, dx / TILT_SENS)));
                        rx.set(Math.max(-TILT_MAX, Math.min(TILT_MAX, -dy / TILT_SENS)));
                    }}
                    onPointerUp={end} onPointerCancel={end}>
            {children}
        </motion.div>
    );
}

/** Modalità dettaglio: la carta a grande formato, ferma sul posto ma inclinabile per ispezionarla, con stato in partita e storia sotto. Le regole e le sincronie sono già leggibili sulla carta stessa (con tooltip), quindi qui non si ripetono. */
export function InspectOverlay({G}: { G: Game }) {
    const x = useBattle(st => st.inspected), profile = useProfile();
    const lang = useLang();
    const b = useBattle.getState;
    useEffect(() => {
        if (!x) return;
        const k = (e: KeyboardEvent) => {
            if (e.key === 'Escape') b().inspect(null);
        };
        window.addEventListener('keydown', k);
        return () => window.removeEventListener('keydown', k);
    }, [x, b]);
    const c = x ? cardInfo(x.id) : null, f = x?.uid != null ? findU(G, x.uid) : null,
        lore = x ? (lang === 'en' ? EN_LORE[x.id] : loreOf(x.id)) : undefined;
    const name = c ? ((lang === 'en' ? EN_CARDS[c.id]?.n : undefined) ?? c.n) : '';
    const tName = c ? typeName(c.t, lang) : '';
    const rarName = c ? rarityName(c.r, lang) : '';
    const laneName = (l: number) => lang === 'en' ? EN_LANE_NAME[l] : LANE_NAME[l];
    const omen = f ? omenAt(G, f.l) : null, omenInfo = omen ? (lang === 'en' ? EN_OMENS[omen] : OMENS[omen]) : null;
    return (
        <AnimatePresence>
            {x && c && (
                <motion.div className={s.inspectBack} initial={{opacity: 0}} animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            onClick={e => {
                                if (e.target === e.currentTarget) b().inspect(null);
                            }} role="dialog" aria-modal="true"
                            aria-label={`${lang === 'en' ? 'Detail' : 'Dettaglio'}: ${name}`}>
                    <motion.div className={s.inspect} initial={{scale: 0.85, y: 30}} animate={{scale: 1, y: 0}}
                                exit={{scale: 0.92, opacity: 0}}
                                transition={{type: 'spring', stiffness: 260, damping: 24}}>
                        <TiltCard>
                            <Card card={c} cost={x.cost} look={x.p === 1 || c.token ? undefined : lookOf(profile, c.id)}
                                  atk={f ? uAtk(G, f.p, f.l, f.u) : undefined}
                                  hp={f ? uMax(G, f.p, f.l, f.u) - f.u.dmg : undefined}/>
                        </TiltCard>
                        <div className={s.inspectInfo}>
                            <h2>{name}</h2>
                            <div className={s.inspectMeta}>
                                <span style={{color: FACTIONS[c.f].col}}><Glyph>{FACTION_GLYPH[c.f]}</Glyph>{factionName(c.f, lang)}</span>
                                <span>{tName}</span>
                                <span style={{color: RARITY[c.r].color}}><RarityGem r={c.r}/>{rarName}</span>
                                <span>{lang === 'en' ? 'Base cost' : 'Costo base'} {c.c}</span>
                                {c.t === 'U' && <span className={s.inspectAtkHp}><Glyph>{SWORD}</Glyph>{c.a}
                                    <Glyph>{HEART}</Glyph>{c.h}</span>}
                            </div>
                            {f && <section><h3>{lang === 'en' ? 'In play' : 'In partita'}</h3>
                                {lang === 'en' ? <p>{f.p === 0 ? 'Yours' : "The opponent's"},
                                    {laneName(f.l)} lane. Attack {uAtk(G, f.p, f.l, f.u)},
                                    health {uMax(G, f.p, f.l, f.u) - f.u.dmg} of {uMax(G, f.p, f.l, f.u)}.
                                    {f.u.sick ? ' Just entered play.' : ''}{f.u.stun ? ' Stunned: skips its next attack.' : ''} {f.u.asc ? 'Ascended (+2/+2).' : `Ascension: ${f.u.fights ?? 0}/${ASCEND_FIGHTS} fights.`}</p>
                                    : <p>{f.p === 0 ? 'Tua' : "Dell'avversario"},
                                        corsia {laneName(f.l)}. Attacco {uAtk(G, f.p, f.l, f.u)},
                                        salute {uMax(G, f.p, f.l, f.u) - f.u.dmg} su {uMax(G, f.p, f.l, f.u)}.
                                        {f.u.sick ? ' Appena entrata in gioco.' : ''}{f.u.stun ? ' Stordita: salta il prossimo attacco.' : ''} {f.u.asc ? 'Ascesa (+2/+2).' : `Ascesa: ${f.u.fights ?? 0}/${ASCEND_FIGHTS} combattimenti.`}</p>}
                                {omenInfo && <p><b>{omenInfo.name}</b>: {omenInfo.text}</p>}
                            </section>}
                            {lore && <div className={s.inspectStory}>
                                <p className={s.inspectLore}>{lore.text}</p>
                                <p className={s.inspectInsp}>{lang === 'en' ? 'Inspired by' : 'Ispirata a'} {lore.insp}.</p>
                            </div>}
                            <button className={s.btn} onClick={() => b().inspect(null)}
                                    autoFocus>{lang === 'en' ? 'Close' : 'Chiudi'}</button>
                        </div>
                    </motion.div>
                    <TooltipHost/>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
