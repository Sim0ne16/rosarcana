import {defaultArt} from '../../cards/styles';
import {useMemo} from 'react';
import {CardArt, Rose} from '../../cards/art/CardArt';
import {rose} from '../../cards/art/rose';
import {siteImg} from '../../cards/art/site';
import {SET} from '../../engine/cards';
import s from './packart.module.css';

const SEAL = ['#3a0f1a', '#8e2226', '#d9a943', '#ffe7a6'];

/** La bustina: involucro in lamina dorata con bordi zigrinati, finestra dipinta e sigillo di ceralacca. */
export function PackArt({art, part = 'all'}: { art?: string; part?: 'all' | 'top' | 'bottom' }) {
    const seal = useMemo(() => rose(SEAL, {n: 12, label: 'R', core: 17, fs: 22, ly: 57}), []);
    return (
        <div className={s.cw}>
            <div className={`${s.pack} ${part !== 'all' ? s[part] : ''}`}>
                <div className={s.crimp}/>
                <div className={s.body}>
                    <div className={s.window}>{!art && siteImg('bustina') ? <img src={siteImg('bustina')} alt=""/> :
                        <CardArt id={art ?? 'vuoto-l0'} style={defaultArt(art ?? 'vuoto-l0')} arch={false}/>}</div>
                    <div className={s.title}>Rosarcana</div>
                    <div className={s.sub}>{SET.name}, 5 carte</div>
                    <div className={s.seal}><Rose svg={seal}/></div>
                </div>
                <div className={`${s.crimp} ${s.crimpB}`}/>
                <div className={s.sheen} aria-hidden="true"/>
            </div>
        </div>
    );
}
