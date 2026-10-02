import {AnimatePresence, motion} from 'framer-motion';
import {useMemo, useState} from 'react';
import {BYID, CARDS, type CardType, CUSTODI, custodiOf, type Faction, FACTIONS, RARITY} from '../../engine';
import {CustodeCard, CustodePortrait} from '../custodi/CustodeCard';
import {CardDetail} from '../collection/CardDetail';
import {Card} from '../../cards/Card';
import {CardArt} from '../../cards/art/CardArt';
import {FACTION_GLYPH, Glyph, RarityGem, StatGem, TYPE_GLYPH} from '../../cards/glyphs';
import {FACTION_LORE} from '../../cards/lore';
import {ARCHETYPES, countMap, type Deck, deckIssues, PRESETS} from '../../economy/decks';
import {decodeDeck, encodeDeck} from '../../economy/deckCode';
import {BACKS} from '../../economy/constants';
import {CardBack} from '../battle/CardBack';
import {lookOf, useProfile} from '../../profile/store';
import {Confirm} from '../../ui/Confirm';
import {ManaCurve} from '../../ui/ManaCurve';
import {PageHeader} from '../../ui/PageHeader';
import {toast} from '../../ui/toast';
import u from '../../ui/ui.module.css';
import {siteImg} from '../../cards/art/site';
import {type Lang, useLang, useT} from '../../i18n/lang';
import {cardName, custodeName, factionName, typeName} from '../../i18n/names';
import {W} from '../../i18n/words';
import {EN_CUSTODI, EN_FACTION_LORE} from '../../i18n/en/mechanics';
import {EN_BACKS, EN_PRESETS} from '../../i18n/en/ui';
import s from './decks.module.css';

const FACS = Object.keys(FACTIONS) as Faction[];
const champion = (d: Deck) => [...d.cards].sort((a, b) => BYID[b].c - BYID[a].c || 'lruc'.indexOf(BYID[a].r) - 'lruc'.indexOf(BYID[b].r))[0];
/** Nome, descrizione e archetipo di un mazzo suggerito nella lingua scelta. */
const presetText = <T extends { id: string; name: string; blurb: string; archetype?: string }>(pr: T, lang: Lang) =>
    (lang === 'en' && EN_PRESETS[pr.id] ? {...pr, ...EN_PRESETS[pr.id]} : pr);

function Ring({n, max = 30}: { n: number; max?: number }) {
    const ok = n === max;
    const t = useT();
    return (
        <svg viewBox="0 0 44 44" className={s.ring} aria-label={t(`${n} carte su ${max}`, `${n} cards out of ${max}`)}>
            <circle cx="22" cy="22" r="18" className={s.ringTrack}/>
            <circle cx="22" cy="22" r="18" className={`${s.ringFill} ${ok ? s.ringOk : ''}`}
                    style={{strokeDasharray: `${(Math.min(n, max) / max) * 113} 113`}}/>
            <text x="22" y="26.5" textAnchor="middle">{n}</text>
        </svg>
    );
}

