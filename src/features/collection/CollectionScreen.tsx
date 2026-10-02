import {SET} from '../../engine/cards';
import {useMemo, useState} from 'react';
import {CARDS, type CardType, type Faction, FACTIONS, type Keyword, KEYWORDS, RARITY, type Rarity, TOTAL_COPIES, TYPES} from '../../engine';
import {Card} from '../../cards/Card';
import {lookOf, useProfile} from '../../profile/store';
import {CardDetail} from './CardDetail';
import {Chronicles} from './Chronicles';
import {Codex} from './Codex';
import {PageHeader} from '../../ui/PageHeader';
import {FACTION_GLYPH, Glyph, RarityGem} from '../../cards/glyphs';
import {Icon, kwIcon, typeIcon} from '../../cards/cardText';
import {useLang, useT} from '../../i18n/lang';
import {cardName, factionName, rarityName, typeName} from '../../i18n/names';
import {EN_KEYWORD_WORD, EN_KEYWORDS, EN_SET_NAME} from '../../i18n/en/mechanics';
import {COSTS, costMatch, EFFECT_TAGS, type EffectTag, hasEffect, matchesQuery} from './filters';

import u from '../../ui/ui.module.css';
import s from './collection.module.css';

type Sort = 'set' | 'cost' | 'name' | 'rarity' | 'owned';
const RAR_ORDER: Rarity[] = ['l', 'r', 'u', 'c'];
const toggle = <T, >(xs: T[], x: T) => (xs.includes(x) ? xs.filter(y => y !== x) : [...xs, x]);

