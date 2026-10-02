import {memo} from 'react';
import {FACTIONS, KEYWORDS, RARITY} from '../engine/cards';
import {synergiesOf} from '../engine/mechanics';
import type {CardDef} from '../engine/types';
import {EN_CARDS} from '../i18n/en/cards';
import {EN_FACTION_NAMES, EN_KEYWORD_WORD, EN_KEYWORDS, EN_SYNERGIES} from '../i18n/en/mechanics';
import {EN_LORE} from '../i18n/en/lore';
import {useLang} from '../i18n/lang';
import {cardName, rarityName, typeName} from '../i18n/names';
import {CardArt} from './art/CardArt';
import {hasIllustration} from './art/illustrations';
import {Icon, kwIcon, RichText, splitText} from './cardText';
import {EffectLayer} from './CardFx';
import {FACTION_GLYPH, Glyph, HEART, RarityGem, SWORD, TYPE_GLYPH} from './glyphs';
import {loreOf} from './lore';
import {type CardLook, DEFAULT_ART, defaultArt} from './styles';
import s from './card.module.css';

export interface CardProps {
    card: CardDef;
    look?: CardLook;
    cost?: number;
    atk?: number;
    hp?: number;
    className?: string;
    mini?: boolean;
    kws?: string[]
}

function track(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect(), st = e.currentTarget.style;
    st.setProperty('--px', ((e.clientX - r.left) / r.width).toFixed(3));
    st.setProperty('--py', ((e.clientY - r.top) / r.height).toFixed(3));
}

function reset(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.style.setProperty('--px', '.5');
    e.currentTarget.style.setProperty('--py', '.5');
}

/** Costo: una scheggia di cristallo con il numero, il segno distintivo di Rosarcana. */
function CostShard({v, delta}: { v: number; delta: number }) {
    return (
        <span className={s.shard} data-delta={delta < 0 ? 'up' : delta > 0 ? 'down' : undefined}
              aria-label={`Costo ${v}`}>
      <svg viewBox="0 0 20 28" aria-hidden="true"><path d="M10 .8 18.6 8v12L10 27.2 1.4 20V8Z"/><path
          d="M10 .8V27.2M1.4 8 10 11.5 18.6 8" className={s.facet}/></svg>
      <b>{v}</b>
    </span>
    );
}

/**
 * Modello unico per tutte le carte (a tutta illustrazione, per ogni stile):
 * barra del titolo con nome, costo e stemma; in basso la riga del tipo, un riquadro di testo alto quanto basta
 * e la targa di attacco e salute.
 */