export function DecksScreen() {
    const p = useProfile();
    const [edit, setEdit] = useState<string | null>(null), [del, setDel] = useState<string | null>(null), [code, setCode] = useState('');
    const t = useT(), lang = useLang();
    const importCode = () => {
        const d = decodeDeck(code);
        if (!d) {
            toast(t('Codice non valido', 'Invalid code'));
            return;
        }
        if (p.decks.length >= 8) {
            toast(t('Hai già 8 mazzi', 'You already have 8 decks'));
            return;
        }
        const id = p.deck.create();
        p.deck.update(id, d);
        const miss = d.cards.filter((c, i) => d.cards.slice(0, i).filter(x => x === c).length >= (p.owned[c] || 0)).length;
        toast(miss ? t(`Mazzo importato: ti mancano ${miss} carte, puoi crearle dalla Collezione`, `Deck imported: you are missing ${miss} cards, you can craft them from the Collection`) : t(`Mazzo «${d.name}» importato`, `Deck “${d.name}” imported`));
        setCode('');
    };
    const copyCode = async (d: Deck) => {
        const c = encodeDeck(d);
        try {
            await navigator.clipboard.writeText(c);
            toast(t('Codice del mazzo copiato', 'Deck code copied'));
        } catch {
            window.prompt(t('Copia questo codice:', 'Copy this code:'), c);
        }
    };
    if (edit && p.decks.some(d => d.id === edit)) return <DeckEditor id={edit} onDone={() => setEdit(null)}/>;
    return (
        <section className={u.page}>
            <PageHeader title={t(W.decks)}
                        sub={t('30 carte, al massimo due fazioni. Il mazzo in uso è quello con il sigillo dorato.', '30 cards, at most two factions. The deck in use is the one with the golden seal.')}/>
            <div className={s.codeBox}><input value={code} onChange={e => setCode(e.target.value)}
                                              placeholder={t('Incolla un codice mazzo (RDECK1:…)', 'Paste a deck code (RDECK1:…)')}
                                              aria-label={t('Codice mazzo', 'Deck code')}/>
                <button className={u.btn} disabled={!code.trim()} onClick={importCode}>{t('Importa mazzo', 'Import deck')}</button>
            </div>
            <div className={s.boxes}>
                {p.decks.map((d, i) => {
                    const iss = deckIssues(d, p.owned), ch = champion(d),
                        facs = d.fac.length ? d.fac : [...new Set(d.cards.map(c => BYID[c].f))],
                        active = d.id === p.activeDeck;
                    return (
                        <motion.article key={d.id} className={`${s.box} ${active ? s.active : ''}`}
                                        initial={{opacity: 0, y: 16}} animate={{opacity: 1, y: 0}}
                                        transition={{delay: i * 0.05}}
                                        style={{
                                            ['--f1' as string]: FACTIONS[facs[0] ?? 'brace'].col,
                                            ['--f2' as string]: FACTIONS[facs[1] ?? facs[0] ?? 'vuoto'].col
                                        }}>
                            <button className={s.boxArt} onClick={() => setEdit(d.id)}
                                    aria-label={t(`Modifica ${d.name}`, `Edit ${d.name}`)}>
                                {ch ? <CardArt id={ch} style={lookOf(p, ch).art}
                                               arch={false}/> : facs[0] && siteImg(`casata-${facs[0]}`) ?
                                    <img src={siteImg(`casata-${facs[0]}`)} alt=""/> : <div className={s.emptyArt}/>}
                                <div className={s.crests}>{facs.map(f => <span key={f} className={s.crest}
                                                                               style={{['--fc' as string]: FACTIONS[f].col}}
                                                                               title={factionName(f, lang)}><Glyph>{FACTION_GLYPH[f]}</Glyph></span>)}</div>
                                {active && <span className={s.inUse}>{t(W.inUse)}</span>}
                                {d.custode && <span className={s.boxCust}><CustodePortrait id={d.custode}/></span>}
                            </button>
                            <div className={s.boxBody}>
                                <div className={s.boxTop}><h3>{d.name}</h3><Ring n={d.cards.length}/></div>
                                <ManaCurve cards={d.cards}/>
                                {iss.length > 0 ? <p className={s.warn}>{iss.join(', ')}</p> :
                                    <p className={s.okTxt}>{facs.map(f => factionName(f, lang)).join(t(' e ', ' and '))}{d.custode ? t(`, custode ${CUSTODI[d.custode].name}`, `, custodian ${custodeName(d.custode, lang)}`) : ch ? t(`, guidato da ${BYID[ch].n}`, `, led by ${cardName(ch, lang)}`) : ''}</p>}
                                <div className={s.boxActions}>
                                    <button className={`${u.btn} ${u.sm} ${u.primary}`}
                                            onClick={() => setEdit(d.id)}>{t(W.edit)}
                                    </button>
                                    {!active && !iss.length && <button className={`${u.btn} ${u.sm}`}
                                                                       onClick={() => p.deck.setActive(d.id)}>{t(W.use)}</button>}
                                    <button className={`${u.btn} ${u.sm}`} onClick={() => void copyCode(d)}>{t('Codice', 'Code')}
                                    </button>
                                    {p.decks.length > 1 && <button className={`${u.btn} ${u.sm}`}
                                                                   onClick={() => setDel(d.id)}>{t(W.delete)}</button>}
                                </div>
                            </div>
                        </motion.article>);
                })}
                {p.decks.length < 8 &&
                    <button className={s.newBox} onClick={() => setEdit(p.deck.create())}><span>+</span>{t(W.newDeck)}
                    </button>}
            </div>
            <details className={s.suggest}>
                <summary><span>{t('Mazzi suggeriti', 'Suggested decks')}</span><em>{t(`${PRESETS.length} mazzi base e ${ARCHETYPES.length} mazzi per archetipo, pronti da copiare`, `${PRESETS.length} starter decks and ${ARCHETYPES.length} archetype decks, ready to copy`)}</em></summary>
                <h3 className={s.suggestSub}>{t('Mazzi base', 'Starter decks')}</h3>
                <p className={u.muted}>{t('Quattro mazzi pronti, ciascuno con il suo Custode del Sigillo. Si giocano con la collezione iniziale: aggiungine una copia e modificala come vuoi.', 'Four ready-made decks, each with its own Custodian of the Seal. They play with the starting collection: add a copy and change it as you like.')}</p>
                <div className={s.presets}>
                    {PRESETS.map(pr0 => presetText(pr0, lang)).map(pr => (
                        <article key={pr.id} className={s.preset} style={{
                            ['--f1' as string]: FACTIONS[pr.fac[0]].col,
                            ['--f2' as string]: FACTIONS[pr.fac[1]].col
                        }}>
                            {pr.custode && <CustodePortrait id={pr.custode} className={s.presetPortrait}/>}
                            <div>
                                <h3>{pr.name}</h3>
                                <div className={s.presetMeta}>{pr.fac.map(f => <span key={f}
                                                                                     style={{color: FACTIONS[f].col}}><Glyph>{FACTION_GLYPH[f]}</Glyph>{factionName(f, lang)}</span>)}{pr.custode &&
                                    <em>{t(W.custodian)}: {custodeName(pr.custode, lang)}</em>}</div>
                                <p>{pr.blurb}</p>
                                <button className={`${u.btn} ${u.sm}`} disabled={p.decks.length >= 8} onClick={() => {
                                    const m = p.deck.addPreset(pr.id);
                                    toast(m || t(`${pr.name} aggiunto ai tuoi mazzi`, `${pr.name} added to your decks`));
                                }}>{p.decks.some(d => d.id === pr.id) ? t('Aggiungi un\'altra copia', 'Add another copy') : t(W.addToDecks)}</button>
                            </div>
                        </article>
                    ))}
                </div>
                <h3 className={s.suggestSub}>{t('Mazzi per archetipo', 'Archetype decks')}</h3>
                <p className={u.muted}>{t('Un modello per ogni stile di gioco. Aggiungine una copia: le carte che non possiedi restano segnate e puoi crearle dalla Collezione o sostituirle.', 'A template for every play style. Add a copy: cards you don\'t own stay marked and you can craft them from the Collection or replace them.')}</p>
                <div className={s.presets}>
                    {ARCHETYPES.map(ar0 => presetText(ar0, lang)).map(ar => {
                        const cnt = countMap(ar.cards),
                            miss = Object.entries(cnt).reduce((a, [id, n]) => a + Math.max(0, n - (p.owned[id] || 0)), 0);
                        return (
                            <article key={ar.id} className={s.preset} style={{
                                ['--f1' as string]: FACTIONS[ar.fac[0]].col,
                                ['--f2' as string]: FACTIONS[ar.fac[ar.fac.length - 1]].col
                            }}>
                                {ar.custode && <CustodePortrait id={ar.custode} className={s.presetPortrait}/>}
                                <div>
                                    <span className={s.archTag}>{ar.archetype}</span>
                                    <h3>{ar.name}</h3>
                                    <div className={s.presetMeta}>{ar.fac.map(f => <span key={f}
                                                                                         style={{color: FACTIONS[f].col}}><Glyph>{FACTION_GLYPH[f]}</Glyph>{factionName(f, lang)}</span>)}{ar.custode &&
                                        <em>{t(W.custodian)}: {custodeName(ar.custode, lang)}</em>}</div>
                                    <p>{ar.blurb}</p>
                                    <p className={miss ? s.missing : s.complete}>{miss ? t(`Ti mancano ${miss} carte su 30`, `You are missing ${miss} cards out of 30`) : t('Hai tutte le carte', 'You have all the cards')}</p>
                                    <button className={`${u.btn} ${u.sm}`} disabled={p.decks.length >= 8}
                                            onClick={() => {
                                                const m = p.deck.addPreset(ar.id);
                                                toast(m || t(`${ar.name} aggiunto ai tuoi mazzi`, `${ar.name} added to your decks`));
                                            }}>{t(W.addToDecks)}
                                    </button>
                                </div>
                            </article>);
                    })}
                </div>
            </details>
            <Confirm open={!!del} title={t('Eliminare il mazzo?', 'Delete the deck?')}
                     text={t(`"${p.decks.find(d => d.id === del)?.name ?? ''}" verrà eliminato. Le carte restano nella collezione.`, `"${p.decks.find(d => d.id === del)?.name ?? ''}" will be deleted. The cards stay in your collection.`)}
                     confirmLabel={t(W.delete)} onConfirm={() => del && p.deck.remove(del)} onClose={() => setDel(null)}/>
        </section>
    );
}

