import {useEffect, useState} from 'react';
import {BYID, cardInfo, FACTIONS, type Keyword, KEYWORDS, RARITY, SET, synergiesOf, TYPES} from '../../engine';
import {Card} from '../../cards/Card';
import {hasIllustration} from '../../cards/art/illustrations';
import {FACTION_GLYPH, Glyph, RarityGem} from '../../cards/glyphs';
import {FACTION_LORE, loreOf} from '../../cards/lore';
import {CODEX_LEVEL, SECRETS} from '../../cards/secrets';
import {ART_STYLES, type ArtStyle, type EffectId, freeStyles, FX, MASTERY_NAMES} from '../../cards/styles';
import {challengesFor, LEVEL_XP, levelName, levelOf} from '../../economy/mastery';
import {effectsOf, framesOf, lookOf, masteryOf, useProfile} from '../../profile/store';
import {Modal} from '../../ui/Modal';
import {Confirm} from '../../ui/Confirm';
import {askBuy} from '../../ui/confirmBuy';
import {sfx} from '../../audio/sfx';
import {toast} from '../../ui/toast';
import u from '../../ui/ui.module.css';
import s from './collection.module.css';

type Tab = 'storia' | 'stile' | 'effetti' | 'maestria';
const TABS: [Tab, string][] = [['storia', 'Storia'], ['stile', 'Stile'], ['effetti', 'Effetti'], ['maestria', 'Maestria']];

/** Pulsante di sblocco: si sceglie UNA valuta, poi l'oggetto è posseduto e le altre opzioni spariscono. */
function Unlock({polvere, gettone, onBuy}: {
    polvere?: number;
    gettone?: boolean;
    onBuy: (withToken: boolean) => boolean
}) {
    const p = useProfile();
    const [open, setOpen] = useState(false);
    const buy = (tok: boolean) => askBuy({
        title: 'Confermi lo sblocco?',
        text: tok ? `Spendi 1 gettone (ne hai ${p.gettoni}).` : `Spendi ${polvere} polvere (ne hai ${p.polvere}).`,
        label: tok ? 'Usa 1 gettone' : `Spendi ${polvere}`,
        onConfirm: () => {
            if (onBuy(tok)) {
                sfx('forge');
                setOpen(false);
            }
        }
    });
    if (!open) return <button className={`${u.btn} ${u.sm}`}
                              onClick={() => (gettone ? setOpen(true) : polvere != null && buy(false))}
                              disabled={!gettone && (polvere ?? 0) > p.polvere}>
        {gettone ? 'Sblocca…' : `Sblocca · ${polvere} polvere`}</button>;
    return (
        <div className={s.pay}>
            <span>Paga con:</span>
            {polvere != null && <button className={`${u.btn} ${u.sm}`} disabled={p.polvere < polvere}
                                        onClick={() => buy(false)}>{polvere} polvere</button>}
            <button className={`${u.btn} ${u.sm}`} disabled={p.gettoni < 1} onClick={() => buy(true)}>1 gettone</button>
            <button className={s.x} onClick={() => setOpen(false)} aria-label="Annulla">×</button>
        </div>
    );
}