export const Card = memo(function Card({card: c, look, cost, atk, hp, className, mini, kws: miniKws}: CardProps) {
    const lang = useLang();
    const loc = lang === 'en' ? EN_CARDS[c.id] : undefined;
    const name = loc?.n ?? c.n;
    const art = look?.art === 'illustrata' && !hasIllustration(c.id) ? DEFAULT_ART : look?.art ?? defaultArt(c.id);
    const cc = cost ?? c.c, a = atk ?? c.a, h = hp ?? c.h;
    const F = FACTIONS[c.f], facName = lang === 'en' ? EN_FACTION_NAMES[c.f] : F.name,
        tName = typeName(c.t, lang),
        rarName = rarityName(c.r, lang);
    const {kws, rest} = splitText(loc?.tx ?? c.tx, c.kw, lang);
    const flavor = !rest && !kws.length
        ? (lang === 'en' ? EN_LORE[c.id]?.flavor : loreOf(c.id)?.flavor) : undefined;
    const otherName = (id: string) => cardName(id, lang);
    const syn = synergiesOf(c.id).map(x => otherName(x.a === c.id ? x.b : x.a));
    const kwWord = (k: string) => (lang === 'en' ? EN_KEYWORD_WORD[k as keyof typeof EN_KEYWORD_WORD] : undefined) ?? k;
    const offerLabel = (k: string) => k === 'Offerta' && c.offer ? `${kwWord(k)} ${c.offer}` : kwWord(k);
    const len = rest.length + kws.length * 12 + (flavor ? flavor.length : 0) + (syn.length ? 20 : 0);
    const dense = len > 110 ? s.dense : len > 70 ? s.mid : '';
    return (
        <div className={`${s.cw} ${className ?? ''}`}>
            <div className={`${s.card} ${s['r' + c.r]} ${mini ? s.mini : ''}`} data-style={art} data-type={c.t}
                 style={{
                     ['--rar' as string]: RARITY[c.r].color,
                     ['--fac' as string]: F.col,
                     ['--fac2' as string]: F.col2
                 }}
                 onPointerMove={look?.effect ? track : undefined} onPointerLeave={look?.effect ? reset : undefined}>
                <div className={s.art}><CardArt id={c.id} style={art} arch={false}/></div>
                <div className={`${s.name} ${name.length > 22 ? s.longer : name.length > 16 ? s.long : ''}`}>
                    <span className={s.nm}>{name}</span>
                    {!mini && <CostShard v={cc} delta={cc - c.c}/>}
                    <span className={s.tFac}
                          title={`${lang === 'en' ? 'Faction' : 'Fazione'}: ${facName}`}><Glyph>{FACTION_GLYPH[c.f]}</Glyph></span>
                </div>
                {mini && miniKws && miniKws.length > 0 &&
                    <div className={s.miniKw}>{miniKws.map(k => <span key={k} title={kwWord(k)}><Icon
                        k={`kw-${k}`}/></span>)}</div>}
                {!mini && <div className={s.bottom}>
                    <div className={s.type}>
                        <Glyph className={s.tIcon}>{TYPE_GLYPH[c.t]}</Glyph>
                        <span className={s.tName}>{tName} · <em>{facName}</em></span>
                        <span
                            title={`${lang === 'en' ? 'Rarity' : 'Rarità'}: ${rarName}`}><RarityGem r={c.r} className={s.gem}/></span>
                    </div>
                    {(kws.length > 0 || rest || flavor || syn.length > 0) && <div className={`${s.body} ${dense}`}>
                        {kws.length > 0 && <div className={s.kw}>{kws.map((k, i) => <span key={k}
                                                                                          data-tip={lang === 'en' ? EN_KEYWORDS[k] : KEYWORDS[k as keyof typeof KEYWORDS]}
                                                                                          data-tip-title={offerLabel(k)}
                                                                                          className={s.tipped}>{i > 0 && ' · '}<Icon
                            k={kwIcon(k)}
                            className={s.kwIcon}/><b>{offerLabel(k)}</b></span>)}</div>}
                        {rest && <div className={s.text}><RichText text={rest} lang={lang}/></div>}
                        {flavor && <div className={s.flavor}>{flavor}</div>}
                        {syn.length > 0 && <div className={`${s.syn} ${s.tipped}`}
                                                data-tip-title={lang === 'en' ? 'Synergy' : 'Sincronia'}
                                                data-tip={synergiesOf(c.id).map(x => {
                                                    const t = lang === 'en' ? EN_SYNERGIES[x.id] : undefined;
                                                    return `${t?.name ?? x.name}: ${t?.text ?? x.text}`;
                                                }).join(' ')}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    d="M9.5 14.5 14.5 9.5M8 11l-2 2a3.5 3.5 0 0 0 5 5l2-2M16 13l2-2a3.5 3.5 0 0 0-5-5l-2 2"
                                    fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"/>
                            </svg>
                            {syn.join(', ')}</div>}
                    </div>}
                </div>}
                {c.t === 'U' && (
                    <div className={s.pt}
                         aria-label={lang === 'en' ? `Attack ${a}, health ${h}` : `Attacco ${a}, salute ${h}`}>
                        <span className={s.ptA}
                              data-delta={a > c.a ? 'up' : a < c.a ? 'down' : undefined}><Glyph>{SWORD}</Glyph>{a}</span>
                        <i/>
                        <span className={s.ptH}
                              data-delta={h > c.h ? 'up' : h < c.h ? 'down' : undefined}><Glyph>{HEART}</Glyph>{h}</span>
                    </div>
                )}
                <EffectLayer effect={look?.effect ?? null}/>
            </div>
        </div>
    );
});
