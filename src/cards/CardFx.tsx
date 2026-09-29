// Livelli cosmetici: effetti animati (sopra l'illustrazione) e cornici.
import {memo} from 'react';
import {ImageFrame, Miniature} from './Frames';
import {siteImg} from './art/site';
import {type EffectId, type FrameId, FRAMES} from './styles';
import s from './fx.module.css';


export const EffectLayer = memo(function EffectLayer({effect}: { effect: EffectId | null }) {
    if (!effect) return null;
    if (effect === 'orofuso') return <div className={s.gold} aria-hidden="true"><i/></div>;
    if (effect === 'alone') return <div className={s.halo} aria-hidden="true"/>;
    if (effect === 'luce') return <div className={s.gleam} aria-hidden="true"/>;
    return null;
});

/** Cornice: vive (animate) o di maestria (miniatura). Restano dentro la carta, sia intera sia sul tavolo. */
export const FrameLayer = memo(function FrameLayer({frame}: { frame: FrameId | null; ornate?: boolean }) {
    if (!frame || !FRAMES[frame]) return null;
    const img = siteImg(`frame-${frame}`);
    if (img) return <ImageFrame src={img}/>;
    const level = FRAMES[frame].level;
    return level ? <Miniature level={level}/> : null;
});
