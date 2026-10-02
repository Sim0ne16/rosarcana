import {useEffect, useState} from 'react';
import {BYID, cardInfo, FACTIONS, type Keyword, KEYWORDS, RARITY, SET, synergiesOf} from '../../engine';
import {Card} from '../../cards/Card';
import {hasIllustration} from '../../cards/art/illustrations';
import {splitCardMentions} from '../../cards/cardText';
import {FACTION_GLYPH, Glyph, RarityGem} from '../../cards/glyphs';
import {FACTION_LORE, linksOf, loreOf} from '../../cards/lore';
import {CODEX_LEVEL, SECRETS} from '../../cards/secrets';
import {ART_STYLES, type ArtStyle, type EffectId, freeStyles, FX} from '../../cards/styles';
import {challengesFor, LEVEL_XP, levelName, levelOf} from '../../economy/mastery';
import {EN_FACTION_LORE, EN_KEYWORD_WORD, EN_KEYWORDS, EN_SET_NAME, EN_SYNERGIES} from '../../i18n/en/mechanics';
import {EN_LORE} from '../../i18n/en/lore';
import {EN_SECRETS} from '../../i18n/en/secrets';
import {originalName, VARIANTS} from '../../cards/variants';
import {useEvent} from '../adventure/stories';
import {EN_ART_STYLES, EN_FX, loc} from '../../i18n/en/ui';
import {useLang, useT} from '../../i18n/lang';
import {cardName, factionName, masteryName, rarityName, typeName} from '../../i18n/names';
import {type Pair, W} from '../../i18n/words';
import {effectsOf, lookOf, masteryOf, useProfile} from '../../profile/store';
import {Modal} from '../../ui/Modal';
import {Confirm} from '../../ui/Confirm';
import {askBuy} from '../../ui/confirmBuy';
import {sfx} from '../../audio/sfx';
import {toast} from '../../ui/toast';
import u from '../../ui/ui.module.css';
import s from './collection.module.css';

type Tab = 'storia' | 'stile' | 'effetti' | 'maestria';
const TABS: [Tab, Pair][] = [['storia', ['Storia', 'Story']], ['stile', ['Stile', 'Style']], ['effetti', ['Effetti', 'Effects']], ['maestria', ['Maestria', 'Mastery']]];
/** Cosa sblocca la maestria, per grado. */
const MASTERY_UNLOCKS: [number, Pair][] = [
    [2, ['Il frammento nascosto della carta nel Codex', 'The card\'s hidden fragment in the Codex']],
    [3, ['L\'effetto Alone per questa carta', 'The Halo effect for this card']],
    [6, ['L\'effetto Oro fuso per questa carta', 'The Molten Gold effect for this card']],
];

