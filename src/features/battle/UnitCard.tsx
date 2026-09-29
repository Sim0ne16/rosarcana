import {motion} from 'framer-motion';
import {memo} from 'react';
import {activeSynergies, cardInfo, type Game, hasKw, uAtk, uMax, type Unit} from '../../engine';
import {Card} from '../../cards/Card';
import {defaultArt} from '../../cards/styles';
import {lookOf, useProfile} from '../../profile/store';
import {Floaters} from './Floaters';
import {dropAt, pointOf} from './dnd';
import {moveTargets, useBattle} from './store';
import s from './battle.module.css';

interface Props {
    G: Game;
    p: number;
    l: number;
    u: Unit;
    targetable: boolean
}

/** Unità sul tavolo: la stessa carta del giocatore (stile, effetto, cornice) in formato ridotto, senza testo. */
export const UnitCard = memo(function UnitCard({G, p, l, u, targetable}: Props) {
    const c = cardInfo(u.id);
    const look = useProfile(st => (p === 0 && !c.token ? lookOf(st, u.id) : null));
    const lk = look ?? {art: defaultArt(u.id), effect: null, frame: null};
    const attacking = useBattle(st => st.attacking?.uid === u.uid);
    const fx = useBattle(st => st.fx).filter(f => f.uid === u.uid);
    const selected = useBattle(st => st.sel?.kind === 'unit' && st.sel.uid === u.uid);
    const b = useBattle.getState;
    const lensOn = useBattle(st => st.lens);
    const a = uAtk(G, p, l, u), mh = uMax(G, p, l, u), hp = mh - u.dmg;
    const kws: string[] = [...u.kw];
    if (!kws.includes('Rapido') && hasKw(G, p, u, 'Rapido')) kws.push('Rapido');
    const sleepy = u.sick && !hasKw(G, p, u, 'Rapido') && G.active === p;
    const canDrag = p === 0 && G.active === 0 && G.phase === 'main' && moveTargets(G, 0, u.uid).length > 0;
    const hurt = fx.some(f => f.kind === 'dmg');
    const syn = activeSynergies(G, p, u);
    const show = (el: Element) => {
        const r = el.getBoundingClientRect();
        b().setPreview({id: u.id, uid: u.uid, rect: {x: r.left, y: r.top, w: r.width, h: r.height}});
    };
    return (
        <motion.div layoutId={`card-${u.uid}`} layout="position"
                    className={`${s.unit} ${targetable ? s.targetable : ''} ${selected ? s.selected : ''} ${sleepy ? s.sleepy : ''} ${u.asc ? s.ascended : ''} ${syn.length ? s.synced : ''}`}
                    data-drop={`unit:${u.uid}`} data-tut={`unit:${u.id}`} role="button" tabIndex={0}
                    aria-label={`${c.n}, attacco ${a}, salute ${hp}`}
                    initial={{opacity: 0, scale: 0.6}}
                    animate={{
                        opacity: 1,
                        scale: attacking ? 1.08 : 1,
                        y: attacking ? (p === 0 ? -26 : 26) : 0,
                        x: hurt ? [0, -3, 3, 0] : 0,
                        rotate: 0,
                        zIndex: attacking ? 20 : 1
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.4,
                        rotate: p === 0 ? -12 : 12,
                        filter: 'grayscale(1) brightness(2.2) blur(2px)',
                        transition: {duration: 0.55}
                    }}
                    transition={{type: 'spring', stiffness: 420, damping: 28}}
                    drag={canDrag && !lensOn} dragSnapToOrigin dragElastic={0.6}
                    whileDrag={{scale: 1.1, zIndex: 60, rotate: 0}}
                    onDragStart={() => {
                        b().setDragging(u.uid);
                        b().setPreview(null);
                    }}
                    onDragEnd={e => {
                        const [x, y] = pointOf(e as PointerEvent);
                        b().dropUnit(u.uid, dropAt(x, y, `unit:${u.uid}`));
                    }}
                    onClick={e => {
                        if (b().lens) {
                            b().inspect({id: u.id, uid: u.uid, p});
                            return;
                        }
                        b().clickUnit(u.uid);
                        show(e.currentTarget);
                    }}
                    onContextMenu={e => {
                        e.preventDefault();
                        b().inspect({id: u.id, uid: u.uid, p});
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Enter') b().clickUnit(u.uid);
                    }}
                    onHoverStart={e => {
                        if ((e as PointerEvent).pointerType !== 'touch') show((e.target as Element).closest('[data-drop]') ?? (e.target as Element));
                    }}
                    onHoverEnd={() => {
                        const pv = b().preview;
                        if (pv?.uid === u.uid) b().setPreview(null);
                    }}>
            <Card card={c} look={lk} atk={a} hp={hp} mini kws={kws}/>
            {syn.length > 0 && <span className={s.usyn} title={`Sincronia: ${syn.map(x => x.name).join(', ')}`}><svg
                viewBox="0 0 24 24" aria-hidden="true"><path
                d="M9.5 14.5 14.5 9.5M8 11l-2 2a3.5 3.5 0 0 0 5 5l2-2M16 13l2-2a3.5 3.5 0 0 0-5-5l-2 2" fill="none"
                stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg></span>}
            {u.asc && <span className={s.uasc} title="Ascesa">♛</span>}
            {(sleepy || u.stun) && <div className={s.zz}>{u.stun ? 'stordita' : 'in attesa'}</div>}
            {hp < mh && <span className={s.hurtBar} style={{width: `${(hp / mh) * 100}%`}}/>}
            <Floaters fx={fx}/>
        </motion.div>
    );
});