export function CardDetail({id, onClose, onOpen}: {
    id: string | null;
    onClose: () => void;
    onOpen?: (id: string) => void
}) {
    const p = useProfile();
    const [tab, setTab] = useState<Tab>('storia'), [ask, setAsk] = useState<'craft' | 'dis' | null>(null);
    useEffect(() => {
        if (id) setTab('storia');
    }, [id]);
    if (!id) return <Modal open={false} onClose={onClose}>{null}</Modal>;
    const c = BYID[id], R = RARITY[c.r], o = p.owned[id] || 0, look = lookOf(p, id), lore = loreOf(id),
        F = FACTIONS[c.f];
    const styles: ArtStyle[] = [...freeStyles(id), ...(p.styles[id] || [])], fxs = effectsOf(p, id),
        frs = framesOf(p, id);
    const m = masteryOf(p, id), lvl = levelOf(m.xp), next = LEVEL_XP[lvl];
    const kws = (Object.keys(KEYWORDS) as Keyword[]).filter(k => new RegExp(`\\b${k}\\b`).test(c.tx));
    const opt = (key: string, active: boolean, thumb: JSX.Element, name: string, desc: string, action: JSX.Element) => (
        <div key={key} className={`${s.style} ${active ? s.on : ''}`}>
            <div className={s.thumb}>{thumb}</div>
            <strong>{name}</strong><span className={`${u.small} ${u.muted}`}>{desc}</span>{action}
        </div>
    );
    const use = (active: boolean, on: () => void) => <button className={`${u.btn} ${u.sm} ${active ? '' : u.primary}`}
                                                             disabled={active}
                                                             onClick={on}>{active ? 'In uso' : 'Usa'}</button>;
    return (
        <Modal open onClose={onClose}>
            <div className={s.detail}>
                <div className={s.big}><Card card={c} look={look}/></div>
                <div>
                    <div className={s.titleRow}><h2 className={s.h}>{c.n}</h2></div>
                    <div className={s.meta}>
                        <span className={s.metaFac}
                              style={{['--fc' as string]: F.col}}><Glyph>{FACTION_GLYPH[c.f]}</Glyph>{F.name}</span>
                        <span>{TYPES[c.t]}</span>
                        <span className={s.metaRar} style={{color: R.color}}><RarityGem r={c.r}
                                                                                        className={s.metaGem}/>{R.name}</span>
                        <span>{SET.symbol} {SET.name}</span>
                        <span>Possedute {o}/{R.max}</span>
                        <span>Maestria {levelName(lvl)}</span>
                    </div>
                    {kws.map(k => <p key={k} className={u.small}><b>{k}</b>: {KEYWORDS[k]}</p>)}
                    <div className={u.row} style={{marginTop: 10}}>
                        <button className={`${u.btn} ${u.primary}`} disabled={o >= R.max || p.polvere < R.craft}
                                onClick={() => setAsk('craft')}>Crea · {R.craft} polvere
                        </button>
                        <button className={u.btn} disabled={!o} onClick={() => setAsk('dis')}>Disfa · {R.dis} polvere
                        </button>
                    </div>

                    <div className={s.tabs} role="tablist">
                        {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={s.tabBtn}
                                                      onClick={() => setTab(k)}>{l}</button>)}
                    </div>

                    {tab === 'storia' && lore && <div className={s.lore}>
                        <p className={s.loreText}>{lore.text}</p>
                        <p className={`${u.small} ${u.muted}`}>Ispirata a: {lore.insp}.</p>
                        {SECRETS[id] && (lvl >= CODEX_LEVEL ?
                            <p className={s.secret}>Frammento nascosto: {SECRETS[id]}</p> :
                            <p className={s.secretLock}>Frammento nascosto: si sblocca portando la carta al
                                grado {MASTERY_NAMES[CODEX_LEVEL - 1]}.</p>)}
                        <h3 className={s.sub}>Legami</h3>
                        <div className={s.links}>
                            {lore.links.map(l => {
                                const lc = cardInfo(l);
                                return (
                                    <button key={l} className={s.link} onClick={() => onOpen?.(l)}
                                            disabled={!onOpen || !BYID[l]}>
                                        <span className={s.linkCard}><Card card={lc}
                                                                           look={lookOf(p, l)}/></span><span>{lc.n}</span>
                                    </button>);
                            })}
                        </div>
                        {synergiesOf(id).length > 0 && <>
                            <h3 className={s.sub}>Sincronie</h3>
                            {synergiesOf(id).map(sy => {
                                const other = sy.a === id ? sy.b : sy.a;
                                return (
                                    <p key={sy.id} className={s.syn}><b>{sy.name}</b> con <button className={s.synLink}
                                                                                                  onClick={() => onOpen?.(other)}>{cardInfo(other).n}</button>: {sy.text} Si
                                        attiva quando entrambe sono in gioco dalla tua parte.</p>);
                            })}
                        </>}
                        <h3 className={s.sub}>{F.name}: {FACTION_LORE[c.f].motto}</h3>
                        <p className={`${u.small} ${u.muted}`}>{FACTION_LORE[c.f].text}</p>
                    </div>}

                    {tab === 'stile' && <div className={s.styles}>
                        {(Object.keys(ART_STYLES) as ArtStyle[]).map(st => {
                            const has = styles.includes(st), avail = st !== 'illustrata' || hasIllustration(id),
                                active = look.art === st;
                            return opt(st, active, <Card card={c} look={{
                                    ...look,
                                    art: avail ? st : look.art
                                }}/>, ART_STYLES[st].name,
                                avail ? ART_STYLES[st].desc : 'Illustrazione AI non ancora disponibile per questa carta.',
                                !avail ? <span/> : has ? use(active, () => p.setLook(id, {art: st})) :
                                    <Unlock polvere={ART_STYLES[st].cost} gettone
                                            onBuy={t => p.unlockStyle(id, st, t)}/>);
                        })}
                    </div>}

                    {tab === 'effetti' && <div className={s.styles}>
                        {opt('none', !look.effect, <Card card={c} look={{
                            ...look,
                            effect: null
                        }}/>, 'Nessuno', 'La carta senza animazioni.', use(!look.effect, () => p.setLook(id, {effect: null})))}
                        {(Object.keys(FX) as EffectId[]).map(fx => {
                            const has = fxs.includes(fx), active = look.effect === fx;
                            return opt(fx, active, <Card card={c}
                                                         look={{...look, effect: fx}}/>, FX[fx].name, FX[fx].desc,
                                has ? use(active, () => p.setLook(id, {effect: fx})) :
                                    <Unlock polvere={FX[fx].cost(c.r)} gettone
                                            onBuy={t => p.unlockEffect(id, fx, t)}/>);
                        })}
                    </div>}

                    {tab === 'maestria' && <div className={s.mastery}>
                        <div className={s.mHead}>
                            <strong>{levelName(lvl)}</strong><span>{next ? `${m.xp} / ${next} XP verso ${MASTERY_NAMES[lvl]}` : `${m.xp} XP, grado massimo`}</span>
                        </div>
                        <div className={u.bar}><b
                            style={{width: `${next ? Math.min(100, ((m.xp - (LEVEL_XP[lvl - 1] ?? 0)) / (next - (LEVEL_XP[lvl - 1] ?? 0))) * 100) : 100}%`}}/>
                        </div>
                        <p className={`${u.small} ${u.muted}`}>In ogni partita la carta guadagna XP quando la giochi (10
                            per volta), quando vinci (15), per i danni ai Sigilli (2 ciascuno), per le unità eliminate
                            (6) e per i turni da reliquia (3).</p>
                        <h3 className={s.sub}>Cosa sblocca la maestria</h3>
                        <ul className={s.unlocks}>
                            {[[2, 'Il frammento nascosto della carta nel Codex'], [3, "L'effetto Alone per questa carta"], [6, "L'effetto Oro fuso per questa carta"]].map(([l, t]) =>
                                <li key={l as number} className={lvl >= (l as number) ? s.unlOn : ''}>
                                    <b>{MASTERY_NAMES[(l as number) - 1]}</b> {t}</li>)}
                            <li className={lvl >= 1 ? s.unlOn : ''}><b>Ogni grado</b> Una cornice del profilo dello
                                stesso grado, se è la tua prima carta a raggiungerlo
                            </li>
                        </ul>
                        <h3 className={s.sub}>Sfide</h3>
                        {challengesFor(id).map(ch => {
                            const v = Math.min(ch.goal, m[ch.stat]), done = m.done.includes(ch.id);
                            return <div key={ch.id} className={`${s.ch} ${done ? s.chDone : ''}`}>
                                <div className={s.chTop}>
                                    <strong>{ch.txt}</strong><span>{done ? 'Completata' : `+${ch.xp} XP, +${ch.polvere} polvere`}</span>
                                </div>
                                <div className={u.bar}><b style={{width: `${(v / ch.goal) * 100}%`}}/></div>
                                <span className={`${u.small} ${u.muted}`}>{v} / {ch.goal}</span>
                            </div>;
                        })}
                    </div>}

                    <p className={`${u.small} ${u.muted}`} style={{marginTop: 14}}>Hai {p.polvere} polvere
                        e {p.gettoni} gettoni. Un gettone sblocca uno stile o un effetto per una carta.</p>
                    <button className={u.btn} onClick={onClose}>Chiudi</button>
                    <Confirm open={ask === 'craft'} title={`Creare ${c.n}?`}
                             text={`Spendi ${R.craft} polvere per aggiungere una copia alla collezione (ne hai ${p.polvere}).`}
                             confirmLabel={`Crea per ${R.craft}`} onConfirm={() => {
                        if (p.craft(id)) {
                            sfx('forge');
                            toast(`${c.n} creata`);
                        }
                    }} onClose={() => setAsk(null)}/>
                    <Confirm open={ask === 'dis'} title={`Disfare ${c.n}?`}
                             text={`Una copia viene distrutta e ricevi ${R.dis} polvere. ${o <= 1 ? 'È la tua ultima copia: verrà tolta dai mazzi.' : ''}`}
                             confirmLabel={`Disfa per ${R.dis}`} onConfirm={() => {
                        if (p.disenchant(id)) {
                            sfx('forge');
                            toast(`+${R.dis} polvere`);
                        }
                    }} onClose={() => setAsk(null)}/>
                </div>
            </div>
        </Modal>
    );
}