/** Pulsante di sblocco: si sceglie UNA valuta, poi l'oggetto è posseduto e le altre opzioni spariscono. */
function Unlock({polvere, gettone, onBuy}: {
    polvere?: number;
    gettone?: boolean;
    onBuy: (withToken: boolean) => boolean
}) {
    const p = useProfile();
    const [open, setOpen] = useState(false);
    const t = useT();
    const buy = (tok: boolean) => askBuy({
        title: t('Confermi lo sblocco?', 'Confirm the unlock?'),
        text: tok ? t(`Spendi 1 gettone (ne hai ${p.gettoni}).`, `Spend 1 token (you have ${p.gettoni}).`) : t(`Spendi ${polvere} polvere (ne hai ${p.polvere}).`, `Spend ${polvere} dust (you have ${p.polvere}).`),
        label: tok ? t('Usa 1 gettone', 'Use 1 token') : t(`Spendi ${polvere}`, `Spend ${polvere}`),
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
        {gettone ? t('Sblocca…', 'Unlock…') : `${t('Sblocca', 'Unlock')} · ${polvere} ${t(W.dust)}`}</button>;
    return (
        <div className={s.pay}>
            <span>{t('Paga con:', 'Pay with:')}</span>
            {polvere != null && <button className={`${u.btn} ${u.sm}`} disabled={p.polvere < polvere}
                                        onClick={() => buy(false)}>{polvere} {t(W.dust)}</button>}
            <button className={`${u.btn} ${u.sm}`} disabled={p.gettoni < 1} onClick={() => buy(true)}>{t(W.token1)}</button>
            <button className={s.x} onClick={() => setOpen(false)} aria-label={t(W.cancel)}>×</button>
        </div>
    );
}

export function CardDetail({id, onClose, onOpen}: {
    id: string | null;
    onClose: () => void;
    onOpen?: (id: string) => void
}) {
    const p = useProfile();
    const lang = useLang(), t = useT();
    const variants = useEvent(x => x.variants);
    const [tab, setTab] = useState<Tab>('storia'), [ask, setAsk] = useState<'craft' | 'dis' | null>(null);
    useEffect(() => {
        if (id) setTab('storia');
    }, [id]);
    if (!id) return <Modal open={false} onClose={onClose}>{null}</Modal>;
    const c = BYID[id], R = RARITY[c.r], o = p.owned[id] || 0, look = lookOf(p, id),
        itLore = loreOf(id), lore = (lang === 'en' ? EN_LORE[id] : undefined) ?? itLore, F = FACTIONS[c.f];
    const live = variants.find(v => VARIANTS[v.variant]?.card === id);
    const name = cardName(id, lang), secret = (lang === 'en' ? EN_SECRETS[id] : undefined) ?? SECRETS[id];
    const codexGrade = masteryName(CODEX_LEVEL - 1, lang);
    const tName = typeName(c.t, lang);
    const rarName = rarityName(c.r, lang);
    const otherName = (oid: string) => cardName(oid, lang);
    const styles: ArtStyle[] = [...freeStyles(id), ...(p.styles[id] || [])], fxs = effectsOf(p, id);
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
                                                             onClick={on}>{active ? t(W.inUse) : t(W.use)}</button>;
    /** Testo libero (le sincronie citano un'altra carta nella loro descrizione): i nomi citati aprono quella carta. */
    const withCardLinks = (text: string) => splitCardMentions(text, lang).map((part, i) => typeof part === 'string' ? part :
        <button key={i} className={s.synLink} disabled={!onOpen || !BYID[part.id]}
                onClick={() => onOpen?.(part.id)}>{part.n}</button>);
    return (
        <Modal open onClose={onClose}>
            <div className={s.detail}>
                <div className={s.big}><Card card={c} look={look}/></div>
                <div>
                    <div className={s.titleRow}><h2 className={s.h}>{name}</h2></div>
                    <div className={s.meta}>
                        <span className={s.metaFac}
                              style={{['--fc' as string]: F.col}}><Glyph>{FACTION_GLYPH[c.f]}</Glyph>{factionName(c.f, lang)}</span>
                        <span>{tName}</span>
                        <span className={s.metaRar} style={{color: R.color}}><RarityGem r={c.r}
                                                                                        className={s.metaGem}/>{rarName}</span>
                        <span>{SET.symbol} {lang === 'en' ? EN_SET_NAME : SET.name}</span>
                        <span>{t('Possedute', 'Owned')} {o}/{R.max}</span>
                        <span>{t('Maestria', 'Mastery')} {levelName(lvl)}</span>
                    </div>
                    {kws.map(k => <p key={k}
                                     className={u.small}><b>{lang === 'en' ? EN_KEYWORD_WORD[k] : k}</b>: {lang === 'en' ? EN_KEYWORDS[k] : KEYWORDS[k]}</p>)}
                    {live && <p className={s.live}>✦ {t(`Carta viva: la community l'ha cambiata nel racconto «${live.story}», scegliendo «${live.option}».`, `Living card: the community changed it in the tale “${live.story}”, choosing “${live.option}”.`)}
                        {p.firstEd?.includes(id) && <b> {t(`Possiedi la Prima edizione: ${originalName(id, lang)}.`, `You own the First edition: ${originalName(id, lang)}.`)}</b>}</p>}
                    <div className={u.row} style={{marginTop: 10}}>
                        <button className={`${u.btn} ${u.primary}`} disabled={o >= R.max || p.polvere < R.craft}
                                onClick={() => setAsk('craft')}>{t('Crea', 'Craft')} · {R.craft} {t(W.dust)}
                        </button>
                        <button className={u.btn} disabled={!o} onClick={() => setAsk('dis')}>{t('Disfa', 'Disenchant')} · {R.dis} {t(W.dust)}
                        </button>
                    </div>

                    <div className={s.tabs} role="tablist">
                        {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={s.tabBtn}
                                                      onClick={() => setTab(k)}>{t(l)}</button>)}
                    </div>

                    {tab === 'storia' && lore && <div className={s.lore}>
                        <p className={s.loreText}>{lore.text}</p>
                        <p className={`${u.small} ${u.muted}`}>{t(W.inspiredBy)}: {lore.insp}.</p>
                        {secret && (lvl >= CODEX_LEVEL ?
                            <p className={s.secret}>{t(W.hiddenFragment)}: {secret}</p> :
                            <p className={s.secretLock}>{t(`Frammento nascosto: si sblocca portando la carta al grado ${codexGrade}.`, `Hidden fragment: unlocks by bringing the card to the ${codexGrade} grade.`)}</p>)}
                        {linksOf(id).length > 0 && <h3 className={s.sub}>{t('Legami', 'Links')}</h3>}
                        <div className={s.links}>
                            {linksOf(id).map(l => {
                                const lc = cardInfo(l);
                                return (
                                    <button key={l} className={s.link} onClick={() => onOpen?.(l)}
                                            disabled={!onOpen || !BYID[l]}>
                                        <span className={s.linkCard}><Card card={lc}
                                                                           look={lookOf(p, l)}/></span><span>{otherName(l)}</span>
                                    </button>);
                            })}
                        </div>
                        {synergiesOf(id).length > 0 && <>
                            <h3 className={s.sub}>{t(W.synergies)}</h3>
                            {synergiesOf(id).map(sy => {
                                const other = sy.a === id ? sy.b : sy.a, enSy = lang === 'en' ? EN_SYNERGIES[sy.id] : undefined;
                                return (
                                    <p key={sy.id} className={s.syn}><b>{enSy?.name ?? sy.name}</b> {t('con', 'with')} <button
                                        className={s.synLink}
                                        onClick={() => onOpen?.(other)}>{otherName(other)}</button>: {withCardLinks(enSy?.text ?? sy.text)} {t('Si attiva quando entrambe sono in gioco dalla tua parte.', 'Activates when both are in play on your side.')}</p>);
                            })}
                        </>}
                        <h3 className={s.sub}>{factionName(c.f, lang)}: {lang === 'en' ? EN_FACTION_LORE[c.f].motto : FACTION_LORE[c.f].motto}</h3>
                        <p className={`${u.small} ${u.muted}`}>{lang === 'en' ? EN_FACTION_LORE[c.f].text : FACTION_LORE[c.f].text}</p>
                    </div>}

                    {tab === 'stile' && <div className={s.styles}>
                        {(Object.keys(ART_STYLES) as ArtStyle[]).map(st => {
                            const has = styles.includes(st), avail = st !== 'illustrata' || hasIllustration(id),
                                active = look.art === st;
                            const info = loc(ART_STYLES[st], EN_ART_STYLES[st], lang);
                            return opt(st, active, <Card card={c} look={{
                                    ...look,
                                    art: avail ? st : look.art
                                }}/>, info.name,
                                avail ? info.desc : t('Illustrazione AI non ancora disponibile per questa carta.', 'AI illustration not yet available for this card.'),
                                !avail ? <span/> : has ? use(active, () => p.setLook(id, {art: st})) :
                                    <Unlock polvere={ART_STYLES[st].cost} gettone
                                            onBuy={t => p.unlockStyle(id, st, t)}/>);
                        })}
                    </div>}

                    {tab === 'effetti' && <div className={s.styles}>
                        {opt('none', !look.effect, <Card card={c} look={{
                            ...look,
                            effect: null
                        }}/>, t(W.noneMasc), t('La carta senza animazioni.', 'The card without animations.'), use(!look.effect, () => p.setLook(id, {effect: null})))}
                        {(Object.keys(FX) as EffectId[]).map(fx => {
                            const has = fxs.includes(fx), active = look.effect === fx, info = loc(FX[fx], EN_FX[fx], lang);
                            return opt(fx, active, <Card card={c}
                                                         look={{...look, effect: fx}}/>, info.name, info.desc,
                                has ? use(active, () => p.setLook(id, {effect: fx})) :
                                    <Unlock polvere={FX[fx].cost(c.r)} gettone
                                            onBuy={t => p.unlockEffect(id, fx, t)}/>);
                        })}
                    </div>}

                    {tab === 'maestria' && <div className={s.mastery}>
                        <div className={s.mHead}>
                            <strong>{levelName(lvl)}</strong><span>{next ? t(`${m.xp} / ${next} XP verso ${masteryName(lvl, lang)}`, `${m.xp} / ${next} XP towards ${masteryName(lvl, lang)}`) : t(`${m.xp} XP, grado massimo`, `${m.xp} XP, highest grade`)}</span>
                        </div>
                        <div className={u.bar}><b
                            style={{width: `${next ? Math.min(100, ((m.xp - (LEVEL_XP[lvl - 1] ?? 0)) / (next - (LEVEL_XP[lvl - 1] ?? 0))) * 100) : 100}%`}}/>
                        </div>
                        <p className={`${u.small} ${u.muted}`}>{t('In ogni partita la carta guadagna XP quando la giochi (10 per volta), quando vinci (15), per i danni ai Sigilli (2 ciascuno), per le unità eliminate (6) e per i turni da reliquia (3).',
                            'In every match the card earns XP when you play it (10 each time), when you win (15), for damage to Seals (2 each), for units destroyed (6) and for relic turns (3).')}</p>
                        <h3 className={s.sub}>{t('Cosa sblocca la maestria', 'What mastery unlocks')}</h3>
                        <ul className={s.unlocks}>
                            {MASTERY_UNLOCKS.map(([l, what]) =>
                                <li key={l} className={lvl >= l ? s.unlOn : ''}>
                                    <b>{masteryName(l - 1, lang)}</b> {t(what)}</li>)}
                            <li className={lvl >= 1 ? s.unlOn : ''}><b>{t('Ogni grado', 'Every grade')}</b> {t('Una cornice del profilo dello stesso grado, se è la tua prima carta a raggiungerlo', 'A profile frame of the same grade, if it is your first card to reach it')}
                            </li>
                        </ul>
                        <h3 className={s.sub}>{t('Sfide', 'Challenges')}</h3>
                        {challengesFor(id).map(ch => {
                            const v = Math.min(ch.goal, m[ch.stat]), done = m.done.includes(ch.id);
                            return <div key={ch.id} className={`${s.ch} ${done ? s.chDone : ''}`}>
                                <div className={s.chTop}>
                                    <strong>{t(ch.txt)}</strong><span>{done ? t(W.completed) : `+${ch.xp} XP, +${ch.polvere} ${t(W.dust)}`}</span>
                                </div>
                                <div className={u.bar}><b style={{width: `${(v / ch.goal) * 100}%`}}/></div>
                                <span className={`${u.small} ${u.muted}`}>{v} / {ch.goal}</span>
                            </div>;
                        })}
                    </div>}

                    <p className={`${u.small} ${u.muted}`} style={{marginTop: 14}}>{t(`Hai ${p.polvere} polvere e ${p.gettoni} gettoni. Un gettone sblocca uno stile o un effetto per una carta.`, `You have ${p.polvere} dust and ${p.gettoni} tokens. A token unlocks a style or an effect for a card.`)}</p>
                    <button className={u.btn} onClick={onClose}>{t(W.close)}</button>
                    <Confirm open={ask === 'craft'} title={t(`Creare ${c.n}?`, `Craft ${name}?`)}
                             text={t(`Spendi ${R.craft} polvere per aggiungere una copia alla collezione (ne hai ${p.polvere}).`, `Spend ${R.craft} dust to add a copy to your collection (you have ${p.polvere}).`)}
                             confirmLabel={t(`Crea per ${R.craft}`, `Craft for ${R.craft}`)} onConfirm={() => {
                        if (p.craft(id)) {
                            sfx('forge');
                            toast(t(`${c.n} creata`, `${name} crafted`));
                        }
                    }} onClose={() => setAsk(null)}/>
                    <Confirm open={ask === 'dis'} title={t(`Disfare ${c.n}?`, `Disenchant ${name}?`)}
                             text={t(`Una copia viene distrutta e ricevi ${R.dis} polvere. ${o <= 1 ? 'È la tua ultima copia: verrà tolta dai mazzi.' : ''}`, `One copy is destroyed and you get ${R.dis} dust. ${o <= 1 ? 'It is your last copy: it will be removed from your decks.' : ''}`)}
                             confirmLabel={t(`Disfa per ${R.dis}`, `Disenchant for ${R.dis}`)} onConfirm={() => {
                        if (p.disenchant(id)) {
                            sfx('forge');
                            toast(`+${R.dis} ${t(W.dust)}`);
                        }
                    }} onClose={() => setAsk(null)}/>
                </div>
            </div>
        </Modal>
    );
}