function DeckEditor({id, onDone}: { id: string; onDone: () => void }) {
    const p = useProfile();
    const d = p.decks.find(x => x.id === id)!;
    const [q, setQ] = useState(''), [cost, setCost] = useState<number | null>(null), [type, setType] = useState<CardType | null>(null);
    const [inspect, setInspect] = useState<string | null>(null);
    const t = useT(), lang = useLang(), en = lang === 'en';
    const nm = (cid: string) => cardName(cid, lang);
    const cnt = countMap(d.cards), iss = deckIssues(d, p.owned);
    const pool = useMemo(() => CARDS.filter(c => p.owned[c.id] && (!d.fac.length || d.fac.includes(c.f)) && (cost == null || (cost === 7 ? c.c >= 7 : c.c === cost)) && (!type || c.t === type) && (!q || (c.n + ' ' + c.tx + ' ' + nm(c.id)).toLowerCase().includes(q.toLowerCase())))
        .sort((a, b) => a.c - b.c || nm(a.id).localeCompare(nm(b.id))), [p.owned, d.fac, cost, type, q, lang]);
    const rows = Object.keys(cnt).sort((a, b) => BYID[a].c - BYID[b].c || nm(a).localeCompare(nm(b)));
    const msg = (m: string | void) => {
        if (m) toast(m);
    };
    return (
        <section className={`${u.page} ${s.editorPage}`}>
            <div className={s.editorHead}>
                <button className={u.btn} onClick={onDone}>← {t(W.decks)}</button>
                <input className={s.name} value={d.name} maxLength={32} aria-label={t('Nome del mazzo', 'Deck name')}
                       onChange={e => p.deck.update(id, {name: e.target.value})}/>
                <div className={s.facPick} role="group" aria-label={t('Fazioni del mazzo', 'Deck factions')}>
                    {FACS.map(f => (
                        <button key={f} className={s.facBtn} aria-pressed={d.fac.includes(f)}
                                style={{['--fc' as string]: FACTIONS[f].col}}
                                onClick={() => msg(p.deck.toggleFaction(id, f))}
                                title={`${factionName(f, lang)}: ${en ? EN_FACTION_LORE[f].motto : FACTION_LORE[f].motto}`}>
                            <Glyph>{FACTION_GLYPH[f]}</Glyph><span>{factionName(f, lang)}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className={s.custodi}>
                <div className={s.custodiHead}><h2>{t('Custode del Sigillo', 'Custodian of the Seal')}</h2><span>{t('L\'eroe del mazzo: un effetto sempre attivo e un Ultimo Rintocco personale.', 'The hero of the deck: an always-active effect and a personal Last Toll.')}</span>
                </div>
                <div className={s.custodiList}>
                    <button className={s.custOpt} aria-pressed={!d.custode}
                            onClick={() => p.deck.update(id, {custode: null})}>
                        <span className={s.noneCust}>–</span><span><b>{t('Nessun Custode', 'No Custodian')}</b><small>{t('Usa l\'Ultimo Rintocco della fazione principale.', 'Uses the Last Toll of the main faction.')}</small></span>
                    </button>
                    {(d.fac.length ? d.fac : FACS).flatMap(f => custodiOf(f)).map(cu => (
                        <button key={cu.id} className={s.custOpt} aria-pressed={d.custode === cu.id}
                                onClick={() => p.deck.update(id, {custode: cu.id})}>
                            <CustodePortrait id={cu.id}/><span><b>{en ? EN_CUSTODI[cu.id].name : cu.name}</b><small>{en ? EN_CUSTODI[cu.id].passive : cu.passive}</small></span>
                        </button>
                    ))}
                </div>
                {d.custode && <CustodeCard id={d.custode}/>}
            </div>
            <div className={s.backPick}>
                <div className={s.custodiHead}><h2>{t('Dorso del mazzo', 'Deck card back')}</h2>
                    <span>{p.backMode === 'deck' ? t('Ogni mazzo usa il proprio dorso.', 'Each deck uses its own card back.') : t('Stai usando un dorso unico per tutti i mazzi: cambialo nel Profilo, oppure passa ai dorsi per mazzo.', 'You are using one card back for all decks: change it in your Profile, or switch to per-deck backs.')}</span>
                    <button className={`${u.btn} ${u.sm}`}
                            onClick={() => p.setBackMode(p.backMode === 'deck' ? 'global' : 'deck')}>{p.backMode === 'deck' ? t('Usa un dorso per tutti', 'Use one back for all') : t('Scegli un dorso per ogni mazzo', 'Choose a back for each deck')}</button>
                </div>
                {p.backMode === 'deck' &&
                    <div className={s.backRow}>{p.backs.map(k => <button key={k} className={s.backOpt}
                                                                         aria-pressed={(d.back ?? p.back) === k}
                                                                         onClick={() => p.deck.update(id, {back: k})}
                                                                         title={(en ? EN_BACKS[k] : undefined) ?? BACKS[k]}><CardBack back={k}/>
                    </button>)}</div>}
            </div>
            <div className={s.editor}>
                <div>
                    <div className={s.filters}>
                        <input className={s.search} placeholder={t('Cerca per nome o testo…', 'Search by name or text…')} value={q}
                               onChange={e => setQ(e.target.value)} aria-label={t('Cerca carte', 'Search cards')}/>
                        <div className={s.costs} role="group" aria-label={t('Filtra per costo', 'Filter by cost')}>
                            {[0, 1, 2, 3, 4, 5, 6, 7].map(c => <button key={c} aria-pressed={cost === c}
                                                                       onClick={() => setCost(cost === c ? null : c)}>{c === 7 ? '7+' : c}</button>)}
                        </div>
                        <div className={u.row}>
                            {(['U', 'I', 'R'] as CardType[]).map(ty => <button key={ty} className={u.chip}
                                                                              aria-pressed={type === ty}
                                                                              onClick={() => setType(type === ty ? null : ty)}>
                                <Glyph>{TYPE_GLYPH[ty]}</Glyph>{typeName(ty, lang)}</button>)}
                        </div>
                    </div>
                    {!d.fac.length &&
                        <p className={s.hintBox}>{t('Scegli fino a due fazioni in alto, oppure tocca una carta qualsiasi: la sua fazione verrà aggiunta.', 'Choose up to two factions above, or tap any card: its faction will be added.')}</p>}
                    <div className={s.pool}>
                        {pool.map(c => {
                            const n = cnt[c.id] || 0, lim = Math.min(p.owned[c.id] || 0, RARITY[c.r].max),
                                full = n >= lim;
                            return (
                                <motion.button key={c.id} className={`${s.poolCard} ${full ? s.full : ''}`}
                                               onClick={() => msg(p.deck.add(id, c.id))}
                                               onContextMenu={e => {
                                                   e.preventDefault();
                                                   setInspect(c.id);
                                               }} whileHover={{y: -6}}
                                               whileTap={{scale: 0.96}}
                                               aria-label={t(`Aggiungi ${c.n}, ${n} di ${lim} (tasto destro per il dettaglio)`, `Add ${nm(c.id)}, ${n} of ${lim} (right-click for details)`)}>
                                    <span className={s.have}>{n}/{lim}</span><Card card={c} look={lookOf(p, c.id)}/>
                                </motion.button>);
                        })}
                        {!pool.length && <p className={u.muted}>{t('Nessuna carta con questi filtri.', 'No cards match these filters.')}</p>}
                    </div>
                </div>
                <aside className={s.side}>
                    <div className={s.sideTop}><Ring n={d.cards.length}/>
                        <div>{iss.length ? <span className={s.warn}>{iss[0]}</span> :
                            <span className={s.okTxt}>{t('Mazzo pronto', 'Deck ready')}</span>}
                            <div className={u.small + ' ' + u.muted}>{t('Tocca una riga per togliere la carta, clic destro (o tieni premuto) per vederne il dettaglio', 'Tap a row to remove the card, right-click (or long-press) to see its details')}</div>
                        </div>
                    </div>
                    <ManaCurve cards={d.cards} big/>
                    <div className={s.rows}>
                        <AnimatePresence initial={false}>
                            {rows.map(cid => {
                                const c = BYID[cid];
                                return (
                                    <motion.button key={cid} layout className={s.rowBtn}
                                                   style={{['--fc' as string]: FACTIONS[c.f].col}}
                                                   onClick={() => p.deck.removeCard(id, cid)}
                                                   onContextMenu={e => {
                                                       e.preventDefault();
                                                       setInspect(cid);
                                                   }}
                                                   aria-label={t(`Togli ${c.n} (tasto destro per il dettaglio)`, `Remove ${nm(cid)} (right-click for details)`)}
                                                   initial={{opacity: 0, x: 30}} animate={{opacity: 1, x: 0}}
                                                   exit={{opacity: 0, x: 30}}>
                                        <span className={s.rowArt}><CardArt id={cid} style={lookOf(p, cid).art}
                                                                            arch={false}/></span>
                                        <StatGem kind="cost" value={c.c} className={s.rowCost}/>
                                        <span className={s.rowName}>{nm(cid)}</span>
                                        <RarityGem r={c.r} className={s.rowGem}/>
                                        <span className={s.rowN}>{cnt[cid] > 1 ? `×${cnt[cid]}` : ''}</span>
                                    </motion.button>);
                            })}
                        </AnimatePresence>
                        {!rows.length && <p className={u.muted}>{t('Il mazzo è vuoto.', 'The deck is empty.')}</p>}
                    </div>
                    <div className={u.row}>
                        <button className={`${u.btn} ${u.sm}`} disabled={d.cards.length >= 30 || !d.fac.length}
                                onClick={() => p.deck.fill(id)}>{t('Completa automaticamente', 'Auto-complete')}
                        </button>
                        <button className={`${u.btn} ${u.sm}`} disabled={!d.cards.length}
                                onClick={() => p.deck.update(id, {cards: []})}>{t('Svuota', 'Clear')}
                        </button>
                    </div>
                </aside>
            </div>
            <CardDetail id={inspect} onClose={() => setInspect(null)} onOpen={setInspect}/>
        </section>
    );
}
