import {memo} from 'react';
import {type CustodeId, CUSTODI} from '../../engine';
import {CardArt} from '../../cards/art/CardArt';
import {siteImg} from '../../cards/art/site';
import {ImageFrame} from '../../cards/Frames';
import {FRAME_HOLES} from '../../cards/frameHoles';
import {defaultArt} from '../../cards/styles';
import {useProfile} from '../../profile/store';
import s from './avatar.module.css';

const PORTRAIT: Partial<Record<CustodeId, string>> = {veggente: 'cassandra', guardaboschi: 'uomoverde'};

/** Immagine di un ritratto: un Custode (ritratto dedicato) oppure l'illustrazione di una carta. */
export function portraitSrc(id: string): JSX.Element {
    if (id in CUSTODI) {
        const img = siteImg(`custode-${PORTRAIT[id as CustodeId] ?? id}`);
        if (img) return <img src={img} alt="" draggable={false}/>;
        return <CardArt id={CUSTODI[id as CustodeId].art} style={defaultArt(CUSTODI[id as CustodeId].art)}
                        arch={false}/>;
    }
    return <CardArt id={id} style={defaultArt(id)} arch={false}/>;
}

/** Ritratto del giocatore con la cornice del profilo scelta. */
export const Avatar = memo(function Avatar({width = 64, avatar, frame}: {
    width?: number;
    avatar?: string;
    frame?: string | null
}) {
    const p = useProfile();
    const av = avatar ?? p.avatar ?? 'vesta', fr = frame === undefined ? p.pframe : frame;
    const img = fr ? siteImg(`frame-${fr}`) : undefined;
    return (
        <span className={s.av} style={{width, ['--w' as string]: `${width}px`}}>
      <span className={s.pic}>{portraitSrc(av)}</span>
            {img && FRAME_HOLES[fr!] ? <ImageFrame src={img} hole={FRAME_HOLES[fr!]}/> : <span className={s.plain}/>}
    </span>
    );
});
