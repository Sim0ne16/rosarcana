import {useMemo} from 'react';
import {Rose} from '../../cards/art/CardArt';
import {rose} from '../../cards/art/rose';
import {BACK_PAL} from '../../cards/art/palettes';
import {useProfile} from '../../profile/store';
import {siteImg} from '../../cards/art/site';
import s from './battle.module.css';

export function CardBack({back}: { back?: string }) {
    const mine = useProfile(st => st.back);
    const k = back ?? mine;
    const svg = useMemo(() => rose(BACK_PAL[k] ?? BACK_PAL.cera, {n: 16, label: 'R', core: 17, fs: 24, ly: 58}), [k]);
    const img = siteImg(`back-${k}`);
    if (img) return <div className={s.back} style={{padding: 0}}><img src={img} alt="" draggable={false} style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: 'inherit',
        display: 'block'
    }}/></div>;
    return <div className={s.back}><Rose svg={svg} className={s.backRose}/></div>;
}