export function CollectionScreen() {
    const p = useProfile();
    const [f, setF] = useState<Faction | 'all'>('all'), [r, setR] = useState<Rarity | 'all'>('all'), [o, setO] = useState<'all' | 'own' | 'miss'>('all');
    const [q, setQ] = useState(''), [type, setType] = useState<CardType | null>(null), [cost, setCost] = useState<number | null>(null);
    const [kws, setKws] = useState<Keyword[]>([]), [fx, setFx] = useState<EffectTag[]>([]), [sort, setSort] = useState<Sort>('set');
    const [more, setMore] = useState(false);
    const [open, setOpen] = useState<string | null>(null), [chron, setChron] = useState(false), [codex, setCodex] = useState(false);
    const t = useT(), lang = useLang(), en = lang === 'en';
    const list = useMemo(() => {
        const nm = (id: string) => cardName(id, lang);
        const out = CARDS.filter(c => (f === 'all' || c.f === f) && (r === 'all' || c.r === r)
            && (o === 'all' || (o === 'own' ? p.owned[c.id] : (p.owned[c.id] || 0) < RARITY[c.r].max))
            && (!type || c.t === type) && (cost == null || costMatch(c, cost))
            && kws.every(k => c.kw.includes(k)) && fx.every(e => hasEffect(c, e)) && matchesQuery(c, q));
        if (sort === 'cost') out.sort((a, b) => a.c - b.c || nm(a.id).localeCompare(nm(b.id)));
        if (sort === 'name') out.sort((a, b) => nm(a.id).localeCompare(nm(b.id)));
        if (sort === 'rarity') out.sort((a, b) => RAR_ORDER.indexOf(a.r) - RAR_ORDER.indexOf(b.r) || a.c - b.c);
        if (sort === 'owned') out.sort((a, b) => (p.owned[b.id] || 0) - (p.owned[a.id] || 0) || a.c - b.c);
        return out;
    }, [f, r, o, type, cost, kws, fx, q, sort, p.owned, lang]);
    const copies = CARDS.reduce((n, c) => n + (p.owned[c.id] || 0), 0),
        unique = CARDS.filter(c => p.owned[c.id]).length;
    const advanced = kws.length + fx.length;
    const active = (f !== 'all' ? 1 : 0) + (r !== 'all' ? 1 : 0) + (o !== 'all' ? 1 : 0) + (type ? 1 : 0) + (cost != null ? 1 : 0) + advanced + (q.trim() ? 1 : 0);
    const reset = () => {
        setF('all');
        setR('all');
        setO('all');
        setQ('');
        setType(null);
        setCost(null);
        setKws([]);
        setFx([]);
    };
    return (
        <section className={u.page}>
            <PageHeader title={t('Collezione', 'Collection')}
                        sub={t(`${SET.name}: ${unique} carte diverse su ${CARDS.length}, ${copies} copie su ${TOTAL_COPIES}. Tocca una carta per leggerne la storia, crearla o personalizzarla.`,
                            `${EN_SET_NAME}: ${unique} different cards out of ${CARDS.length}, ${copies} copies out of ${TOTAL_COPIES}. Tap a card to read its story, craft it or customise it.`)}>
                <button className={`${u.btn} ${u.primary}`} onClick={() => setChron(true)}>{t('Cronache della Rosa', 'Chronicles of the Rose')}</button>
                <button className={u.btn} onClick={() => setCodex(true)}>Codex</button>
            </PageHeader>
            <div className={s.filters}>
                <div className={s.searchRow}>
                    <input className={s.search} type="search" value={q} onChange={e => setQ(e.target.value)}
                           placeholder={t('Cerca per nome, testo o parola chiave…', 'Search by name, text or keyword…')}
                           aria-label={t('Cerca carte', 'Search cards')}/>
                    <label className={s.sortWrap}>
                        <span>{t('Ordina', 'Sort')}</span>
                        <select value={sort} onChange={e => setSort(e.target.value as Sort)}>
                            <option value="set">{t('Ordine del set', 'Set order')}</option>
                            <option value="cost">{t('Costo', 'Cost')}</option>
                            <option value="name">{t('Nome', 'Name')}</option>
                            <option value="rarity">{t('Rarità', 'Rarity')}</option>
                            <option value="owned">{t('Copie possedute', 'Copies owned')}</option>
                        </select>
                    </label>
                </div>
                <div className={s.fRow}>
                    <span className={s.fLabel}>{t('Fazione', 'Faction')}</span>
                    {(Object.keys(FACTIONS) as Faction[]).map(k => <button key={k} className={u.chip} aria-pressed={f === k}
                                                                           onClick={() => setF(f === k ? 'all' : k)}>
                        <Glyph>{FACTION_GLYPH[k]}</Glyph>{factionName(k, lang)}</button>)}
                </div>
                <div className={s.fRow}>
                    <span className={s.fLabel}>{t('Rarità', 'Rarity')}</span>
                    {(Object.keys(RARITY) as Rarity[]).map(k => <button key={k} className={u.chip} aria-pressed={r === k}
                                                                        onClick={() => setR(r === k ? 'all' : k)}><RarityGem
                        r={k}/>{rarityName(k, lang)}</button>)}
                </div>
                <div className={s.fRow}>
                    <span className={s.fLabel}>{t('Tipo', 'Type')}</span>
                    {(Object.keys(TYPES) as CardType[]).map(k => <button key={k} className={u.chip} aria-pressed={type === k}
                                                                         onClick={() => setType(type === k ? null : k)}>
                        <Icon k={typeIcon(k)}/>{typeName(k, lang)}</button>)}
                    <span className={`${s.fLabel} ${s.gap}`}>{t('Costo', 'Cost')}</span>
                    {COSTS.map(n => <button key={n} className={`${u.chip} ${s.cost}`} aria-pressed={cost === n}
                                            onClick={() => setCost(cost === n ? null : n)}>{n === 7 ? '7+' : n}</button>)}
                </div>
                <div className={s.fRow}>
                    <span className={s.fLabel}>{t('Copie', 'Copies')}</span>
                    {([['own', t('Possedute', 'Owned')], ['miss', t('Da completare', 'Incomplete')]] as const).map(([k, l]) => <button
                        key={k} className={u.chip} aria-pressed={o === k} onClick={() => setO(o === k ? 'all' : k)}>{l}</button>)}
                    <button className={`${u.chip} ${s.moreBtn}`} aria-expanded={more} onClick={() => setMore(!more)}>
                        {t('Parole chiave ed effetti', 'Keywords and effects')}{advanced ? ` (${advanced})` : ''} {more ? '▴' : '▾'}</button>
                </div>
                {more && <div className={s.advanced}>
                    <div className={s.fRow}>
                        <span className={s.fLabel}>{t('Parole chiave', 'Keywords')}</span>
                        {(Object.keys(KEYWORDS) as Keyword[]).map(k => <button key={k} className={u.chip} aria-pressed={kws.includes(k)}
                                                                               title={en ? EN_KEYWORDS[k] : KEYWORDS[k]}
                                                                               onClick={() => setKws(toggle(kws, k))}>
                            <Icon k={kwIcon(k)}/>{en ? EN_KEYWORD_WORD[k] : k}</button>)}
                    </div>
                    <div className={s.fRow}>
                        <span className={s.fLabel}>{t('Effetti', 'Effects')}</span>
                        {(Object.keys(EFFECT_TAGS) as EffectTag[]).map(k => <button key={k} className={u.chip} aria-pressed={fx.includes(k)}
                                                                                    onClick={() => setFx(toggle(fx, k))}>{EFFECT_TAGS[k][en ? 'en' : 'it']}</button>)}
                    </div>
                    <p className={`${u.muted} ${u.small}`}>{t('Con più scelte, la carta deve averle tutte.', 'With several picks, a card must have all of them.')}</p>
                </div>}
                <div className={s.resultRow}>
                    <span>{list.length === 1 ? t('1 carta', '1 card') : t(`${list.length} carte`, `${list.length} cards`)}</span>
                    {active > 0 && <button className={s.reset} onClick={reset}>{t(`Azzera filtri (${active})`, `Clear filters (${active})`)}</button>}
                </div>
            </div>
            {list.length ? (
                <div className={u.cards}>
                    {list.map(c => {
                        const n = p.owned[c.id] || 0, lk = lookOf(p, c.id);
                        return <button key={c.id} className={`${u.cardBtn} ${n ? '' : u.none}`}
                                       onClick={() => setOpen(c.id)}
                                       aria-label={t(`${c.n}, possedute ${n} di ${RARITY[c.r].max}`, `${cardName(c.id, lang)}, owned ${n} of ${RARITY[c.r].max}`)}>
                            <span className={u.count}>{n}/{RARITY[c.r].max}</span>
                            {p.firstEd?.includes(c.id) && <span className={u.firstEd} title={t('Prima edizione: la possedevi prima che la community la cambiasse', 'First edition: you owned it before the community changed it')}>{t('1ª ed.', '1st ed.')}</span>}
                            <Card card={c} look={lk}/></button>;
                    })}
                </div>
            ) : <p className={u.panel}>{t('Nessuna carta corrisponde ai filtri.', 'No cards match the filters.')}{' '}
                {active > 0 && <button className={s.reset} onClick={reset}>{t('Azzera filtri', 'Clear filters')}</button>}</p>}
            <p className={`${u.muted} ${u.small}`} style={{marginTop: 28}}>{t('Le figure delle vetrate e delle incisioni derivano dalle icone di game-icons.net (Lorc, Delapouite e altri autori), licenza CC BY 3.0.', 'The stained-glass and engraving figures are based on icons from game-icons.net (Lorc, Delapouite and other authors), CC BY 3.0 licence.')}</p>
            <CardDetail id={open} onClose={() => setOpen(null)} onOpen={setOpen}/>
            <Chronicles open={chron} onClose={() => setChron(false)}/>
            <Codex open={codex} onClose={() => setCodex(false)} onOpen={id => {
                setCodex(false);
                setOpen(id);
            }}/>
        </section>
    );
}
